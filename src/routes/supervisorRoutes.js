// routes/supervisorRoutes.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Supervisor = require('../models/Supervisor');
const jwt = require('jsonwebtoken');

// Register a new supervisor
router.post('/register', async (req, res) => {
    const { name, username, password } = req.body;

    try {
        // Check if username already exists
        const existingSupervisor = await Supervisor.findOne({ username });
        if (existingSupervisor) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new supervisor
        const newSupervisor = new Supervisor({
            name,
            username,
            password: hashedPassword,
        });
        await newSupervisor.save();

        res.status(201).json({ message: 'Supervisor registered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//sueprvisor login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find supervisor by username
        const supervisor = await Supervisor.findOne({ username });
        if (!supervisor) {
            return res.status(404).json({ message: 'Supervisor not found' });
        }

        // Compare passwords
        const passwordMatch = await bcrypt.compare(password, supervisor.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { name: supervisor.name, username: supervisor.username, role: supervisor.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Login successful', token,  name: supervisor.name, username: supervisor.username, role: supervisor.role });


    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Change password route
router.post('/change-password',  async (req, res) => {
    const {username,  oldPassword, newPassword } = req.body;

    try {
        // Find supervisor by username (from token)
        // const supervisor = await Supervisor.findOne({ username: req.user.username });
        const supervisor = await Supervisor.findOne({ username });
        if (!supervisor) {
            return res.status(404).json({ message: 'Supervisor not found' });
        }

        // Compare current password
        const passwordMatch = await bcrypt.compare(oldPassword, supervisor.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Old password is incorrect' });
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update supervisor password
        supervisor.password = hashedNewPassword;
        await supervisor.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Fetch all supervisors
router.get('/', async (req, res) => {
    try {
        const supervisors = await Supervisor.find();
        res.status(200).json(supervisors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a supervisor by username
router.delete('/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const supervisor = await Supervisor.findOneAndDelete({ username });
        if (!supervisor) {
            return res.status(404).json({ message: 'Supervisor not found' });
        }
        res.status(200).json({ message: 'Supervisor deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
