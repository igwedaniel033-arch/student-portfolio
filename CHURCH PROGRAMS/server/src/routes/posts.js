const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { auth } = require('../middleware/auth');

// list posts
router.get('/', async (req, res) => {
  const list = await Post.find().sort({ createdAt: -1 }).limit(50).populate('author', 'fullName avatarURL');
  res.json(list);
});

// create post (auth)
router.post('/', auth, async (req, res) => {
  const { content, media } = req.body;
  const p = new Post({ author: req.user._id, content, media });
  await p.save();
  res.json(p);
});

// like/unlike
router.post('/:id/like', auth, async (req, res) => {
  const p = await Post.findById(req.params.id);
  if (!p) return res.status(404).json({ error: 'not found' });
  const idx = p.likes.indexOf(req.user._id);
  if (idx === -1) p.likes.push(req.user._id);
  else p.likes.splice(idx,1);
  await p.save();
  res.json(p);
});

// comment
router.post('/:id/comment', auth, async (req, res) => {
  const p = await Post.findById(req.params.id);
  if (!p) return res.status(404).json({ error: 'not found' });
  p.comments.push({ author: req.user._id, text: req.body.text, createdAt: new Date() });
  await p.save();
  res.json(p);
});

module.exports = router;
