
const mongoose = require('mongoose');
require("dotenv").config({ path: "./config.env" });

const connectToServer = async () => {
  try {
    const conn = await mongoose.connect(process.env.ATLAS_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("Error connecting to MongoDB with Mongoose:", err);
    process.exit(1);
  }
};

module.exports = { connectToServer };
