const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  roomId: { type: String, required: true }, 
  reviewedClientUsn: { type: String, required: true }, 
  reviews: [
    {
      reviewerName: { type: String, required: true }, 
      reviewerRole: { type: String, enum: ['host', 'client'], required: true },
      rating: { type: Number, min: 0, max: 10, required: true },
      comment: { type: String, required: true }
    }
  ]
});

module.exports = mongoose.model('Review', reviewSchema);