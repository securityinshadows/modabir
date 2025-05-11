// We import the required modules
// asyncHandler handles errors in async functions automatically
const asyncHandler = require('express-async-handler');
// This is the data model containing the schema
const Alert = require('../models/Alert');
// Mongoose is used to interact with MongoDB
const mongoose = require('mongoose');
const { broadcast } = require('../utils/webSocketService');

// @desc    Create a new alert
// @route   POST /api/alerts
// @access  Private (Admin only)
const createAlert = asyncHandler(async (req, res) => {
  // We deconstruct the request body to get the alert details
  const { type, coordinates, severity, description, expiresInHours } = req.body;
  // We check if all required fields are provided in the req body.
  if (!type || !severity || !description || !coordinates) {
    // Error message if any field is missing
    res.status(400).json({ success: false, message: 'All fields are required including coordinates' });
    // We stop the function execution here
    return;
    // We limit severity's values to low, medium, or high
  } else if (!['low', 'medium', 'high'].includes(severity)) {
    // We validate the severity level
    res.status(400).json({ success: false, message: 'Invalid severity level' });
    return;
    // We check if the coordinates are in the correct format
  } else if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    res.status(400).json({ success: false, message: 'Coordinates must be an array of [longitude, latitude]' });
    return;
  }
  // We ensure coordinates are within Morocco's boundaries
  const [lng, lat] = coordinates;
  if (lng < -13.5 || lng > -1 || lat < 27 || lat > 36) {
    res.status(400).json({ success: false, message: 'Coordinates must be within Morocco' });
    return;
  }
  // We set the alert expiration time, it defaults to 24hrs if not provided
  const expirationHours = expiresInHours || 24;

  const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);
  // We save the alert in the database with the provided details
  const alert = await Alert.create({
    type,
    location: {
      type: 'Point',
      coordinates,
    },
    severity,
    description,
    createdBy: req.admin._id,
    expiresAt,
  });
  // We broadcast the new alert to all connected clients
  broadcast(alert);
    // We send a success response with the alert data and expiration time 
  res.status(201).json({

    success: true,
    data: alert,
    message: 'Alert created successfully, expires at ' + expiresAt.toISOString(),
  });
  // We log the alert creation details
  // This is useful for debugging and tracking purposes
  console.log(`Alert created by admin ${req.admin._id} at ${new Date().toISOString()}, with expiration at ${expiresAt.toISOString()}`);
});

// @desc    Get all alerts (with filtering, pagination, sorting, and optional proximity)
// @route   GET /api/alerts
// @access  Public
const getAlerts = asyncHandler(async (req, res) => {
  // We deconstruct the query parameters from the request
  // These parameters are used to filter the alerts based on severity, type, location, and proximity
  const { severity, type, location, near } = req.query;
  const filter = {};
  // We check if the severity, type, or location query parameters are provided
  // If they are, we add them to the filter object
  // The filter object is used to query the database for alerts that match the specified criteria
  // The $regex operator is used to perform a case-insensitive search
  if (severity) filter.severity = severity;
  if (type) filter.type = { $regex: type, $options: 'i' };
  if (location) filter.location = { $regex: location, $options: 'i' };

  // Leaflet/OSM proximity search using $nearSphere
  // This is used to find alerts within a certain radius of a given point
  // The near query parameter is expected to be in the format "longitude,latitude"
  if (near) {
    // We check if the near parameter is provided in the correct format
    // The coordinates are split by a comma and converted to numbers
    const [lng, lat] = near.split(',').map(Number);
    // We check if the coordinates are valid numbers
    // If they are, we create a geospatial query to find alerts within a certain radius
    // A geospacial query is defined as a point in space, and a radius around it
    if (!isNaN(lng) && !isNaN(lat)) {
      const radiusInKm = 5; // Radius
      const earthRadius = 6378.1; // Earth's radius in km
      filter.location = {
        // The $geoWithin operator is used to find documents within a specified area
        $geoWithin: {
          // The $centerSphere operator is used to find documents within a specified radius
          // The radius is specified in kilometers, and the Earth's radius is used to convert it to radians
          $centerSphere: [[lng, lat], radiusInKm / earthRadius]
        }
      };
    }
  }
  
  // We extract the values of the query parameters from the request object
  // We check if the sortBy parameter is provided, if not we default to sorting by createdAt in descending order
  const sortBy = req.query.sort || '-createdAt';
  // We check if the page parameter is provided, if not we default to page 1
  const page = parseInt(req.query.page) || 1;
  // We check if the limit parameter is provided, if not we default to 10
  // The limit parameter is used to limit the number of alerts returned in the response
  // This is done to facilitate pagination in the frontend
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let query = Alert.find(filter)
  // We check if the near parameter is provided, if so we set the sortBy to undefined
  // This is done to ensure that the alerts are sorted by proximity rather than by createdAt
    .sort(near ? undefined : sortBy) // Sort by createdAt if not near search 
    .skip(skip)
  // We limit the number of alerts returned in the response
    .limit(limit)
  // We populate the createdBy field with the username and email of the admin that created the alert
    .populate('createdBy', 'username email');

  const alerts = await query;
  // totalAlerts is used to count the total number of alerts that match the filter criteria
  // This is done to calculate the total number of pages for pagination
  // The countDocuments method is used to count the number of documents that match the filter criteria
  const totalAlerts = await Alert.countDocuments(filter);


  // We send a success response with the alerts data and pagination information
  res.status(200).json({
    success: true,
    data: alerts,
    pagination: {
      page,
      limit,
      total: totalAlerts,
      totalPages: Math.ceil(totalAlerts / limit),
    },
  });
});

