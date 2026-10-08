// Only use custom DNS resolver on Windows local dev if needed
if (process.platform === 'win32' && process.env.NODE_ENV !== 'production') {
  try {
    const dns = require('dns');
    dns.setServers(['8.8.8.8', '8.8.4.4']);
  } catch (err) {
    // Ignore DNS override errors
  }
}

const mongoose = require('mongoose');

let lastConnectionError = null;
let retryTimeout = null;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotel_management_db';
    uri = uri.trim().replace(/^["']|["']$/g, '');
    
    console.log(`[MongoDB] Connecting to database...`);
    const conn = await mongoose.connect(uri, {
      autoIndex: true, // Build indexes automatically in ADBMS
      serverSelectionTimeoutMS: 10000,
    });

    lastConnectionError = null;
    if (retryTimeout) clearTimeout(retryTimeout);
    console.log(`[MongoDB Connected] Host: ${conn.connection.host}, Database: ${conn.connection.name}`);
  } catch (error) {
    lastConnectionError = error.message;
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    // Auto retry after 5 seconds if not connected
    if (!retryTimeout) {
      retryTimeout = setTimeout(() => {
        retryTimeout = null;
        connectDB();
      }, 5000);
    }
  }
};

const getLastConnectionError = () => lastConnectionError;

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB Warning]: Disconnected from database');
});

mongoose.connection.on('error', (err) => {
  lastConnectionError = err.message;
  console.error('[MongoDB Error]:', err);
});

module.exports = { connectDB, getLastConnectionError };
