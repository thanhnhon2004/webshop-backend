/**
 * Test Setup & Configuration
 * Initialize database, app, and utilities for tests
 */

const mongoose = require('mongoose');
const config = require('../src/config/environment');

let mongoServer;

/**
 * Connect to MongoDB in-memory for testing
 */
async function connectDB() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ Test database connected');
  } catch (err) {
    console.error('❌ Test database connection failed:', err.message);
    process.exit(1);
  }
}

/**
 * Disconnect from MongoDB
 */
async function disconnectDB() {
  try {
    await mongoose.connection.close();
    console.log('✅ Test database disconnected');
  } catch (err) {
    console.error('❌ Test database disconnection failed:', err.message);
  }
}

/**
 * Clear all collections
 */
async function clearDatabase() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
}

module.exports = {
  connectDB,
  disconnectDB,
  clearDatabase
};
