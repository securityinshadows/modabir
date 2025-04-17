// We import the required modules
const asyncHandler = require('express-async-handler');
const Report = require('../models/Report');
const { canPostReport } = require('../utils/spamGuard');
const { checkTrending } = require('../utils/trendingMonitor');
const mongoose = require('mongoose');

// @desc    Create a new emergency report
// @route   POST /api/reports
// @access  Public
// This function handles the creation of a new report
// It is similar to createAlert, check alertController for more detailed documentation and explanation
const createReport = asyncHandler(async (req, res) => {
  // We extract fields off of the request body
  const { type, description, urgency, coordinates, anonId } = req.body;

  // We validate the required fields
  if (!type || !urgency || !coordinates || !anonId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required fields: type, urgency, coordinates, or anonId' 
    });
  }

  // We validate the urgency level
  if (!['low', 'medium', 'high'].includes(urgency)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid urgency level. Must be low, medium, or high' 
    });
  }

  // We validate the coordinate format
  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    return res.status(400).json({ 
      success: false, 
      message: 'Coordinates must be an array of [longitude, latitude]' 
    });
  }

  // We check if the user can post a report based on the spamGuard.js logic
  if (!canPostReport(anonId)) {
    return res.status(429).json({ 
      success: false,
      message: 'You are submitting too frequently. Please wait 2 minutes before submitting another report.' 
    });
  }

  // We use the input information to create a report
  const report = await Report.create({
    type,
    description,
    urgency,
    location: {
      type: 'Point',
      coordinates,
    },
    anonId,
  });

  // We initiate trending analysis (fire-and-forget I.E no await = done while rest of the code executes)
  // This function checks if the report meets the criteria to trigger a trending alert
  try {
    checkTrending(report);
  } catch (error) {
    console.error('Trending analysis failed:', error);
  }

  // Return success response
  res.status(201).json({
    success: true,
    message: 'Report submitted successfully.',
    data: report
  });
});

// @desc    Get all reports with filtering, pagination, and sorting
// @route   GET /api/reports
// @access  Public
// This function retrieves all reports from the database
// Similar to getAlerts, it contains filtering and pagination controls
const getReports = asyncHandler(async (req, res) => {
    // We create filter parameters, e.g. "localhost/api/reports?type=flood&urgency=high&near=12.34,56.78"
  const { type, urgency, near, similarTo } = req.query;
  const filter = {};

  if (type) filter.type = { $regex: type, $options: 'i' };
  if (urgency) filter.urgency = urgency;

  // Handle similar reports query
  // If similarTo is passed, we load the reference report and compare it to others
  // Handle similar reports query
if (similarTo) {
    try {
      if (!mongoose.Types.ObjectId.isValid(similarTo)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid similarTo ID format',
        });
      }
      
      const referenceReport = await Report.findById(similarTo);
      if (referenceReport) {
        filter.type = referenceReport.type;
        filter.urgency = { $in: getUrgencyGroup(referenceReport.urgency) };
        filter.createdAt = { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) };
        filter._id = { $ne: referenceReport._id };
        
        // Replace $nearSphere with $geoWithin
        filter.location = {
          $geoWithin: {
            $centerSphere: [
              referenceReport.location.coordinates,
              3 / 6378.1 // 3km radius
            ]
          }
        };
      }
    } catch (error) {
      console.error('Error finding reference report:', error);
    }
  }
  
  // This handle proximity search (as a filter query)
  if (near) {
    const coords = near.split(',');
    
    // Validate we have exactly 2 values
    if (coords.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Invalid near parameter. Must be in format "longitude,latitude"'
      });
    }
  
    const [lng, lat] = coords.map(Number);
  
    // Validate numeric values and ranges in one check
    if (
      isNaN(lng) || isNaN(lat) ||
      Math.abs(lng) > 180 || 
      Math.abs(lat) > 90
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates. Must be numbers with longitude between -180 and 180, latitude between -90 and 90'
      });
    }
  
    // Apply the filter
    filter.location = {
      $geoWithin: {
        $centerSphere: [
          [lng, lat],
          5 / 6378.1
        ]
      }
    };
    console.log(`Applying near filter with center: [${lng},${lat}], radius: 5km`);
  }
  // Pagination and sorting controls, used to limit the number of reports returned per page and sort them
  let sortBy = req.query.sort || '-createdAt';
    if (sortBy === 'urgency') sortBy = 'urgencyValue';
    if (sortBy === '-urgency') sortBy = '-urgencyValue';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  // This is the logic to sort reports by urgency using urgency value (to avoid sorting the strings by alphabetical order)
  
  // We validate the page and limit parameters
  const reports = await Report.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit);

  const totalReports = await Report.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: reports.length,
    pagination: {
      page,
      limit,
      total: totalReports,
      totalPages: Math.ceil(totalReports / limit),
    },
    data: reports,
  });

});

