const fs = require('fs');
const path = require('path');

// Files to fix
const files = [
  'src/routes/auth.ts',
  'src/routes/analytics.ts', 
  'src/routes/issues.ts',
  'src/routes/upload.ts',
  'src/routes/users.ts'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix async functions that don't return values
  content = content.replace(
    /async \(req: AuthRequest, res\) => \{([^}]+)\n\s*res\.json\(/g,
    'async (req: AuthRequest, res) => {$1\n    return res.json('
  );
  
  content = content.replace(
    /async \(req, res\) => \{([^}]+)\n\s*res\.json\(/g,
    'async (req, res) => {$1\n    return res.json('
  );
  
  content = content.replace(
    /async \(req: AuthRequest, res\) => \{([^}]+)\n\s*res\.status\(/g,
    'async (req: AuthRequest, res) => {$1\n    return res.status('
  );
  
  content = content.replace(
    /async \(req, res\) => \{([^}]+)\n\s*res\.status\(/g,
    'async (req, res) => {$1\n    return res.status('
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${file}`);
});

console.log('All files fixed!');
