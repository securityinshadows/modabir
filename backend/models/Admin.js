// Importing necessary modules for this model, bcrypt is used for hashing passwords
// and mongoose is used for creating the schema and model.
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Defining the schema for the Admin model
// This schema includes fields for username, email, password, and role.
const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please add a username'],
    unique: true,
    trim: true, // Ensures no leading or trailing spaces
  },
  
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, // This validates the email format or pattern
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['admin', 'superadmin'], // currently optional to differentiate admin roles
    default: 'admin',
  },
}, {
  timestamps: true,
});

// We hash the password before saving it to the database
adminSchema.pre('save', async function (next) {
    // If the password is not modified, we skip hashing it
  // This is important for the update profile operation, as we don't want to hash the password again if it's not changed
  if (!this.isModified('password')) {
    return next();
  }
    // If the password is modified, we hash it using bcrypt
    // We generate a salt and then hash the password with the salt, that way if two people have the same password the salt can differentiate between them
    // 10 rounds of computing are required to generate the salt, effectively slowing down bruteforce attacks
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// We use this to compare the saved password hash with the enterred password hash
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);