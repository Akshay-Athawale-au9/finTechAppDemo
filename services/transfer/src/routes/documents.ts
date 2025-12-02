import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { pool } from '../config/database';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure upload directory exists
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5MB default
  },
  fileFilter: function (req, file, cb) {
    // Allow only certain file types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, PDF, and TXT files are allowed.'));
    }
  }
});

// Upload document
router.post('/upload', upload.single('document'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Save file metadata to database
    const result = await pool.query(
      `INSERT INTO documents (filename, original_name, mime_type, size, path, uploaded_by) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, created_at`,
      [
        req.file.filename,
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
        req.file.path,
        (req as any).userId || null // In a real implementation, this would come from auth middleware
      ]
    );
    
    return res.status(201).json({
      message: 'Document uploaded successfully',
      documentId: result.rows[0].id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      uploadedAt: result.rows[0].created_at
    });
  } catch (error) {
    console.error('Document upload error:', error);
    
    // Clean up uploaded file if database save failed
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as documentsRouter };