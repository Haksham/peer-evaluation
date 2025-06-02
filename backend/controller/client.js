const Client = require('../models/client.js');
const Host = require('../models/host.js');

exports.createClient = async (req, res) => {
  const { name, usn, title, abstract, timeslot, pdf, githubLink, roomId } = req.body;

  try {
    const host = await Host.findOne({ roomId });
    if (!host) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const newClient = new Client({ name, usn, title, abstract, timeslot, pdf, githubLink, roomId });
    await newClient.save();

    res.status(201).json({ message: 'Client added to room' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.loginClient = async (req, res) => {
  const { name, usn, roomId } = req.body;
  try {
    const client = await Client.findOne({ name, usn, roomId });
    if (!client) {
      return res.status(400).json({ error: "Invalid credentials or room ID" });
    }
    res.status(200).json({ roomId });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
