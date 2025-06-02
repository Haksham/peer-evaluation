const mongoose = require('mongoose');

const hostSchema = new mongoose.Schema({
  hostName: { type: String, required: true },
  hostId: { type: String, required: true, unique: true },
  roomId: { type: String, required: true, unique: true },
  role: { type: String, default: 'host' }
});

module.exports = mongoose.model('Host', hostSchema);
  