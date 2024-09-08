// models/PastGroup.js
const mongoose = require('mongoose');

const pastGroupSchema = new mongoose.Schema({
    groupNumber: {
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
        required: true,
    },
    projectTitle: {
        type: String,
        required: true,
    },
    registeredAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('PastGroup', pastGroupSchema);
