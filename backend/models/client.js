const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  usn: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  abstract: { type: String, required: true },
  pdf: { type: String, required: true },
  githubLink: { type: String, required: true },
  roomId: { type: String, required: true },
  role: { type: String, default: 'client' }
});

module.exports = mongoose.model('Client', clientSchema);
