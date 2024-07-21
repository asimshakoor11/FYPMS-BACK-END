// src/routes/auth.js
const express = require('express');
const router = express.Router();
const authCommitteeController = require('../controllers/authCommitteeController');
const verifyToken = require('../middleware/authMiddleware');


// POST /api/auth/register
router.post('/register', authCommitteeController.register);

// POST /api/auth/login
router.post('/login', authCommitteeController.login);


// POST /api/auth/change-password
router.post('/change-password', verifyToken, authCommitteeController.changePassword);


module.exports = router;
