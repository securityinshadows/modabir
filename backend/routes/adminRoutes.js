const express = require('express');
const router = express.Router();
const { loginAdmin } = require('../controllers/adminController');
const { registerAdmin } = require('../controllers/adminController');

// this is the route for admin login
router.post('/login', loginAdmin);
router.post('/register', registerAdmin);


module.exports = router;