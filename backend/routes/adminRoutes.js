const express = require('express');
const router = express.Router();
const { loginAdmin } = require('../controllers/adminController');
const { registerAdmin } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { getAllAdmins } = require('../controllers/adminController');
const { adminOnly } = require('../middleware/authMiddleware');

// this is the route for admin login & register
router.post('/login', loginAdmin);
router.post('/register', protect, adminOnly, registerAdmin);

router.get('/', protect, adminOnly, getAllAdmins);


module.exports = router;