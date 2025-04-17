const mongoose = require('mongoose');

// Defining the alert document structure in the Modabir database
const alertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Please specify the alert type'],
    },
    location: {
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ['Point'], // 'location.type' must be 'Point'
        default: 'Point',
        required: true
      },
    coordinates: {
      type: [Number],  // [longitude, latitude]
      required: true,
      validate: {
        validator: ([lng, lat]) => (
          lng >= -13.5 && lng <= -1 &&  // Morocco bounds
          lat >= 27 && lat <= 36
        ),
        message: 'Coordinates must be within Morocco'
      },
      },
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: [true, 'Please specify the severity level'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },

    expiresAt: {
      type: Date,
      index: true, // For better query performance
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // Default 24h
    },
    // The admin who created the alert
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
  },
  {
    timestamps: true, // createdAt / updatedAt
  }
);

// Geospatial index for fast queries
alertSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Alert', alertSchema);