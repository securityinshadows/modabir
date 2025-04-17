// Import necessary modules
// JWT for token generation
// Bcrypt for password hashing
// AsyncHandler for handling async errors in Express
// Admin model for database operations
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const Admin = require('../models/Admin');

// @desc    Register a new admin
// @route   POST /api/admins/register
// @access  Public
// we pull the admin data from the request body by destructuring it
// We check if all required fields are provided in the request body
const registerAdmin = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password) {
    res.status(400).json({ success: false, message: 'Please provide all required fields' });
    return;
  }

// Checking if the admin already exists in the database
const adminExists = await Admin.findOne({ email });
// If the admin already exists, we send a 400 Bad Request response with an error message
  if (adminExists) {
    res.status(400).json({ success: false, message: 'Authority user already exists' });
    // We stop the execution of the code here
    return;
  }

  // Create a new admin
  const admin = await Admin.create({
    username,
    email,
    password, // Password will be hashed automatically by the pre-save hook in the Admin model
    role: role || 'admin', // Default role is 'admin'
  });

  if (admin) {
    res.status(201).json({
      _id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin.id),
    });
  } else {
    res.status(400).json({ success: false, message: 'Invalid authority data' });
  }
});

// @desc    Authenticate admin and get token
// @route   POST /api/admins/login
// @access  Public
const loginAdmin = asyncHandler(async (req, res) => {
// We deconstruct the request body to get the email and password
  const { email, password } = req.body;

// Look up the admin in MongoDB by email
  const admin = await Admin.findOne({ email });
// If the admin exists and his password matches the hashed password in the database, we generate a JWT token and send it back to the client
// If the admin does not exist or the password does not match, we send a 401 Unauthorized response
// matchPassword is a method defined in the Admin model
  if (admin && (await admin.matchPassword(password))) {
    res.json({
      _id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin.id),
    });
  } else {
// We don't reveal if the password or email was incorrect to prevent user enumeration attacks
    res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
});

// JWT token generation
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

module.exports = {
  registerAdmin,
  loginAdmin,
};