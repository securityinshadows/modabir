const asyncHandler = require('express-async-handler');
const Operation = require('../models/Operation');
const mongoose = require('mongoose');

// @desc    Create a new operation
// @route   POST /api/operations
// @access  Private (Admin only)
const createOperation = asyncHandler(async (req, res) => {
    // We create the fields to be filled
  const { name, description, status, location, startDate, endDate } = req.body;
    // We set up error handling when required fields are left empty
  if (!name || !description || !location || !startDate) {
    res.status(400).json({ success: false, message: 'Name, description, location and start date are required' });
    return;
  }
  
// We ensure that the first word is 'Operation' to ensure standardization
  const operationPrefix = "Operation ";
    if (!name.startsWith(operationPrefix)) {
      return res.status(400).json({ 
        success: false, 
        message: `Operation name must start with "${operationPrefix}"` 
      });
    }
  // We check if the coordinates are in the correct format
  if (!Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
    res.status(400).json({ success: false, message: 'Coordinates must be an array of [longitude, latitude]' });
    return;
  }
  // We check if the coordinates are real
  const [lng, lat] = location.coordinates;
  if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
    res.status(400).json({ success: false, message: 'Invalid coordinates' });
    return;
  }
  
  // We set up error handling for when status enum is not respected
  if (status && !['planned', 'active', 'completed', 'cancelled'].includes(status)) {
    res.status(400).json({ success: false, message: 'Invalid status' });
    return;
  }

  // We create the operation
  try{
  const operation = await Operation.create({
    name,
    description,
    status: status || 'planned',
    location: {
      type: 'Point',
      coordinates: [lng, lat]
    },
    startDate,
    endDate,
    createdBy: req.admin._id
  });

  // We return a 201 Created message
  res.status(201).json({
    success: true,
    data: operation,
    message: 'Operation created successfully'
  });
  // We log the activity for auditing purposes
  console.log(`Operation created by admin ${req.admin._id} at ${new Date().toISOString()}`);
}
catch (err) {
  if (err.code===11000) {
    res.status(400).send({status: 'failed', message:'Operation already exists'})
  } else {
    res.status(500).send({message: 'Internal Server Error'})
  }
  }
}); 

// @desc    Get all operations
// @route   GET /api/operations
// @access  Public
// Now we set up fetching operations with filtering, pagination, and sorting
const getOperations = asyncHandler(async (req, res) => {
  const { status, name, near } = req.query;
  const filter = {};

    // We create the name and filter status
  if (status) filter.status = status;
  if (name) filter.name = { $regex: name, $options: 'i' };

  if (near) {
    // We check if the near parameter is in the correct format
    // The coordinates are split by a comma and converted to numbers
    const [lng, lat] = near.split(',').map(Number);
    if (!isNaN(lng) && !isNaN(lat)) {
      const radiusInKm = 5;
      const earthRadius = 6378.1;
      filter.location = {
        $geoWithin: {
          $centerSphere: [[lng, lat], radiusInKm / earthRadius]
        }
      };
    }
  }
  const sortBy = req.query.sort || '-createdAt';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let query = Operation.find(filter)
    .sort(near ? undefined : sortBy)
    .skip(skip)
    .limit(limit)
    .populate('createdBy', 'username email');

  const operations = await query;
  const totalOperations = await Operation.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: operations,
    pagination: {
      page,
      limit,
      total: totalOperations,
      totalPages: Math.ceil(totalOperations / limit),
    },
  });
});

// @desc    Get a specific operation by ID
// @route   GET /api/operations/:id
// @access  Public
const getOperationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // We validate the operation ID format

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid operation ID format' });
    return;
  }

  const operation = await Operation.findById(id)
    .populate('createdBy', 'username email')
    .lean();

  // We check if the operation doesn't exist to handle its error properly
  if (!operation) {
    res.status(404).json({ success: false, message: 'Operation not found' });
    return;
  }
  // We log the activity
  console.log(`Operation ${id} accessed at ${new Date().toISOString()}`);
  
  res.status(200).json({
    success: true,
    data: operation,
  });
});

// @desc    Update an operation
// @route   PUT /api/operations/:id
// @access  Private (Admin only)
const updateOperation = asyncHandler(async (req, res) => {
  try {
  const { id } = req.params;
// We validate the ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid operation ID format' });
    return;
  }

//We fetch the operation, if it doesn't exist we return a 404 not found message
  const existingOperation = await Operation.findById(id);
  if (!existingOperation) {
    res.status(404).json({ success: false, message: 'Operation not found' });
    return;
  }
// Otherwise we prepare our fields 
  const { name, description, status, location, startDate, endDate } = req.body;
  const updateFields = {};

// We ensure the Operation Prefix is respected:
if (name) {
  const operationPrefix = "Operation ";
  if (!name.startsWith(operationPrefix)) {
    return res.status(400).json({ 
      success: false, 
      message: `Operation name must start with "${operationPrefix}"` 
    });
  }
  updateFields.name = name;
}
// The new fields replace the old inputs
  if (name) updateFields.name = name;
  if (description) updateFields.description = description;
// We make sure status' enum is respected
  if (status) {
    if (!['planned', 'active', 'completed', 'cancelled'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status value' });
      return;
    }
    // We then update status
    updateFields.status = status;
  }
// Same logic here, we check location's validty then update
  if (location) {
    if (!Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
      res.status(400).json({ success: false, message: 'Coordinates must be an array of [longitude, latitude]' });
      return;
    }
    const [lng, lat] = location.coordinates;
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      res.status(400).json({ success: false, message: 'Invalid coordinates' });
      return;
    }
    updateFields.location = {
      type: 'Point',
      coordinates: [lng, lat]
    };
  }

  // We update the start and end date fields
  if (startDate) updateFields.startDate = startDate;
  if (endDate) updateFields.endDate = endDate;
// When no field is updated in a PUT request we return a bad request message
  if (Object.keys(updateFields).length === 0) {
    res.status(400).json({ success: false, message: 'At least one field must be updated' });
    return;
  }

  // Otherwise we update the field and log the activity and changes
  const updated = await Operation.findByIdAndUpdate(id, updateFields, {
    new: true,
    runValidators: true,
  }).populate('createdBy', 'username email');

  console.log(`Operation ${id} updated by admin ${req.admin._id} at ${new Date().toISOString()}`);
  console.log('Changes made:', updateFields);
  // We return a 200 OK message
  res.status(200).json({
    success: true,
    data: updated,
    message: 'Operation updated successfully',
  });
} catch (error) {
  if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
    return res.status(400).json({ 
      success: false, 
      message: 'An operation with this name already exists' 
    });
  }
}

});

// @desc    Delete an operation
// @route   DELETE /api/operations/:id
// @access  Private (Admin only)
const deleteOperation = asyncHandler(async (req, res) => {
  const { id } = req.params;
// We validate the id format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid operation ID format' });
    return;
  }
// We fetch the operation and remove it from the database
  const deletedOperation = await Operation.findByIdAndDelete(id);
// If it doesn't exist we return a 404 not found message
  if (!deletedOperation) {
    res.status(404).json({ success: false, message: 'Operation not found' });
    return;
  }
// We log the activity and return a 200 OK message
  console.log(`Operation ${id} deleted by admin ${req.admin._id} at ${new Date().toISOString()}`);
  
  res.status(200).json({
    success: true,
    message: 'Operation deleted successfully',
    deletedId: id,
  });
});

module.exports = {
  createOperation,
  getOperations,
  getOperationById,
  updateOperation,
  deleteOperation,
};