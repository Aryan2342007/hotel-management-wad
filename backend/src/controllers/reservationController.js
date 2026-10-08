const Reservation = require('../models/Reservation');
const Room = require('../models/Room');
const Guest = require('../models/Guest');

// Helper to generate unique booking number
const generateBookingNumber = () => {
  const prefix = 'RES';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${timestamp}${random}`;
};

// @desc    Get all reservations with populated refs and filters
// @route   GET /api/reservations
exports.getReservations = async (req, res) => {
  try {
    const { status, guestId, roomId, startDate, endDate, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (guestId) filter.guest = guestId;
    if (roomId) filter.room = roomId;

    if (startDate && endDate) {
      filter.checkInDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (search) {
      filter.bookingNumber = { $regex: search, $options: 'i' };
    }

    const reservations = await Reservation.find(filter)
      .populate('guest', 'firstName lastName email phone idProof')
      .populate('room', 'roomNumber roomType pricePerNight floor')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single reservation
// @route   GET /api/reservations/:id
exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('guest')
      .populate('room');

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    res.json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new reservation with collision detection
// @route   POST /api/reservations
exports.createReservation = async (req, res) => {
  try {
    const { guestId, roomId, checkInDate, checkOutDate, numberOfGuests, specialRequests } = req.body;

    const guest = await Guest.findById(guestId);
    if (!guest) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);

    if (start >= end) {
      return res.status(400).json({ success: false, message: 'Check-out date must be after check-in date' });
    }

    // ADBMS Check: Detect overlapping active reservations for this room
    const conflictingBooking = await Reservation.findOne({
      room: roomId,
      status: { $in: ['Confirmed', 'CheckedIn'] },
      $or: [
        { checkInDate: { $lt: end }, checkOutDate: { $gt: start } },
      ],
    });

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message: `Room ${room.roomNumber} is already booked for the selected date range (${conflictingBooking.bookingNumber})`,
      });
    }

    // Calculate total nights and amount
    const diffTime = Math.abs(end - start);
    const totalNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const totalAmount = totalNights * room.pricePerNight;

    const bookingNumber = generateBookingNumber();

    const reservation = await Reservation.create({
      bookingNumber,
      guest: guestId,
      room: roomId,
      checkInDate: start,
      checkOutDate: end,
      numberOfGuests: numberOfGuests || 1,
      totalNights,
      totalAmount,
      status: 'Confirmed',
      specialRequests: specialRequests || '',
    });

    const populated = await Reservation.findById(reservation._id)
      .populate('guest', 'firstName lastName email phone')
      .populate('room', 'roomNumber roomType pricePerNight');

    res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      data: populated,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Cancel reservation
// @route   PATCH /api/reservations/:id/cancel
exports.cancelReservation = async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    if (reservation.status === 'CheckedOut') {
      return res.status(400).json({ success: false, message: 'Cannot cancel an already completed stay' });
    }

    reservation.status = 'Cancelled';
    reservation.cancellationReason = cancellationReason || 'Cancelled by guest/staff';
    await reservation.save();

    // If room was Occupied by this reservation, revert it to Available
    const room = await Room.findById(reservation.room);
    if (room && room.status === 'Occupied') {
      room.status = 'Available';
      await room.save();
    }

    res.json({
      success: true,
      message: 'Reservation cancelled successfully',
      data: reservation,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update reservation details
// @route   PUT /api/reservations/:id
exports.updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('guest').populate('room');

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    res.json({ success: true, message: 'Reservation updated', data: reservation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
