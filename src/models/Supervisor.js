// models/supervisor.js

const mongoose = require('mongoose');

const supervisorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'Supervisor' },
});

module.exports = mongoose.model('Supervisor', supervisorSchema);
