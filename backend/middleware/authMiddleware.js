// Importing necessary modules for this middleware
// This middleware is used to protect routes by checking if the user is authenticated
// and has a valid token. It uses JWT (JSON Web Token) for authentication.
// JWT creates and verifies the tokens
// Admin is the model for the admin user
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
// This function intercepts requests to protected routes and checks if the user is authenticated
// It checks for the presence of a token in the request headers and verifies it
// The req parameter contains the request data
// The res parameter is used to send responses back to the client
// The next parameter passes control to the next middleware function in the stack
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
    // We extract the token from the req header, by breaking the string and taking the second part [1]
      token = req.headers.authorization.split(' ')[1];

    // We verify the token using the secret key stored in the environment variables
    // The decoded token contains the payload of the request, e.g. user id and other information
    // The payload is signed with the secret key to ensure its integrity
    // If the token is valid, we can extract the user information from it
    // If the token is invalid, an error will be thrown and caught in the catch block
    // We also check if there's a timeout for the token, if so we can refresh it

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // We find the admin in the database using the id from the decoded token
    // We exclude the password from the returned admin object to ensure security
    // This is done to prevent sending sensitive information back to the client
      req.admin = await Admin.findById(decoded.id).select('-password'); // Exclude the password
    // Move to the next middleware or route handler
      next(); 
    } catch (error) {
    // error handling
      console.error(error);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

// @desc    Verify admin role (must be used AFTER protect middleware)
// @route   Middleware
// @access  Admin-only routes
const adminOnly = (req, res, next) => {
  // This middleware assumes protect middleware already ran and attached req.admin
  // Check if the user has the role of 'admin'
  if (req.admin && req.admin.role === 'admin') {
    // If the user is an admin, proceed to the next middleware or route handler
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Not authorized as administrator' 
    });
  }
};
module.exports = { protect, adminOnly };