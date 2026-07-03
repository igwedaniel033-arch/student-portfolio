const mongoose = require('mongoose');

const AboutSchema = new mongoose.Schema({
  churchName: { type: String, default: 'Gilgal Parish Church' },
  location: { type: String, default: 'Opposite Workers Village Estate, Ugwuachara' },
  description: { type: String, default: 'Gilgal Parish Church is a Christian community committed to worship, fellowship, unity, and spiritual growth.' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('About', AboutSchema);
