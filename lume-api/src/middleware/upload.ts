import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import { config } from '../config/env';

// Configure Cloudinary with credentials from environment
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

// ── Storage Buckets ────────────────────────────────────────────────────────────

// Avatar storage: single image, stored in lume/avatars folder, overwrite allowed
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lume/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto', fetch_format: 'auto' }],
  } as any,
});

// Portfolio storage: multiple images, stored in lume/portfolios folder
const portfolioStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lume/portfolios',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, quality: 'auto', fetch_format: 'auto' }],
  } as any,
});

// Certification storage: PDFs and images, stored in lume/certifications folder
const certificationStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lume/certifications',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
    resource_type: 'auto',
  } as any,
});

// ── File Filters ───────────────────────────────────────────────────────────────

const imageFileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (JPEG, PNG, WebP, GIF) are allowed.'));
  }
};

const certFileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
  }
};

// ── Multer Uploaders ───────────────────────────────────────────────────────────

export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: config.upload.maxFileSize },
});

export const uploadPortfolio = multer({
  storage: portfolioStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: config.upload.maxFileSize },
});

export const uploadCertification = multer({
  storage: certificationStorage,
  fileFilter: certFileFilter,
  limits: { fileSize: config.upload.maxFileSize },
});

// ── URL Helper ─────────────────────────────────────────────────────────────────
// With Cloudinary, the file's secure_url is already a full HTTPS URL.
// This helper is kept for backward compatibility; it simply returns the URL as-is.
export function fileUrl(filePath: string): string {
  return filePath;
}

// ── Cloudinary Delete Helper ───────────────────────────────────────────────────
// Extracts the public_id from a Cloudinary URL and deletes the asset.
export async function deleteCloudinaryFile(url: string): Promise<void> {
  try {
    // Extract public_id: everything between the upload/ segment and the file extension
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    if (match && match[1]) {
      await cloudinary.uploader.destroy(match[1]);
    }
  } catch (err) {
    console.error('Failed to delete Cloudinary file:', err);
  }
}

export { cloudinary };
