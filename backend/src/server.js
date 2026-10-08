const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStates = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  const stateCode = mongoose.connection.readyState;
  res.json({
    status: 'OK',
    project: 'Hotel Management System (ADBMS)',
    developer: 'Aryan Patel',
    databaseStatus: dbStates[stateCode] || 'Unknown',
    hasMongoUriEnv: Boolean(process.env.MONGODB_URI),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/guests', require('./routes/guestRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));
app.use('/api/checkinout', require('./routes/checkInOutRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/staff', require('./routes/staffRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

const path = require('path');
const fs = require('fs');

// Serve static frontend build in production if present
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.resolve(frontendDistPath, 'index.html'));
  });
}

// 404 & Error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🏨 Hotel Management System Server Running on Port ${PORT}`);
  console.log(`📊 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});

module.exports = app;
