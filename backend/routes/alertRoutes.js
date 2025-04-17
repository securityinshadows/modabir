const express = require('express');
const router = express.Router();
const { createAlert, getAlerts, getAlertById, updateAlert, deleteAlert } = require('../controllers/alertController');
// the protect middleware is used to protect the routes
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/authMiddleware');

// Route to create a new alert (protected)
// This route is only accessible to authenticated admins (check alertController & authMiddleware documents)
router.post('/', protect, adminOnly, createAlert);

// Route to fetch all alerts (public), as citizens do not require auth to see them
router.get('/', getAlerts);

// Route to fetch a specific alert by ID (public)
router.get('/:id', getAlertById);

// Route to update an alert (protected)
router.put('/:id', protect, adminOnly, updateAlert);

// Route to delete an alert (protected)
router.delete('/:id', protect, adminOnly, deleteAlert);

module.exports = router;