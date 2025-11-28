const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'student'], required: true },
  studentRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }
});

module.exports = mongoose.model('User', userSchema);