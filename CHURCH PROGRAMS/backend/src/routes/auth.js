const express = require('express');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const router = express.Router();

const signToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });

router.post('/register', asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ message: 'Missing required fields' });
  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) return res.status(409).json({ message: 'User already exists' });
  const user = await User.create({ username, email, password });
  const token = signToken(user);
  res.status(201).json({ user: { id: user._id, username: user.username, email: user.email, role: user.role }, token });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing required fields' });
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const valid = await user.comparePassword(password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
  user.lastLogin = new Date();
  await user.save();
  const token = signToken(user);
  res.json({ user: { id: user._id, username: user.username, email: user.email, role: user.role }, token });
}));

router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out' });
});

module.exports = router;
