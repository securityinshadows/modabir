const mongoose = require('mongoose');

// Defining the trending alert document structure in the Modabir database
// Trending reports become a special alert that is shown to users
const trendingAlertSchema = new mongoose.Schema({
    // The structure is similar to Alert & Report
  type: {
    type: String,
    enum: ['flood', 'fire', 'earthquake', 'storm', 'medical'],
    required: true,
  },
  // Optional summary of trending reports, we could use Gemini API for this or simply rely on an automated response
  summary: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  // This field tracks how many indiv reports are contributing to the trend
  reportCount: Number,
  // This is an array of report IDs that are contributing to the trend, useful for admin dashboard operations
  reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Report' }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// This allows for geospatial queries, we will use this for the trending logic

trendingAlertSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('TrendingAlert', trendingAlertSchema);
