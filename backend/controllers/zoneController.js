const asyncHandler = require('express-async-handler');
const Zone = require('../models/Zone');
const mongoose = require('mongoose');

// @desc    Create a new zone
// @route   POST /api/zones
// @access  Private (Admin only)
// This function (similar to previous createX functions) handles the creation of a new zone
// Zones are polygons displayed on a map showing a certain geographical area
// Zones will be sent by authorities to citizens to facilate real-time information sharing and coordinate action
const createZone = asyncHandler(async (req, res) => {
  try {
    const { name, type, description } = req.body;

    // Modify the coordinates validation to handle both formats:
const rawCoordinates = req.body.coordinates || 
(req.body.geometry && req.body.geometry.coordinates && req.body.geometry.coordinates[0]);

if (!rawCoordinates || !Array.isArray(rawCoordinates)) {
return res.status(400).json({
success: false,
message: 'Valid coordinates array is required'
});
}

// Flatten nested arrays if necessary
const coordinates = Array.isArray(rawCoordinates[0][0]) 
? rawCoordinates[0]  // If already nested, use the inner array
: rawCoordinates;     // If flat, use directly

    // We check if required fields are missing or malformed
    if (!name || !type || !coordinates || !Array.isArray(coordinates)) {
      return res.status(400).json({
        success: false,
        message: 'Name, type, and coordinates array are required'
      });
    }

    // We ensure the polygon has at least 3 points to cover an area
    if (coordinates.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'A zone must have at least 3 coordinates to form a polygon'
      });
    }

    // Validate GeoJSON polygon (first and last coordinates must match)
    const firstCoord = coordinates[0];
    const lastCoord = coordinates[coordinates.length - 1];
    if (firstCoord[0] !== lastCoord[0] || firstCoord[1] !== lastCoord[1]) {
      return res.status(400).json({
        success: false,
        message: 'Polygon must be closed (first and last coordinates must be identical)'
      });
    }

    // We create the new zone entry in the database
    const zone = await Zone.create({
      name,
      type,
      geometry: {
        type: 'Polygon',
        coordinates: [coordinates] 
        // We wrap coordinates in another array to conform with GeoJSON Polygon format
        // This is done in preparation for Leaflet & OpenStreetMap
      },
      description,
      createdBy: req.admin._id
    });

    // We return a success response with the newly created zone
    res.status(201).json({
      success: true,
      data: zone,
      message: `${type} zone created successfully`
    });
    console.log(`Zone created by admin ${req.admin._id} at ${new Date().toISOString()}`);
  } catch (error) {
    console.error('Error creating zone:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during zone creation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
    // Extra logging and error catching for testing purposes
  }
});

// @desc    Update an existing zone
// @route   PUT /api/zones/:id
// @access  Private (Admin only)
const updateZone = asyncHandler(async (req, res) => {
  try {
    // We extract zone ID from URL
    const { id } = req.params;
    // We etract update fields from request body
    const { name, type, coordinates, description } = req.body;

    // Validate zone ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid zone ID' });
    }

    // Validate coordinates if they're being updated
    if (coordinates) {
      if (!Array.isArray(coordinates)) {
        return res.status(400).json({
          success: false,
          message: 'Coordinates must be an array'
        });
      }
      if (coordinates.length < 3) {
        return res.status(400).json({
          success: false,
          message: 'A zone must have at least 3 coordinates to form a polygon'
        });
      }
      // code to validate the GeoJSON polygon closure
      // since we're using polygons for zones, the first and last coordinate needs to be the same to close the shape
      const firstCoord = coordinates[0];
      const lastCoord = coordinates[coordinates.length - 1];
      if (firstCoord[0] !== lastCoord[0] || firstCoord[1] !== lastCoord[1]) {
        return res.status(400).json({
          success: false,
          message: 'Polygon must be closed (first and last coordinates must be identical)'
        });
      }
    }

    // We prepare the update object
    const updateData = {
      ...(name && { name }),
      ...(type && { type }),
      ...(coordinates && { 
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates]
        }
      }),
      ...(description && { description }),
      updatedAt: Date.now(),
      updatedBy: req.admin._id
    };

    // We update the zone and return the new version
    const zone = await Zone.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!zone) {
      return res.status(404).json({ success: false, message: 'Zone not found' });
    }

    res.status(200).json({
      success: true,
      message: `Zone "${zone.name}" updated successfully`,
      data: zone
    });
  } catch (error) {
    console.error('Error updating zone:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during zone update',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get all zones with pagination, filtering and search
// @route   GET /api/zones
// @access  Public
const getZones = asyncHandler(async (req, res) => {
    // We extract query params with defaults
      const { type, search, page = 1, limit = 10 } = req.query; 
    
      const filter = {};
    
      // We check if a zone type filter is applied
      if (type) {
        filter.type = type;
      }
    
      // We add search functionality using case-insensitive regex matching on zone name
      if (search) {
        filter.name = { $regex: search, $options: 'i' };
      }
    
      // We calculate how many records to skip based on current page and limit
      // This is done to implement pagination
      const skip = (page - 1) * limit;
    
      // We query the database with filters, sort by newest first, apply pagination, and populate admin
      const zones = await Zone.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('createdBy', 'username');
    
      // Total matching records
      const total = await Zone.countDocuments(filter); 
    
      // We return paginated and filtered results to the client
      res.status(200).json({
        success: true,
        count: zones.length,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
        data: zones
      });
    });
    
    // @desc    Get specific zone by ID
    // @route   GET /api/zones/:id
    // @access  Public
    const getZoneById = asyncHandler(async (req, res) => {
        // We extract the zone ID from the route params
      const { id } = req.params; 
    
      // We validate the MongoDB format of the provided ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid zone ID format' });
      }
    
      // We query the database for the zone with the given ID
      const zone = await Zone.findById(id).populate('createdBy', 'username');
    
      if (!zone) {
        // If no ID is found we return a 404 not found response
        return res.status(404).json({ success: false, message: 'Zone not found' });
      }
    
      // We return the zone if found
      res.status(200).json({ success: true, data: zone });
    });
      // @desc    Delete a zone
    // @route   DELETE /api/zones/:id
    // @access  Private (Admin only)
    const deleteZone = asyncHandler(async (req, res) => {
        // We extract the zone ID from request params
        const { id } = req.params;
      
        // We validate the MongoDB ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ success: false, message: 'Invalid zone ID' });

        }
        // We create a const to store the zone's name for the post-deletion message
        // We check if the zone exists in the database
        const zoneToDelete = await Zone.findById(id);
        if (!zoneToDelete) {
          return res.status(404).json({ success: false, message: 'Zone not found' });
        }

        // We store the zone's name before it is deleted to avoid null value
        const zoneName = zoneToDelete.name;

      
        // We attempt to find and delete the zone from the database
        const zone = await Zone.findByIdAndDelete(id);
      
        // If the zone was not found, return 404 error
        if (!zone) {
          return res.status(404).json({ success: false, message: 'Zone not found' });
        }
      
        // We return a success message if the zone is deleted
        // We use the previously stored zone name to provide a more informative message
        res.status(200).json({
          success: true,
          message: `Zone '${zoneName}' deleted successfully`
        });
      });

module.exports = {
  createZone,
  getZones,
  getZoneById,
  updateZone,
  deleteZone,
};