// @desc    Get a single report by ID
// @route   GET /api/reports/:id
// @access  Public
// This function retrieves a single report by its ID
const getReportById = asyncHandler(async (req, res) => {
    // We extract the report ID from the request parameters
  const { id } = req.params;

  // We validate the extracted ID format BEFORE querying the database
  // This is important to prevent unnecessary database queries and improve performance
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid report ID format' 
    });
  }

  // We query the database for the report
  const report = await Report.findById(id);
  if (!report) {
    return res.status(404).json({ 
        // If no id is found, we return a 404 error
      success: false, 
      message: 'Report not found' 
    });
  }

    res.status(200).json({
    success: true,
    data: report,
  });
});

// @desc    Get similar reports to a specific report
// @route   GET /api/reports/:id/similar
// @access  Public
// This function retrieves reports that are similar to a specific report
// It uses the reference report's type, urgency, and location to find similar reports
const getSimilarReports = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // We validate the report's ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid report ID format' 
    });
  }

  // We find the reference report first
  const reference = await Report.findById(id);
  if (!reference) {
    return res.status(404).json({ 
      success: false, 
      message: 'Report not found' 
    });
  }

  // Then we compare the report's type, urgency, and location to find similar reports
    // We exclude the reference report itself from the results
    const similar = await Report.find({
        _id: { $ne: id },
        type: reference.type,
        urgency: { $in: getUrgencyGroup(reference.urgency) },
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        //  $geoWithin used instead of nearSphere after TC-42 failure
        location: {
          $geoWithin: {
            $centerSphere: [
              reference.location.coordinates,
              3 / 6378.1 // 3km radius
            ]
          }
        }
      }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: similar.length,
    data: similar,
  });
});

// This function determines the urgency group based on the sum of urgency levels
// It is used to find similar reports based on their urgency levels
// This allows for more flexibility in finding similar reports
function getUrgencyGroup(urgency) {
  const groups = {
    // A report with a low urgency level can be grouped with medium urgency reports
    low: ['low', 'medium'],
    // A report with a medium urgency level can be grouped with both low and high urgency reports
    medium: ['low', 'medium', 'high'],
    // A report with a high urgency level can be grouped with medium urgency reports
    high: ['medium', 'high'],
  };
  return groups[urgency] || [];
}

// @desc    Delete a specific report by ID
// @route   DELETE /api/reports/:id
// @access  Admin
// Similar to deleteAlert, this function deletes a report by its ID
// It is used for admin operations and requires authentication
const deleteReport = asyncHandler(async (req, res) => {
    // We extract the report ID from the request parameters
    const { id } = req.params;
    // We validate the ID's format prior to db queries
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID format',
      });
    }
    // We look for the report in the database
    const report = await Report.findById(id);
    if (!report) {
        // If not found, we return a 404 error
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }
    // We delete the report from the database
    await report.deleteOne();
    // We return a success response
  
    res.status(200).json({
      success: true,
      message: 'Report successfully dismissed.',
    });
  });

// @desc    Delete all similar reports to a given report
// @route   DELETE /api/reports/:id/similar
// @access  Admin
// This function is not so different from deleteReport, the only difference is how we find the reports
// It is used for admin operations and requires authentication
const deleteSimilarReports = asyncHandler(async (req, res) => {
    // We extract the report ID and validate it
    const { id } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID format',
      });
    }

    // We look for the reference report in the db
    const reference = await Report.findById(id);
    if (!reference) {
      return res.status(404).json({
        success: false,
        message: 'Reference report not found',
      });
    }
  
    // We build the similarity criteria based on the reference report
    const filter = {
        _id: { $ne: reference._id },
        type: reference.type,
        urgency: { $in: getUrgencyGroup(reference.urgency) },
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        // $nearSphere replaced by $geoWithin after TC-54 failure
        location: {
          $geoWithin: {
            $centerSphere: [
              reference.location.coordinates,
              3 / 6378.1 // 3km radius
            ]
          }
        }
      };
    // We delete all similar reports from the database
    const result = await Report.deleteMany(filter);
    // We check if any reports were deleted
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'No similar reports found to delete',
      });
    }else {
        console.log(`Deleted ${result.deletedCount} similar reports.`);
        }
    // We return a success response with the number of deleted reports
    // This is important for the admin dashboard to show how many reports were dismissed
    res.status(200).json({
      success: true,
      message: `${result.deletedCount} similar report(s) dismissed.`,
    });
  });
   

// We export all controller functions
module.exports = {
  createReport,
  getReports,
  getReportById,
  getSimilarReports,
  deleteReport,
  deleteSimilarReports,
};