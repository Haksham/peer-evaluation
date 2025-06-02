const express = require('express');
const router = express.Router();
const { createHost } = require('../controller/host.js');
const Host = require('../models/host.js');
const Client = require('../models/client.js');
const Review = require('../models/review.js');

let sessionState = {};

router.post('/create-host', createHost);

// Host updates session state
router.post('/session-state', (req, res) => {
  const { roomId, sessionActive, currentIndex, timer } = req.body;
  sessionState[roomId] = { sessionActive, currentIndex, timer };
  res.json({ success: true });
});

// Client fetches session state
router.get('/session-state', (req, res) => {
  const { roomId } = req.query;
  res.json(sessionState[roomId] || { sessionActive: false });
});

router.post('/destroy-room', async (req, res) => {
  try {
    const { roomId } = req.body;
    if (!roomId) return res.status(400).json({ error: "roomId required" });
    await Host.deleteOne({ roomId });
    await Client.deleteMany({ roomId });
    await Review.deleteMany({ roomId }); 
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
