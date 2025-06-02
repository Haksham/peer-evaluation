const Host = require('../models/host.js');

exports.createHost = async (req, res) => {
  const { hostName, hostId, roomId } = req.body;

  try {
    const existingHost = await Host.findOne({ roomId });

    if (existingHost) {
      if (
        existingHost.hostName === hostName &&
        existingHost.hostId === hostId
      ) {
        return res.status(200).json({ roomId });
      } else {
        return res.status(400).json({ error: "Room ID is in use" });
      }
    }

    // Room does not exist, create new host
    const newHost = new Host({ hostName, hostId, roomId });
    await newHost.save();
    res.status(201).json({ roomId });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
