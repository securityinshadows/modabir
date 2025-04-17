// We import express and create a router instance
const express = require('express');
const router = express.Router();
// These are the required controllers for the routes
const {
  createReport,
  getReports,
  getReportById,
  getSimilarReports,
  deleteReport,
  deleteSimilarReports,
} = require('../controllers/reportController');


// We import the middleware for authentication and authorization
// This middleware is used to protect the routes and restrict access to admin users only
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Route to post a report (public)
router.post('/', createReport);

// Admin-only routes

// Route to get all reports + filters (protected)
router.get('/', protect, adminOnly, getReports);
// Fetch one report by id (protected)
router.get('/:id', protect, adminOnly, getReportById); 
// Find similar reports to a given report (protected)
router.get('/:id/similar', protect, adminOnly, getSimilarReports); 
// Delete one report by id (protected)
router.delete('/:id', protect, adminOnly, deleteReport); 
// Delete all similar reports to a given report (protected)
router.delete('/:id/similar', protect, adminOnly, deleteSimilarReports);

module.exports = router;
