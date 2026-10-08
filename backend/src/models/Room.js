const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    roomType: {
      type: String,
      required: [true, 'Room type is required'],
      enum: ['Single', 'Double', 'Deluxe', 'Suite', 'Penthouse'],
      default: 'Deluxe',
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Price per night is required'],
      min: [0, 'Price cannot be negative'],
    },
    floor: {
      type: Number,
      required: [true, 'Floor number is required'],
      min: 1,
    },
    capacity: {
      type: Number,
      required: [true, 'Room capacity is required'],
      min: 1,
      default: 2,
    },
    amenities: {
      type: [String],
      default: ['Wi-Fi', 'Air Conditioning', 'TV'],
    },
    status: {
      type: String,
      enum: ['Available', 'Occupied', 'Cleaning', 'Maintenance'],
      default: 'Available',
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for filtering rooms by status and room type
roomSchema.index({ status: 1, roomType: 1 });

module.exports = mongoose.model('Room', roomSchema);
