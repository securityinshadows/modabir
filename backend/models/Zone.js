const mongoose = require('mongoose');

// We define the zone schema
const ZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a zone name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  type: {
    type: String,
    required: [true, 'Please specify zone type'],
    enum: ['safe-area', 'evacuation', 'medical', 'shelter', 'hazard']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  geometry: {
    type: {
      type: String,
      enum: ['Polygon'],
      required: true
    },
    coordinates: {
      type: [[[Number]]],
      required: true
    }
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Admin',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Admin',
    default: null // this field is for auditing updates from admins
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: null 
  }
});

// we create geospatial index for efficient queries 
ZoneSchema.index({ geometry: '2dsphere' });

module.exports = mongoose.model('Zone', ZoneSchema);
