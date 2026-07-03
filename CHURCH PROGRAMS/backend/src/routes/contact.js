const express = require('express');
const ContactMessage = require('../models/ContactMessage');
const { authenticate, authorize } = require('../middlewares/auth');
const asyncHandler = require('../utils/asyncHandler');
const router = express.Router();

router.post('/', asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ message: 'Missing fields' });
  const saved = await ContactMessage.create({ name, email, message });
  res.status(201).json(saved);
}));

router.get('/', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 });
  res.json(messages);
}));

router.put('/:id/resolve', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const message = await ContactMessage.findByIdAndUpdate(req.params.id, { resolved: true }, { new: true });
  res.json(message);
}));

module.exports = router;
