const mongoose = require('mongoose');

const missionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  rewardPoints: { type: Number, default: 0 },
  status: { type: String, enum: ['not started', 'in progress', 'completed'], default: 'not started' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: [String],
  published: { type: Boolean, default: true },
}, { timestamps: true });

missionSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Mission', missionSchema);
