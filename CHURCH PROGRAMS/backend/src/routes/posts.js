const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth');
const asyncHandler = require('../utils/asyncHandler');
const Post = require('../models/Post');
const router = express.Router();

router.get('/', authenticate, asyncHandler(async (req, res) => {
  const posts = await Post.find({ published: true }).sort({ createdAt: -1 });
  res.json(posts);
}));

router.post('/', authenticate, authorize('admin'), async (req, res) => {
  const { title, content, category, tags } = req.body;
  const post = await Post.create({ title, content, category, tags, author: req.user._id });
  res.status(201).json(post);
});

router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json(post);
});

router.delete('/:id', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.json({ message: 'Post deleted' });
}));

module.exports = router;
