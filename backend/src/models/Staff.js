const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema(
  {
    staffCode: {
      type: String,
      required: [true, 'Staff code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Staff name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Staff email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: ['Manager', 'Receptionist', 'Housekeeping', 'Chef', 'Security', 'Maintenance'],
      default: 'Receptionist',
      index: true,
    },
    shift: {
      type: String,
      enum: ['Morning (6 AM - 2 PM)', 'Evening (2 PM - 10 PM)', 'Night (10 PM - 6 AM)', 'General (9 AM - 6 PM)'],
      default: 'Morning (6 AM - 2 PM)',
    },
    salary: {
      type: Number,
      required: true,
      min: [0, 'Salary must be positive'],
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Inactive'],
      default: 'Active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Staff', staffSchema);
