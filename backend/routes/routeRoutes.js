const express = require('express');
const router = express.Router();

// Importing the route controller functions
const { generateRoute, getRouteById, getAllRoutes, deleteRoute, updateRoute } = require('../controllers/routeController');

// Importing authentication and authorization middleware
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Route to generate a new route (protected)
// Only authenticated admins can generate a route
router.post('/generate', protect, adminOnly, generateRoute);

// Route to fetch a specific route by ID (public)
router.get('/:id', getRouteById);
// Route to fetch all routes (public)
router.get('/', getAllRoutes);
// Route to update a route (protected)
router.put('/:id', protect, adminOnly, updateRoute);
// Route to delete a route (protected)
router.delete('/:id', protect, adminOnly, deleteRoute);
module.exports = router;
