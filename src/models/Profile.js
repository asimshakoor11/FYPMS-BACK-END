const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: String,
  address: String,
  email: String,
  phone: String,
  photo: String,
});

module.exports = mongoose.model('Profile', profileSchema);
