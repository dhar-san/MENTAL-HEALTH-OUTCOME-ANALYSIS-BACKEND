/**
 * MongoDB Database Connection
 * Uses Mongoose to connect to MongoDB with error handling
 */
const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = (process.env.MONGODB_URI || process.env.DATABASE_URL || '').trim();
  if (!uri) {
    console.error(
      'Missing MongoDB URI. In Render: open this Web Service (not only the Blueprint) → Environment → add one of:\n' +
        '  MONGODB_URI=<your Atlas connection string>  (recommended)\n' +
        '  DATABASE_URL=<same string>  (alias)\n' +
        'Then Save and redeploy. Create a free cluster at https://www.mongodb.com/atlas if needed.'
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
