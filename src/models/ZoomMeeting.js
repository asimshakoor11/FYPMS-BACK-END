// models/Meeting.js
const mongoose = require('mongoose');

const ZmeetingSchema = new mongoose.Schema({
    topic: { type: String, required: true },
    start_time: { type: String, required: true },
    duration: { type: Number, required: true },
    join_url: { type: String, required: true },
}, { timestamps: true });

const ZoomMeetingSchema = new mongoose.Schema({
    number: { type: String, required: true, unique: true },
    meetings: [ZmeetingSchema],
});



module.exports = mongoose.model('ZoomMeeting', ZoomMeetingSchema);
