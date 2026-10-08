const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      required: [true, 'Booking number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guest',
      required: [true, 'Guest reference is required'],
      index: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room reference is required'],
      index: true,
    },
    checkInDate: {
      type: Date,
      required: [true, 'Check-in date is required'],
      index: true,
    },
    checkOutDate: {
      type: Date,
      required: [true, 'Check-out date is required'],
      index: true,
    },
    numberOfGuests: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    totalNights: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled'],
      default: 'Confirmed',
      index: true,
    },
    actualCheckInTime: {
      type: Date,
    },
    actualCheckOutTime: {
      type: Date,
    },
    specialRequests: {
      type: String,
      default: '',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for ADBMS query optimization:
// 1. Efficient collision detection and date-range searching
reservationSchema.index({ room: 1, checkInDate: 1, checkOutDate: 1 });
// 2. Efficient query by guest and status
reservationSchema.index({ guest: 1, status: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
