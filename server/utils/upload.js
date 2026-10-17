import multer from 'multer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import { HttpError } from './http.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDir = path.join(__dirname, '..', 'uploads');

export const cloudinaryEnabled = () =>
  !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

const configureCloudinary = () =>
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    file.mimetype.startsWith('image/') ? cb(null, true) : cb(new HttpError(400, 'Only image files are allowed')),
});

export async function storeImage(req, file) {
  if (cloudinaryEnabled()) {
    configureCloudinary();
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'atelier', resource_type: 'image' },
        (err, result) => (err ? reject(err) : resolve({ url: result.secure_url, publicId: result.public_id }))
      );
      stream.end(file.buffer);
    });
  }
  // Local fallback (fine for development)
  fs.mkdirSync(uploadsDir, { recursive: true });
  const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '') || '.jpg';
  const name = `${crypto.randomBytes(12).toString('hex')}${ext}`;
  fs.writeFileSync(path.join(uploadsDir, name), file.buffer);
  return { url: `${req.protocol}://${req.get('host')}/uploads/${name}`, publicId: `local:${name}` };
}

export async function removeImage(publicId) {
  try {
    if (!publicId) return;
    if (publicId.startsWith('local:')) {
      fs.unlinkSync(path.join(uploadsDir, path.basename(publicId.slice(6))));
    } else if (cloudinaryEnabled()) {
      configureCloudinary();
      await cloudinary.uploader.destroy(publicId);
    }
  } catch {
    /* ignore cleanup errors */
  }
}
