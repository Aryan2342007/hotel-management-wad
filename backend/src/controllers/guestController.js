const Guest = require('../models/Guest');
const Reservation = require('../models/Reservation');

// @desc    Get all guests with optional search and pagination
// @route   GET /api/guests
exports.getGuests = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { 'idProof.idNumber': { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Guest.countDocuments(query);
    const guests = await Guest.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      count: guests.length,
      data: guests,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single guest with booking history
// @route   GET /api/guests/:id
exports.getGuestById = async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id);
    if (!guest) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }

    // Populate guest's past reservations using ADBMS reference
    const reservations = await Reservation.find({ guest: guest._id })
      .populate('room', 'roomNumber roomType pricePerNight')
      .sort({ checkInDate: -1 });

    res.json({
      success: true,
      data: guest,
      reservations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new guest
// @route   POST /api/guests
exports.createGuest = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, address, idProof, specialRequests } = req.body;

    const existingGuest = await Guest.findOne({ email });
    if (existingGuest) {
      return res.status(400).json({ success: false, message: 'A guest with this email already exists' });
    }

    const guest = await Guest.create({
      firstName,
      lastName,
      email,
      phone,
      address,
      idProof,
      specialRequests,
    });

    res.status(201).json({ success: true, message: 'Guest registered successfully', data: guest });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update guest
// @route   PUT /api/guests/:id
exports.updateGuest = async (req, res) => {
  try {
    const guest = await Guest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!guest) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }

    res.json({ success: true, message: 'Guest updated successfully', data: guest });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete guest
// @route   DELETE /api/guests/:id
exports.deleteGuest = async (req, res) => {
  try {
    const activeBooking = await Reservation.findOne({
      guest: req.params.id,
      status: { $in: ['Confirmed', 'CheckedIn'] },
    });

    if (activeBooking) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete guest with active or upcoming reservations',
      });
    }

    const guest = await Guest.findByIdAndDelete(req.params.id);
    if (!guest) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }

    res.json({ success: true, message: 'Guest deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
