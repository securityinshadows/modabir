const mongoose = require('mongoose');

// This file defines the Route model for the Modabir application
// It is used to interact with the Route collection in the database
// Routes are paths that can be used for evacuation, supply, or emergency access
// Routes are defined by their geometry (a line), start and end points, distance, safety score, and any zones or alerts to avoid
// The model also includes a reference to the admin who created the route
// The schema includes geospatial indexes for efficient querying of routes based on their geometry and points
const RouteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Route name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['evacuation', 'supply', 'emergency-access'],
    required: true
  },
  geometry: {
    type: {
      type: String,
      enum: ['LineString'],
      default: 'LineString'
    },
    coordinates: {
      type: [[Number]], // [[lng,lat], [lng,lat], ...]
      required: true
    }
  },
  startPoint: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number] // [lng, lat]
  },
  endPoint: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number] // [lng, lat]
  },
  distance: { // in meters
    type: Number,
    required: true
  },
  safetyScore: { // 0-100 scale
    type: Number,
    min: 0,
    max: 100
  },
  avoids: {
    zones: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Zone' 
    }],
    alerts: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Alert' 
    }]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, { timestamps: true });

// Geospatial index for efficient queries
RouteSchema.index({ geometry: '2dsphere' });
RouteSchema.index({ startPoint: '2dsphere' });
RouteSchema.index({ endPoint: '2dsphere' });

module.exports = mongoose.model('Route', RouteSchema);