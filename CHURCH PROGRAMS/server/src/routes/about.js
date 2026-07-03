const express = require('express');
const router = express.Router();
const About = require('../models/About');
const { auth, requireRole } = require('../middleware/auth');

// Read about (public)
router.get('/', async (req, res) => {
  const about = await About.findOne();
  res.json(about);
});

// Update about (admin only)
router.patch('/', auth, requireRole('admin'), async (req, res) => {
  let about = await About.findOne();
  if (!about) about = new About();
  const { churchName, location, description } = req.body;
  if (churchName) about.churchName = churchName;
  if (location) about.location = location;
  if (description) about.description = description;
  about.updatedBy = req.user._id;
  about.updatedAt = new Date();
  await about.save();
  res.json(about);
});

module.exports = router;
