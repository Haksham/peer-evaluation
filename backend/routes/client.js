const express = require('express');
const router = express.Router();
const { createClient, loginClient } = require('../controller/client.js');
const Client = require('../models/client.js');

router.post('/create-client', createClient);
router.post('/login', loginClient);

// List all clients for a roomId
router.get('/list', async (req, res) => {
  try {
    const { roomId } = req.query;
    if (!roomId) return res.status(400).json({ error: "roomId required" });
    const clients = await Client.find({ roomId });
    res.json({ clients });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Remove a client
router.post('/remove', async (req, res) => {
  try {
    const { clientId } = req.body;
    if (!clientId) return res.status(400).json({ error: "clientId required" });
    await require('../models/client.js').findByIdAndDelete(clientId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
