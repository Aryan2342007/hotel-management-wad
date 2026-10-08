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

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotel_management_db';
    console.log(`[MongoDB] Connecting to database...`);
    const conn = await mongoose.connect(uri, {
      autoIndex: true, // Build indexes automatically in ADBMS
      serverSelectionTimeoutMS: 8000,
    });

    console.log(`[MongoDB Connected] Host: ${conn.connection.host}, Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    // Do not call process.exit(1) so Express stays alive and can report health & reconnect
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB Warning]: Disconnected from database');
});

mongoose.connection.on('error', (err) => {
  console.error('[MongoDB Error]:', err);
});

module.exports = connectDB;
