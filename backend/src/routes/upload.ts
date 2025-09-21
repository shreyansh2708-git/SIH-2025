import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises'; // Use promises for async operations
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken, requireAnyRole, AuthRequest } from '../middleware/auth';
import { PrismaClient, Issue } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// --- SETUP: Centralized Configuration ---
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const imageDir = path.join(uploadDir, 'images');
const audioDir = path.join(uploadDir, 'audio');

// Asynchronously ensure directories exist on startup
Promise.all([
  fs.mkdir(imageDir, { recursive: true }),
  fs.mkdir(audioDir, { recursive: true })
]).catch(console.error);


// --- REFACTOR 1: Reusable Multer Configuration ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = file.mimetype.startsWith('image/') ? imageDir : audioDir;
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and audio files are allowed.'));
    }
  },
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  },
});


// --- REFACTOR 2: Helper Functions for Cleaner Logic ---

/**
 * Safely deletes one or more uploaded files.
 * @param files A single file or an array of files.
 */
const cleanupFiles = async (files: Express.Multer.File[] | Express.Multer.File | undefined) => {
  if (!files) return;
  const fileArray = Array.isArray(files) ? files : [files];
  for (const file of fileArray) {
    try {
      await fs.unlink(file.path);
    } catch (error) {
      console.error(`Failed to delete file: ${file.path}`, error);
    }
  }
};

/**
 * Processes an image file with Sharp: resizes and optimizes.
 * @returns The path and size of the processed file.
 */
const processImage = async (file: Express.Multer.File): Promise<{ newPath: string; newSize: number }> => {
  const processedPath = path.join(imageDir, `processed_${file.filename}`);
  
  await sharp(file.path)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85, progressive: true })
    .toFile(processedPath);

  const newSize = (await fs.stat(processedPath)).size;

  // Replace original with processed file
  await fs.unlink(file.path);
  await fs.rename(processedPath, file.path);
  
  return { newPath: file.path, newSize };
};

/**
 * Checks if an issue exists and if the user has permission to modify it.
 * @returns The issue object if validation passes.
 * @throws An error if the issue is not found or access is denied.
 */
const validateIssueAccess = async (issueId: string, user: AuthRequest['user']): Promise<Issue> => {
    if (!issueId) {
        throw { status: 400, message: 'Issue ID is required' };
    }
    const issue = await prisma.issue.findUnique({ where: { id: issueId } });
    if (!issue) {
        throw { status: 404, message: 'Issue not found' };
    }
    if (user!.role === 'CITIZEN' && issue.reporterId !== user!.id) {
        throw { status: 403, message: 'Access denied' };
    }
    return issue;
};


// --- REFACTOR 3: Unified Upload Handler ---
const handleUpload = async (req: AuthRequest, res: express.Response) => {
  const files = (req.files as Express.Multer.File[] || (req.file ? [req.file] : []));
  
  try {
    if (files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { issueId } = req.body;
    await validateIssueAccess(issueId, req.user);

    const attachments = [];
    for (const file of files) {
      let finalFile = { ...file };
      let finalSize = file.size;

      if (file.mimetype.startsWith('image/')) {
        try {
          const { newSize } = await processImage(file);
          finalSize = newSize;
        } catch (procError) {
          console.error('Image processing error, using original:', procError);
        }
      }
      
      const attachmentType = finalFile.mimetype.startsWith('image/') ? 'image' : 'audio';
      const finalUrl = `/uploads/${attachmentType}s/${finalFile.filename}`;

      const attachment = await prisma.issueAttachment.create({
        data: {
          filename: finalFile.filename,
          originalName: finalFile.originalname,
          mimeType: finalFile.mimetype,
          size: finalSize,
          url: finalUrl,
          type: attachmentType,
          issueId,
        },
        select: { id: true, filename: true, originalName: true, mimeType: true, size: true, url: true, type: true },
      });
      attachments.push(attachment);
    }
    
    return res.status(201).json({
      message: `${attachments.length} file(s) uploaded successfully`,
      attachments,
    });

  } catch (error: any) {
    await cleanupFiles(files); // Clean up files on any error
    console.error('Upload error:', error);
    return res.status(error.status || 500).json({ error: error.message || 'File upload failed' });
  }
};

// Use the unified handler for both single and multiple file uploads
router.post('/single', authenticateToken, requireAnyRole, upload.single('file'), handleUpload);
router.post('/multiple', authenticateToken, requireAnyRole, upload.array('files', 5), handleUpload);


// Delete attachment
router.delete('/:attachmentId', authenticateToken, requireAnyRole, async (req: AuthRequest, res) => {
  try {
    const { attachmentId } = req.params;
    const attachment = await prisma.issueAttachment.findUnique({
      where: { id: attachmentId },
      include: { issue: true },
    });

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    await validateIssueAccess(attachment.issueId, req.user);

    // Delete file from filesystem and then from database
    await cleanupFiles({ path: path.join(uploadDir, `${attachment.type}s`, attachment.filename) } as any);
    await prisma.issueAttachment.delete({ where: { id: attachmentId } });

    return res.status(200).json({ message: 'Attachment deleted successfully' });
  } catch (error: any) {
    console.error('Delete attachment error:', error);
    return res.status(error.status || 500).json({ error: error.message || 'Internal server error' });
  }
});


// Centralized error handling middleware for Multer
router.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: `File is too large. Max size is ${process.env.MAX_FILE_SIZE || '10MB'}.` });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'You can upload a maximum of 5 files.' });
    }
  }
  
  if (error.message.includes('Only image and audio files are allowed')) {
    return res.status(415).json({ error: error.message });
  }
  
  // If the error is not one we specifically handle, pass it on
  // --- FIX: Added return to satisfy TypeScript's control flow analysis ---
  return next(error);
});

export default router;
