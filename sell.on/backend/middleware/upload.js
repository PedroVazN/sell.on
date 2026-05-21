const multer = require('multer');

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB (compatível com limite Vercel serverless)

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const storage = multer.memoryStorage();

const proposalAttachmentUpload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Tipo de arquivo não permitido. Use PDF, imagens (JPG/PNG/WebP/GIF) ou planilhas (XLS/XLSX/CSV).'
        )
      );
    }
  },
});

module.exports = {
  proposalAttachmentUpload,
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
};
