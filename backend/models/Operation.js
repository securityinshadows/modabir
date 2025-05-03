const mongoose = require('mongoose');

// Define the operation schema
// This schema is used to create a model for operations in the database
// Think of operations like containers of posts, like a Whatsapp Channel
const operationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      unique: true,
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [500, 'Description cannot be more than 500 characters']
    },
    status: {
      type: String,
      enum: ['planned', 'active', 'completed', 'cancelled'],
      default: 'planned'
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function(coords) {
            // Validate if the coordinates are real
            return coords.length === 2 && 
                   coords[0] >= -180 && coords[0] <= 180 && 
                   coords[1] >= -90 && coords[1] <= 90;
          },
          message: 'Invalid coordinates'
        }
      }
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Geospatial index for location
operationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Operation', operationSchema);