// @desc    Get a specific alert by ID
// @route   GET /api/alerts/:id
// @access  Public
const getAlertById = asyncHandler(async (req, res) => {
  // We deconstruct the id parameter from the request
  const { id } = req.params;

 // We validate the id's format using the mongoose.Types.ObjectId.isValid method
  if (!mongoose.Types.ObjectId.isValid(id)) {
    // If the id's format isn't MongoDB compatible, we send a 400 error response
    // This is done to ensure that the id is in the correct format before querying the database
    // This prevents unnecessary database queries and improves performance
    res.status(400).json({ success: false, message: 'Invalid alert ID format' });
    return;
  }

  // We query the database for the alert with the provided id
  const alert = await Alert.findById(id)
    .populate('createdBy', 'username email')
    // .lean() converts the Mongoose document to a plain JavaScript object
    // This is done to improve performance and reduce memory usage
    .lean();
  // If the queried alert is not found, we send a 404 error response  
  if (!alert) {
    res.status(404).json({ success: false, message: 'Alert not found' });
    return;
  }
  // We log the access details of the alert
  console.log(`Alert ${id} accessed at ${new Date().toISOString()}`);
  // We send a success response with the alert data
  // This is done to ensure that the alert data is returned in the response
  // This function is public and does not require authentication so that everyone can fetch alerts
  res.status(200).json({
    success: true,
    data: alert,
  });
});

// @desc    Update an alert
// @route   PUT /api/alerts/:id
// @access  Private (Admin only)
const updateAlert = asyncHandler(async (req, res) => {
  // This logic is similar to getAlertById
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid alert ID format' });
    return;
  }

  const existingAlert = await Alert.findById(id);
  if (!existingAlert) {
    res.status(404).json({ success: false, message: 'Alert not found' });
    return;
  }
  // We specify the fields that can be updated in the alert
  const { severity, description, coordinates } = req.body;
  // updateFields is an object that will hold the fields to be updated
  // We check if the severity, description, or coordinates fields are provided in the request body
  const updateFields = {};

  if (severity) {
    // Error handling for 'severity' as outlined above in createAlert
    if (!['low', 'medium', 'high'].includes(severity)) {
      res.status(400).json({ success: false, message: 'Severity must be either low, medium, or high' });
      return;
    }
    // We check if the severity is valid and add it to the updateFields object
    updateFields.severity = severity;
  }
  // We update the other fields with similar logic, check createAlert for explanation
  if (description) updateFields.description = description;

  if (coordinates) {
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      res.status(400).json({ success: false, message: 'Coordinates must be an array of [longitude, latitude]' });
      return;
    }

    const [lng, lat] = coordinates;
    if (lng < -17.5 || lng > -1 || lat < 20.5 || lat > 36) {
      res.status(400).json({ success: false, message: 'Coordinates must be within Morocco' });
      return;
    }
    

    updateFields['location'] = {
      type: 'Point',
      coordinates,
    };
  }

  // We check if at least one field is provided for update
  // If no fields are provided, we send a 400 error response
  if (Object.keys(updateFields).length === 0) {
    res.status(400).json({ success: false, message: 'At least one field must be updated' });
    return;
  }
  // We update the alert in the database with the provided fields
  // The findByIdAndUpdate method is used to find the alert by id and update it with the provided fields
  const updated = await Alert.findByIdAndUpdate(id, updateFields, {
    // new: true returns the updated document
    // runValidators: true ensures that the update is validated against the schema
    // This is done to ensure that the updated document meets the schema requirements
    new: true,
    runValidators: true,
  }).populate('createdBy', 'username email');
  // We log the update activity
  console.log(`Alert ${id} updated by admin ${req.admin._id} at ${new Date().toISOString()}`);
  console.log('Changes made:', updateFields);
  broadcast(updated);
  // We send a success response with the updated alert data
  res.status(200).json({
    success: true,
    data: updated,
    message: 'Alert updated successfully',
  });
});

// @desc    Delete an alert
// @route   DELETE /api/alerts/:id
// @access  Private (Admin only)
const deleteAlert = asyncHandler(async (req, res) => {
  // The logic here is similar to getAlertById
  const { id } = req.params;
  // We validate the alert id's format and check if the alert exists
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid alert ID format' });
    return;
  }


  // If the alert exists we delete it from the database
  const deletedAlert = await Alert.findByIdAndDelete(id);
  // Otherwise we return a 404 response
  if (!deletedAlert) {
    res.status(404).json({ success: false, message: 'Alert not found' });
    return;
  }
  // We log the deletion activity
  console.log(`Alert ${id} deleted by admin ${req.admin._id} at ${new Date().toISOString()}`);

  broadcast(deletedAlert);
  // We return a success response with the deleted alert id
  res.status(200).json({
    success: true,
    message: 'Alert deleted successfully',
    deletedId: id,
  });
});

// We export the functions to be used in the routes
module.exports = {
  createAlert,
  getAlerts,
  getAlertById,
  updateAlert,
  deleteAlert,
};
