const express = require('express');
const router = express.Router();
const Review = require('../models/review.js');

// Add or update a review for a client
router.post('/submit', async (req, res) => {
  const { roomId, reviewedClientUsn, reviewerName, reviewerRole, rating, comment } = req.body;
  if (!roomId || !reviewedClientUsn || !reviewerName || !reviewerRole || rating == null || !comment)
    return res.status(400).json({ error: "All fields required" });

  try {
    let reviewDoc = await Review.findOne({ roomId, reviewedClientUsn });
    if (!reviewDoc) {
      reviewDoc = new Review({ roomId, reviewedClientUsn, reviews: [] });
    }
    // If reviewer already reviewed, update; else push new
    const idx = reviewDoc.reviews.findIndex(
      r => r.reviewerName === reviewerName && r.reviewerRole === reviewerRole
    );
    if (idx >= 0) {
      reviewDoc.reviews[idx] = { reviewerName, reviewerRole, rating, comment };
    } else {
      reviewDoc.reviews.push({ reviewerName, reviewerRole, rating, comment });
    }
    await reviewDoc.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get all reviews for a client in a room
router.get('/for-client', async (req, res) => {
  const { roomId, reviewedClientUsn } = req.query;
  if (!roomId || !reviewedClientUsn) return res.status(400).json({ error: "roomId and reviewedClientUsn required" });
  try {
    const reviewDoc = await Review.findOne({ roomId, reviewedClientUsn });
    res.json({ reviews: reviewDoc ? reviewDoc.reviews : [] });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get all reviews for a room
router.get('/all', async (req, res) => {
  const { roomId } = req.query;
  if (!roomId) return res.status(400).json({ error: "roomId required" });
  try {
    const reviews = await Review.find({ roomId });
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;