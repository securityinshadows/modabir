const mongoose = require('mongoose');

// Defining the report doc structure in Modabir db
const reportSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    // the options are scalable for future prospects
    enum: ['flood', 'fire', 'earthquake', 'storm', 'medical'],
  },
  description: String,
  location: {
    type: {
      type: String,
      // Similar to alerts, the location type is Point
      // This is used for geospatial queries
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], 
      required: true,
    },
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true,
  },
  time: {
    type: Date,
    default: Date.now,
  },
  anonId: {
    // Anonymous identifier which we will use for spam control
    type: String, 
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  urgencyValue: {
    type: Number,
    default: function() {
      const map = { high: 1, medium: 2, low: 3 };
      return map[this.urgency] || 4;
    },
  }
});

// Geospatial index for fast queries
// This index is used for geospatial queries, allowing us to find reports near a specific location

reportSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Report', reportSchema);
