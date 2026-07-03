const express = require('express');
const { authenticate } = require('../middlewares/auth');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const router = express.Router();

router.get('/profile', authenticate, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
}));

router.put('/update', authenticate, asyncHandler(async (req, res) => {
  const updates = (({ username, profileImage }) => ({ username, profileImage }))(req.body);
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-password');
  res.json(user);
}));

module.exports = router;
