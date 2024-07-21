const express = require('express');
const router = express.Router();
const multer = require('multer');
const Profile = require('../models/Profile');
const path = require('path');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/authMiddleware'); // Import your JWT middleware

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(null, 'uploads/');
    cb(null, '/tmp/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

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
    body.photo = `/uploads/${file.filename}`;
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
