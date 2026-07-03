const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

// Get current profile
router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

// Search members (public)
router.get('/', auth, async (req, res) => {
  const q = req.query.q || '';
  const users = await User.find({ fullName: new RegExp(q, 'i') }).limit(50).select('-password');
  res.json(users);
});

// Admin: create user
router.post('/', auth, requireRole('admin'), async (req, res) => {
  const { fullName, email, role } = req.body;
  const user = new User({ fullName, email, role: role || 'member' });
  await user.save();
  res.json(user);
});

// Admin: update user
router.patch('/:id', auth, requireRole('admin'), async (req, res) => {
  const updates = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
  res.json(user);
});

module.exports = router;
