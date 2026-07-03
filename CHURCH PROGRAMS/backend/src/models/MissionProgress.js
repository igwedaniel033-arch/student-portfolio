const mongoose = require('mongoose');

const missionProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mission: { type: mongoose.Schema.Types.ObjectId, ref: 'Mission', required: true },
  completionStatus: { type: String, enum: ['not started', 'in progress', 'completed'], default: 'not started' },
  score: { type: Number, default: 0 },
  badges: [String],
}, { timestamps: true });

missionProgressSchema.index({ user: 1, mission: 1 }, { unique: true });

module.exports = mongoose.model('MissionProgress', missionProgressSchema);
