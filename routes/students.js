const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const Student = require('../models/Student');
const User = require('../models/User');

function requireLogin(req, res, next){
  if (!req.session || !req.session.userId) return res.status(401).json({ message: 'Not authenticated' });
  next();
}

function requireAdmin(req, res, next){
  if (req.session.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  next();
}

router.get('/', requireLogin, asyncHandler(async (req, res) => {
  if (req.session.role === 'admin'){
    const all = await Student.find().lean();
    return res.json(all);
  }
  const user = await User.findById(req.session.userId).populate('studentRef');
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (!user.studentRef) return res.json([]);
  res.json([user.studentRef]);
}));

router.post('/', requireLogin, requireAdmin, asyncHandler(async (req, res) => {
  const { name, roll, class: cls, email, notes, studentUsername, studentPassword } = req.body;
  if (!name || !roll) return res.status(400).json({ message: 'Missing name or roll' });
  const student = new Student({ name, roll, class: cls, email, notes });
  try {
    await student.save();
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Duplicate value - roll must be unique' });
    throw err;
  }

  if (studentUsername && studentPassword) {
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash(studentPassword, 10);
    const u = new User({ username: studentUsername, passwordHash: hash, role: 'student', studentRef: student._id });
    await u.save();
  }
  res.json({ message: 'Student created', student });
}));

router.put('/:id', requireLogin, requireAdmin, asyncHandler(async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const s = await Student.findByIdAndUpdate(id, data, { new: true });
  res.json({ message: 'Updated', student: s });
}));

router.delete('/:id', requireLogin, requireAdmin, asyncHandler(async (req, res) => {
  const id = req.params.id;
  await Student.findByIdAndDelete(id);
  res.json({ message: 'Deleted' });
}));

module.exports = router;