"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
const uuid_1 = require("uuid");
const auth_1 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const imageDir = path_1.default.join(uploadDir, 'images');
const audioDir = path_1.default.join(uploadDir, 'audio');
[uploadDir, imageDir, audioDir].forEach(dir => {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
});
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, imageDir);
        }
        else if (file.mimetype.startsWith('audio/')) {
            cb(null, audioDir);
        }
        else {
            cb(new Error('Unsupported file type'), '');
        }
    },
    filename: (req, file, cb) => {
        const uniqueName = `${(0, uuid_1.v4)()}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image and audio files are allowed'));
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
    },
});
router.post('/single', auth_1.authenticateToken, auth_1.requireAnyRole, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const { issueId, type } = req.body;
        if (!issueId) {
            fs_1.default.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Issue ID is required' });
        }
        const issue = await prisma.issue.findUnique({
            where: { id: issueId },
        });
        if (!issue) {
            fs_1.default.unlinkSync(req.file.path);
            return res.status(404).json({ error: 'Issue not found' });
        }
        if (req.user.role === 'CITIZEN' && issue.reporterId !== req.user.id) {
            fs_1.default.unlinkSync(req.file.path);
            return res.status(403).json({ error: 'Access denied' });
        }
        let processedFile = req.file;
        let finalUrl = `/uploads/${req.file.mimetype.startsWith('image/') ? 'images' : 'audio'}/${req.file.filename}`;
        if (req.file.mimetype.startsWith('image/')) {
            try {
                const processedPath = path_1.default.join(imageDir, `processed_${req.file.filename}`);
                await (0, sharp_1.default)(req.file.path)
                    .resize(1200, 1200, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                    .jpeg({ quality: 85 })
                    .toFile(processedPath);
                fs_1.default.unlinkSync(req.file.path);
                fs_1.default.renameSync(processedPath, req.file.path);
                processedFile = {
                    ...req.file,
                    size: fs_1.default.statSync(req.file.path).size,
                };
            }
            catch (error) {
                console.error('Image processing error:', error);
            }
        }
        const attachment = await prisma.issueAttachment.create({
            data: {
                filename: processedFile.filename,
                originalName: processedFile.originalname,
                mimeType: processedFile.mimetype,
                size: processedFile.size,
                url: finalUrl,
                type: processedFile.mimetype.startsWith('image/') ? 'image' : 'audio',
                issueId,
            },
        });
        res.json({
            message: 'File uploaded successfully',
            attachment: {
                id: attachment.id,
                filename: attachment.filename,
                originalName: attachment.originalName,
                mimeType: attachment.mimeType,
                size: attachment.size,
                url: attachment.url,
                type: attachment.type,
            },
        });
    }
    catch (error) {
        if (req.file && fs_1.default.existsSync(req.file.path)) {
            fs_1.default.unlinkSync(req.file.path);
        }
        console.error('Upload error:', error);
        res.status(500).json({ error: 'File upload failed' });
    }
});
router.post('/multiple', auth_1.authenticateToken, auth_1.requireAnyRole, upload.array('files', 5), async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }
        const { issueId } = req.body;
        if (!issueId) {
            files.forEach(file => {
                if (fs_1.default.existsSync(file.path)) {
                    fs_1.default.unlinkSync(file.path);
                }
            });
            return res.status(400).json({ error: 'Issue ID is required' });
        }
        const issue = await prisma.issue.findUnique({
            where: { id: issueId },
        });
        if (!issue) {
            files.forEach(file => {
                if (fs_1.default.existsSync(file.path)) {
                    fs_1.default.unlinkSync(file.path);
                }
            });
            return res.status(404).json({ error: 'Issue not found' });
        }
        if (req.user.role === 'CITIZEN' && issue.reporterId !== req.user.id) {
            files.forEach(file => {
                if (fs_1.default.existsSync(file.path)) {
                    fs_1.default.unlinkSync(file.path);
                }
            });
            return res.status(403).json({ error: 'Access denied' });
        }
        const attachments = [];
        for (const file of files) {
            try {
                let processedFile = file;
                let finalUrl = `/uploads/${file.mimetype.startsWith('image/') ? 'images' : 'audio'}/${file.filename}`;
                if (file.mimetype.startsWith('image/')) {
                    try {
                        const processedPath = path_1.default.join(imageDir, `processed_${file.filename}`);
                        await (0, sharp_1.default)(file.path)
                            .resize(1200, 1200, {
                            fit: 'inside',
                            withoutEnlargement: true
                        })
                            .jpeg({ quality: 85 })
                            .toFile(processedPath);
                        fs_1.default.unlinkSync(file.path);
                        fs_1.default.renameSync(processedPath, file.path);
                        processedFile = {
                            ...file,
                            size: fs_1.default.statSync(file.path).size,
                        };
                    }
                    catch (error) {
                        console.error('Image processing error:', error);
                    }
                }
                const attachment = await prisma.issueAttachment.create({
                    data: {
                        filename: processedFile.filename,
                        originalName: processedFile.originalname,
                        mimeType: processedFile.mimetype,
                        size: processedFile.size,
                        url: finalUrl,
                        type: processedFile.mimetype.startsWith('image/') ? 'image' : 'audio',
                        issueId,
                    },
                });
                attachments.push({
                    id: attachment.id,
                    filename: attachment.filename,
                    originalName: attachment.originalName,
                    mimeType: attachment.mimeType,
                    size: attachment.size,
                    url: attachment.url,
                    type: attachment.type,
                });
            }
            catch (error) {
                console.error('File processing error:', error);
                if (fs_1.default.existsSync(file.path)) {
                    fs_1.default.unlinkSync(file.path);
                }
            }
        }
        res.json({
            message: `${attachments.length} files uploaded successfully`,
            attachments,
        });
    }
    catch (error) {
        if (req.files) {
            req.files.forEach(file => {
                if (fs_1.default.existsSync(file.path)) {
                    fs_1.default.unlinkSync(file.path);
                }
            });
        }
        console.error('Multiple upload error:', error);
        res.status(500).json({ error: 'File upload failed' });
    }
});
router.delete('/:attachmentId', auth_1.authenticateToken, auth_1.requireAnyRole, async (req, res) => {
    try {
        const { attachmentId } = req.params;
        const attachment = await prisma.issueAttachment.findUnique({
            where: { id: attachmentId },
            include: {
                issue: true,
            },
        });
        if (!attachment) {
            return res.status(404).json({ error: 'Attachment not found' });
        }
        if (req.user.role === 'CITIZEN' && attachment.issue.reporterId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const filePath = path_1.default.join(process.cwd(), 'uploads', attachment.type === 'image' ? 'images' : 'audio', attachment.filename);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        await prisma.issueAttachment.delete({
            where: { id: attachmentId },
        });
        res.json({ message: 'Attachment deleted successfully' });
    }
    catch (error) {
        console.error('Delete attachment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.use((error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: 'File too large' });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ error: 'Too many files' });
        }
    }
    if (error.message === 'Only image and audio files are allowed') {
        return res.status(400).json({ error: error.message });
    }
    next(error);
});
exports.default = router;
//# sourceMappingURL=upload.js.map