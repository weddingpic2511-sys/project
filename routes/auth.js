const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Student = require('../models/Student');

router.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Missing credentials' });

  const user = await User.findOne({ username }).populate('studentRef');
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  req.session.userId = user._id;
  req.session.role = user.role;
  req.session.username = user.username;

  res.json({ message: 'Logged in', role: user.role });
}));

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

router.post('/register-admin', asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Missing fields' });
  const existing = await User.findOne({ username });
  if (existing) return res.status(400).json({ message: 'User exists' });

  const hash = await bcrypt.hash(password, 10);
  const admin = new User({ username, passwordHash: hash, role: 'admin' });
  await admin.save();
  res.json({ message: 'Admin created' });
}));

module.exports = router;