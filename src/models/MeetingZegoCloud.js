// models/MeetingZegoCloud.js
const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  meetingAgenda: { type: String, required: true },
  transcription: { type: String, required: true },
  summary: { type: String, required: true },
  audioUrl: { type: String, required: true }, // Added this line
  date: { type: Date, default: Date.now },
});

const TranscriptionSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  meetings: [meetingSchema],
});

const MeetingZegoCloud = mongoose.model('Transcription', TranscriptionSchema);

module.exports = MeetingZegoCloud;
