
const express = require('express');
const router = express.Router();
const {
  getTrendingAlerts,
  getTrendingAlertById
} = require('../controllers/trendingAlertController');

// Public routes
router.get('/', getTrendingAlerts);
router.get('/:id', getTrendingAlertById);

module.exports = router;