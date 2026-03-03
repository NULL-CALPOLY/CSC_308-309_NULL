import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { config } from 'dotenv';
import { Readable } from 'stream';
import path from 'path';

config({ path: path.resolve(process.cwd(), '.env') });

const router = express.Router();

// ── Cloudinary config ──
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// ── Multer (memory storage) ──
const upload = multer({ storage: multer.memoryStorage() });

// ── Helper: upload buffer to Cloudinary ──
const uploadToCloudinary = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto', ...options },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    Readable.from(buffer).pipe(stream);
  });

// ── Helper: build transformed image URL ──
const buildImageUrl = (publicId) =>
  cloudinary.url(publicId, {
    fetch_format: 'auto',
    quality: 'auto',
    width: 500,
    height: 500,
    crop: 'auto',
    gravity: 'auto',
    secure: true,
  });

// ─────────────────────────────────────────
// GET /image/:publicId
// Returns the transformed URL for an image
// ─────────────────────────────────────────
router.get('/:publicId', (req, res) => {
  try {
    const { publicId } = req.params;
    const imageUrl = buildImageUrl(publicId);
    res.status(200).json({ success: true, publicId, imageUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────
// POST /upload
// Uploads a new image to Cloudinary
// ─────────────────────────────────────────
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res
        .status(400)
        .json({ success: false, message: 'No file provided.' });
    }

    const result = await uploadToCloudinary(req.file.buffer);

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully.',
      publicId: result.public_id,
      imageUrl: result.secure_url,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res
      .status(500)
      .json({
        success: false,
        message: 'Upload failed.',
        error: error.message,
      });
  }
});

// ─────────────────────────────────────────
// PATCH /image/:publicId
// Replaces an existing image (delete + re-upload)
// ─────────────────────────────────────────
router.patch('/:publicId', upload.single('file'), async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res
        .status(400)
        .json({ success: false, message: 'No file provided.' });
    }

    const { publicId } = req.params;

    // Delete old image first
    await cloudinary.uploader.destroy(publicId);

    // Upload new image, preserving the same public_id
    const result = await uploadToCloudinary(req.file.buffer, {
      public_id: publicId,
      overwrite: true,
    });

    res.status(200).json({
      success: true,
      message: 'Image updated successfully.',
      publicId: result.public_id,
      imageUrl: result.secure_url,
    });
  } catch (error) {
    console.error('Cloudinary update error:', error);
    res
      .status(500)
      .json({
        success: false,
        message: 'Update failed.',
        error: error.message,
      });
  }
});

// ─────────────────────────────────────────
// DELETE /image/:publicId
// Deletes an image from Cloudinary
// ─────────────────────────────────────────
router.delete('/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== 'ok') {
      return res
        .status(404)
        .json({
          success: false,
          message: 'Image not found or already deleted.',
        });
    }

    res
      .status(200)
      .json({ success: true, message: 'Image deleted successfully.' });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Delete failed.',
      error: error.message,
    });
  }
});

export default router;
