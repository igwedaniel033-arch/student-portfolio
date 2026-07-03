const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth');
const asyncHandler = require('../utils/asyncHandler');
const Mission = require('../models/Mission');
const MissionProgress = require('../models/MissionProgress');
const router = express.Router();

router.get('/', authenticate, asyncHandler(async (req, res) => {
  const missions = await Mission.find({ published: true });
  res.json(missions);
}));

router.post('/', authenticate, authorize('admin'), async (req, res) => {
  const mission = await Mission.create(req.body);
  const io = req.app.get('io');
  if (io) io.emit('mission:created', mission);
  res.status(201).json(mission);
});

router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  const mission = await Mission.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  const io = req.app.get('io');
  if (io) io.emit('mission:updated', mission);
  res.json(mission);
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  await Mission.findByIdAndDelete(req.params.id);
  const io = req.app.get('io');
  if (io) io.emit('mission:deleted', { id: req.params.id });
  res.json({ message: 'Mission deleted' });
});

router.post('/:id/assign', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const mission = await Mission.findById(req.params.id);
  if (!mission) return res.status(404).json({ message: 'Mission not found' });
  const progress = await MissionProgress.create({ user: req.body.userId, mission: mission._id, completionStatus: 'not started' });
  res.status(201).json(progress);
}));

router.put('/:id/progress', authenticate, asyncHandler(async (req, res) => {
  const progress = await MissionProgress.findOneAndUpdate({ mission: req.params.id, user: req.user._id }, req.body, { new: true, runValidators: true });
  if (!progress) return res.status(404).json({ message: 'Progress not found' });
  const io = req.app.get('io');
  if (io) io.emit('mission:progress', progress);
  res.json(progress);
}));

module.exports = router;
