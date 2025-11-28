const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  roll: { type: String, required: true, unique: true },
  class: { type: String },
  email: { type: String },
  notes: { type: String }
});

module.exports = mongoose.model('Student', studentSchema);