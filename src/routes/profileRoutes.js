const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/authMiddleware'); // Import your JWT middleware

const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Multer storage
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     // cb(null, 'uploads/');
//     cb(null, '/tmp/uploads/');
//   },
//   filename: function (req, file, cb) {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   }
// });

// const upload = multer({ storage: storage });



// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads',
    format: async (req, file) => 'png', // supports promises as well
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

// Local storage
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Choose storage based on environment
const storage = process.env.NODE_ENV === 'production' ? cloudinaryStorage : localStorage;
const upload = multer({ storage });

// Middleware to verify JWT token
router.use(verifyToken);

// Get profile by username
router.get('/:username', async (req, res) => {
  try {
    const profile = await Profile.findOne({ username: req.params.username });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create or update profile
router.post('/:username', upload.single('photo'), async (req, res) => {
  const { file, body } = req;
  if (file) {
    // body.photo = `/uploads/${file.filename}`; 
    body.photo = process.env.NODE_ENV === 'production' ? file.path : `/uploads/${file.filename}`;   
  }

  try {
    const profile = await Profile.findOneAndUpdate(
      { username: req.params.username },
      body,
      { new: true, upsert: true } // Create new if not exists
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
