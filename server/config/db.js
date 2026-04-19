/**
 * MongoDB Database Connection
 * Uses Mongoose to connect to MongoDB with error handling
 */
const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri || typeof uri !== 'string' || !uri.trim()) {
    console.error(
      'Missing MONGODB_URI. Set it in Render: Dashboard → your Web Service → Environment → add MONGODB_URI (e.g. MongoDB Atlas connection string).'
    );
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
