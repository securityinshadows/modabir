// trendingAlertController.js
const asyncHandler = require('express-async-handler');
const TrendingAlert = require('../models/TrendingAlert');
const mongoose = require('mongoose');

// @desc    Get all trending alerts with pagination and filtering
// @route   GET /api/trending-alerts
// @access  Public
const getTrendingAlerts = asyncHandler(async (req, res) => {
  try {
    // Extract query parameters with defaults
    const { type, severity, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const filter = {};

    // Apply filters if provided
    if (type) filter.type = { $regex: type, $options: 'i' };
    if (severity) filter.severity = severity;

    // Only show non-expired alerts by default
    if (req.query.includeExpired !== 'true') {
      filter.expiresAt = { $gt: new Date() };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Query database with pagination and sorting
    const alerts = await TrendingAlert.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('reports', 'type urgency description location createdAt');

    // Count total matching documents for pagination
    const total = await TrendingAlert.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching trending alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trending alerts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get a single trending alert by ID
// @route   GET /api/trending-alerts/:id
// @access  Public
const getTrendingAlertById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trending alert ID format'
      });
    }

    // Find alert and populate related reports
    const alert = await TrendingAlert.findById(id)
      .populate('reports', 'type urgency description location createdAt');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Trending alert not found'
      });
    }

    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Error fetching trending alert:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trending alert',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = {
  getTrendingAlerts,
  getTrendingAlertById
};