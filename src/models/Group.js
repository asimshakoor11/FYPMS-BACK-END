// models/Group.js

const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const SubmissionSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },
  filePath: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const GroupSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  }],
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supervisor',
  },
  projectTitle: {
    type: String,
    required: true,
  },
  phase: {
    type: String,
    enum: ['Proposal', 'Literature Review', 'Methodology', 'Implementation', 'Testing', 'Final Report'], // Add more phases as needed
    default: 'Proposal',
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  tasks: [TaskSchema],
  submissions: [SubmissionSchema],
  marks: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    marks: {
      type: Number,
      required: true,
    },
  }],
});

module.exports = mongoose.model('Group', GroupSchema);
