const express = require('express');
const router = express.Router();

// Importing the zone controller functions
const {
  createZone,
  getZones,
  getZoneById,
  updateZone,
  deleteZone
} = require('../controllers/zoneController');

// Importing authentication and authorization middleware
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/authMiddleware');

// Route to create a new zone (protected)
// This route is only accessible to authenticated admins (check zoneController & authMiddleware documents)
router.post('/', protect, adminOnly, createZone);

// Route to fetch all zones (public), accessible to any user
router.get('/', getZones);

// Route to fetch a specific zone by ID (public)
router.get('/:id', getZoneById);

// Route to update a zone (protected)
// Only admins can perform this action
router.put('/:id', protect, adminOnly, updateZone);

// Route to delete a zone (protected)
// Only admins can perform this action
router.delete('/:id', protect, adminOnly, deleteZone);

module.exports = router;