// models/Group.js

const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  attendance: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    present: {
      type: Boolean,
      default: false,
    },
  }],
});



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
  deadline: {
    type: Date,
    required: true,
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


const MarkSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  proposalDefense: {
    type: Number,
    default: 0,
  },
  midEvaluation: {
    type: Number,
    default: 0,
  },
  internalEvaluation: {
    type: Number,
    default: 0,
  },
  externalEvaluation: {
    type: Number,
    default: 0,
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
  // marks: [{
  //   studentId: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'Student',
  //     required: true,
  //   },
  //   marks: {
  //     type: Number,
  //     required: true,
  //   },
  // }],    
  marks: [MarkSchema],  

  attendance: [AttendanceSchema],
});

module.exports = mongoose.model('Group', GroupSchema);
