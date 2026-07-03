const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Try to require multer and aws sdk if installed
let multer;
try { multer = require('multer'); } catch(e) { multer = null }

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

if (multer) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
      const safe = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g,'')}`;
      cb(null, safe);
    }
  });
  const upload = multer({ storage });

  // Local upload endpoint (multipart/form-data)
  router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'no file' });
    const url = `/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.filename });
  });
} else {
  router.post('/upload', (req, res) => res.status(500).json({ error: 'multer not installed on server' }));
}

// Presign endpoint (S3) - returns URL to PUT the file
router.post('/presign', express.json(), async (req, res) => {
  const { filename, contentType } = req.body || {};
  if (!filename) return res.status(400).json({ error: 'missing filename' });
  try {
    const { S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = process.env;
    if (!S3_BUCKET || !S3_REGION || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) return res.status(400).json({ error: 's3 not configured' });
    const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
    const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
    const client = new S3Client({ region: S3_REGION, credentials: { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY } });
    const key = `uploads/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.\-_]/g,'')}`;
    const cmd = new PutObjectCommand({ Bucket: S3_BUCKET, Key: key, ContentType: contentType || 'application/octet-stream' });
    const url = await getSignedUrl(client, cmd, { expiresIn: 900 });
    const publicUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
    res.json({ url, key, publicUrl });
  } catch (err) {
    console.error('presign error', err);
    res.status(500).json({ error: 'presign failed' });
  }
});

module.exports = router;
