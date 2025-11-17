import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { RequestHandler } from 'express';

// Imported files only - no linked files/URLs (Zotero has 4 link modes)
// Session 10: Single PDF upload per reference (MVP constraint)

const UPLOAD_DIR = path.join(process.cwd(), 'data', 'bibliography', 'uploads');
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB (API spec requirement)

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure disk storage with UUID filenames
// Adapted from editor_backend/services/document-service/src/routes/projects.ts
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    // Use UUID to prevent filename collisions (WebSearch: avoid timestamp collisions at scale)
    const uniqueFilename = `${uuidv4()}.pdf`;
    cb(null, uniqueFilename);
  },
});

// Configure multer with disk storage and validation
const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1, // Single file upload
  },
  fileFilter: (_req, file, cb) => {
    // Validate PDF MIME type only
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only PDF files are allowed.`));
    }
  },
});

// Export middleware for single PDF upload
export const uploadPdf: RequestHandler = upload.single('file');
export { UPLOAD_DIR };
