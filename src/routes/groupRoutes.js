// routes/groups.js

const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Set up multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // cb(null, 'uploads/');
//     cb(null, '/tmp/uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   }
// });

// const upload = multer({ storage });


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
    resource_type: 'auto',
    // format: async (req, file) => 'png', // supports promises as well
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
// const upload = multer({ storage });
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(new Error('Invalid file type. Only images, PDF, Word, and PowerPoint files are allowed.'), false); // Reject file
  }
};

const upload = multer({ storage, fileFilter });

// GET all groups
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('members', 'name username')
      .populate('supervisor', 'name username');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET group by group number
router.get('/:number', async (req, res) => {
  const { number } = req.params;

  try {
    const group = await Group.findOne({ number })
      .populate('members', 'name username')
      .populate('supervisor', 'name username')
      .populate('marks.studentId', 'name username')
      .populate('attendance.attendance.studentId', 'name username');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create a new group
router.post('/', async (req, res) => {
  const { number, members, supervisor, projectTitle } = req.body;

  try {
    const newGroup = new Group({
      number,
      members,
      supervisor,
      projectTitle,
    });

    const savedGroup = await newGroup.save();
    res.status(201).json(savedGroup);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update an existing group to add new members
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { members } = req.body;

  try {
    // Find the group by ID and update its members by pushing new members
    const updatedGroup = await Group.findByIdAndUpdate(
      id,
      { $addToSet: { members: { $each: members } } }, // Use $addToSet to avoid duplicate entries
      { new: true }
    ).populate('members', 'name username').populate('supervisor', 'name username');

    res.json(updatedGroup);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE delete a group
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await Group.findByIdAndDelete(id);
    res.json({ message: 'Group deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE delete a member from a group
router.delete('/:groupId/member/:memberId', async (req, res) => {
  const { groupId, memberId } = req.params;

  try {
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { $pull: { members: memberId } },
      { new: true }
    );
    res.json(updatedGroup);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update marks for all members of a group
router.put('/:number/marks', async (req, res) => {
  const { number } = req.params;
  const { marks, phase } = req.body; // marks should be an array of { studentId, marks }

  if (!Array.isArray(marks)) {
    return res.status(400).json({ message: 'Marks should be an array' });
  }

  const validPhases = ['proposalDefense', 'midEvaluation', 'internalEvaluation', 'externalEvaluation'];
  if (!validPhases.includes(phase)) {
    return res.status(400).json({ message: 'Invalid phase' });
  }

  try {
    const group = await Group.findOne({ number });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    marks.forEach(mark => {
      if (!mark.studentId || typeof mark.marks !== 'number') {
        throw new Error('Invalid marks data');
      }
    });

    // Update marks for each student
    marks.forEach(mark => {
      const studentMark = group.marks.find(groupMark => groupMark.studentId.equals(mark.studentId));
      if (studentMark) {
        studentMark[phase] = mark.marks;
      } else {
        const newMark = {
          studentId: mark.studentId,
          proposalDefense: 0,
          midEvaluation: 0,
          internalEvaluation: 0,
          externalEvaluation: 0,
        };
        newMark[phase] = mark.marks;
        group.marks.push(newMark);
      }
    });

    const updatedGroup = await group.save();
    res.json(updatedGroup);
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.log(error.message);
  }
});

// Update project phase
router.put('/:id/phase', async (req, res) => {
  const { phase } = req.body;
  const { progressPercentage } = req.body;

  if (!phase) {
    return res.status(400).json({ message: 'Phase is required' });
  }

  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    group.phase = phase;
    group.progress = progressPercentage;
    await group.save();

    res.status(200).json({ message: 'Phase updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

//assign task
router.post('/:groupId/tasks', upload.single('file'), async (req, res) => {
  try {
    const { groupId } = req.params;
    const { title, description, deadline } = req.body;
    const file = req.file;

    const task = {
      title,
      description,
      // filePath: file ? `/uploads/${file.filename}` : null,
      // filePath: file ? `/tmp/uploads/${file.filename}` : null,
      filePath: file ? (process.env.NODE_ENV === 'production' ? file.path : `/uploads/${file.filename}`) : null,
      timestamp: new Date(),
      deadline: new Date(deadline),
    };

    const group = await Group.findOneAndUpdate(
      { number: groupId },
      { $push: { tasks: task } },
      { new: true }
    );

    if (!group) {
      return res.status(404).send('Group not found');
    }

    res.status(200).send(group);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

//submit tasks
router.post('/:groupId/tasks/submit', upload.single('file'), async (req, res) => {
  try {
    const { groupId } = req.params;
    const { taskId } = req.body;
    const file = req.file;

    const group = await Group.findOne({ number: groupId });
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const submission = {
      taskId,
      //  filePath: `/uploads/${file.filename}`,
      filePath: process.env.NODE_ENV === 'production' ? file.path : `/uploads/${file.filename}`,
      timestamp: new Date().toISOString(),
    };

    group.submissions.push(submission);
    await group.save();

    res.status(201).json(group);
  } catch (err) {

    console.error('Error in /tasks/submit route:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST add attendance
router.post('/:number/attendance', async (req, res) => {
  const { number } = req.params;
  const { title, date, attendance } = req.body;

  try {
    const group = await Group.findOne({ number });
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const newAttendance = {
      date,
      title,
      attendance: attendance.map(student => ({
        studentId: student.studentId,
        present: student.present,
      })),
    };

    group.attendance.push(newAttendance);
    await group.save();

    res.status(201).json(newAttendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET group by group number with overall student attendance percentage and detailed attendance records
router.get('/:number/attendance', async (req, res) => {
  const { number } = req.params;

  try {
    const group = await Group.findOne({ number })
      .populate('attendance.attendance.studentId', 'name username')
      .populate('members', 'name username');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Calculate overall attendance percentages
    const attendanceCount = group.members.reduce((acc, member) => {
      acc[member._id] = { presentCount: 0, totalCount: 0 };
      return acc;
    }, {});

    group.attendance.forEach(record => {
      record.attendance.forEach(att => {
        if (attendanceCount[att.studentId._id]) {
          attendanceCount[att.studentId._id].totalCount += 1;
          if (att.present) {
            attendanceCount[att.studentId._id].presentCount += 1;
          }
        }
      });
    });

    const attendanceWithPercentage = group.members.map(member => {
      const { presentCount, totalCount } = attendanceCount[member._id] || { presentCount: 0, totalCount: 0 };
      const percentage = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;

      return {
        studentId: member._id,
        name: member.name,
        username: member.username,
        attendancePercentage: percentage.toFixed(2),
      };
    });

    // Return both overall attendance and detailed records
    res.json({
      overallAttendance: attendanceWithPercentage,
      detailedRecords: group.attendance.map(record => ({
        _id: record._id,
        title: record.title,
        date: record.date,
        attendance: record.attendance.map(att => ({
          studentId: att.studentId,
          name: att.studentId.name,
          username: att.studentId.username,
          present: att.present,
        })),
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



module.exports = router;
