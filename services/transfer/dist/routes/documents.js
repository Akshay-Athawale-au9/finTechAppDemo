"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentsRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
exports.documentsRouter = router;
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = process.env.UPLOAD_DIR || './uploads';
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880')
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/pdf',
            'text/plain'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, PDF, and TXT files are allowed.'));
        }
    }
});
router.post('/upload', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const result = await database_1.pool.query(`INSERT INTO documents (filename, original_name, mime_type, size, path, uploaded_by) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, created_at`, [
            req.file.filename,
            req.file.originalname,
            req.file.mimetype,
            req.file.size,
            req.file.path,
            req.userId || null
        ]);
        res.status(201).json({
            message: 'Document uploaded successfully',
            documentId: result.rows[0].id,
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            uploadedAt: result.rows[0].created_at
        });
    }
    catch (error) {
        console.error('Document upload error:', error);
        if (req.file && req.file.path) {
            fs_1.default.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
//# sourceMappingURL=documents.js.map