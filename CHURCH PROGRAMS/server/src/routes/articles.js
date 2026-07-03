const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const { auth, requireRole } = require('../middleware/auth');
const sanitizeHtml = require('sanitize-html');

// list articles
router.get('/', async (req, res) => {
  const list = await Article.find().sort({ createdAt: -1 }).limit(50);
  res.json(list);
});

// get one
router.get('/:id', async (req, res) => {
  const a = await Article.findById(req.params.id);
  if(!a) return res.status(404).json({ error: 'not found' });
  res.json(a);
});

// create (admin)
const { body: vbody, validationResult } = require('express-validator');
router.post('/', auth, requireRole('admin'),
  vbody('title').isLength({ min: 3 }).trim().escape(),
  vbody('body').isLength({ min: 10 }).trim(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'invalid input', details: errors.array() });
    const { title, body: content, images, status } = req.body;
    const safeBody = sanitizeHtml(content || '', {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img', 'h1', 'h2', 'u' ]),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ['src','alt','width','height']
      }
    });
    const art = new Article({ title, body: safeBody, images, status: status||'draft', author: req.user._id });
    if (status === 'published') art.publishedAt = new Date();
    await art.save();
    res.json(art);
  }
);

// update (admin)
router.patch('/:id', auth, requireRole('admin'), async (req, res) => {
  const updates = req.body;
  if (updates.status === 'published') updates.publishedAt = new Date();
  const a = await Article.findByIdAndUpdate(req.params.id, updates, { new: true });
  res.json(a);
});

// delete (admin)
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  await Article.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
