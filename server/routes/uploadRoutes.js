import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { protect } from '../middleware/authMiddleware.js';
import streamifier from 'streamifier';

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// Upload Resume PDF
router.post('/resume', protect, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ message: 'Only PDF files allowed' });
    }

    console.log('Uploading resume:', req.file.originalname);

    const result = await uploadToCloudinary(req.file.buffer, {
      resource_type: 'raw',        // ← KEY FIX: 'raw' for PDFs makes them publicly accessible
      folder: 'job-portal/resumes',
      public_id: `resume_${Date.now()}`,
      format: 'pdf',
      type: 'upload',
      access_mode: 'public',
      flags: 'attachment',
    });

    console.log('Resume uploaded:', result.secure_url);
    res.status(200).json({ success: true, url: result.secure_url });

  } catch (error) {
    console.error('Resume upload error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Upload Profile Photo
router.post('/profile-photo', protect, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    console.log('Uploading profile photo:', req.file.originalname);

    const result = await uploadToCloudinary(req.file.buffer, {
      resource_type: 'image',
      folder: 'job-portal/avatars',
      public_id: `avatar_${Date.now()}`,
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' }
      ],
      access_mode: 'public',
    });

    console.log('Photo uploaded:', result.secure_url);
    res.status(200).json({ success: true, url: result.secure_url });

  } catch (error) {
    console.error('Photo upload error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

export default router;