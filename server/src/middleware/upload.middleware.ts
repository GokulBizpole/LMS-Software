import fs from "fs";
import path from "path";
import multer from "multer";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads", "customers");

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const customerId = String(req.params.id || req.params.customerId);
    const dir = path.join(UPLOAD_ROOT, customerId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

export const uploadCustomerDocument = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error("Only JPG, PNG, WEBP or PDF files are allowed"));
      return;
    }
    cb(null, true);
  },
}).single("file");
