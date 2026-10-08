const Room = require('../models/Room');
const Reservation = require('../models/Reservation');

// @desc    Get all rooms with filters (type, status, floor, price)
// @route   GET /api/rooms
exports.getRooms = async (req, res) => {
  try {
    const { status, roomType, floor, maxPrice, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (roomType) filter.roomType = roomType;
    if (floor) filter.floor = Number(floor);
    if (maxPrice) filter.pricePerNight = { $lte: Number(maxPrice) };
    if (search) {
      filter.roomNumber = { $regex: search, $options: 'i' };
    }

    const rooms = await Room.find(filter).sort({ roomNumber: 1 });
    res.json({ success: true, count: rooms.length, data: rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get available rooms for given date range
// @route   GET /api/rooms/available
exports.getAvailableRooms = async (req, res) => {
  try {
    const { checkInDate, checkOutDate, roomType } = req.query;

    if (!checkInDate || !checkOutDate) {
      // If dates not provided, return rooms with status 'Available'
      const filter = { status: 'Available' };
      if (roomType) filter.roomType = roomType;
      const rooms = await Room.find(filter).sort({ roomNumber: 1 });
      return res.json({ success: true, count: rooms.length, data: rooms });
    }

    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);

    // Find rooms that have overlapping active reservations
    const overlappingReservations = await Reservation.find({
      status: { $in: ['Confirmed', 'CheckedIn'] },
      $or: [
        { checkInDate: { $lt: end }, checkOutDate: { $gt: start } },
      ],
    }).select('room');

    const bookedRoomIds = overlappingReservations.map((r) => r.room);

    const query = {
      _id: { $nin: bookedRoomIds },
      status: { $in: ['Available', 'Cleaning'] }, // Cleaning rooms can also be booked in advance
    };

    if (roomType) {
      query.roomType = roomType;
    }

    const availableRooms = await Room.find(query).sort({ roomNumber: 1 });

    res.json({
      success: true,
      checkInDate: start,
      checkOutDate: end,
      count: availableRooms.length,
      data: availableRooms,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Find current active reservation if any
    const activeBooking = await Reservation.findOne({
      room: room._id,
      status: 'CheckedIn',
    }).populate('guest', 'firstName lastName email phone');

    res.json({ success: true, data: room, currentBooking: activeBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new room
// @route   POST /api/rooms
exports.createRoom = async (req, res) => {
  try {
    const { roomNumber, roomType, pricePerNight, floor, capacity, amenities, description } = req.body;

    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return res.status(400).json({ success: false, message: `Room ${roomNumber} already exists` });
    }

    const room = await Room.create({
      roomNumber,
      roomType,
      pricePerNight,
      floor,
      capacity,
      amenities,
      description,
    });

    res.status(201).json({ success: true, message: 'Room created successfully', data: room });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update room details
// @route   PUT /api/rooms/:id
exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    res.json({ success: true, message: 'Room updated successfully', data: room });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Quick update room status (Available, Occupied, Cleaning, Maintenance)
// @route   PATCH /api/rooms/:id/status
exports.updateRoomStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Available', 'Occupied', 'Cleaning', 'Maintenance'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid room status' });
    }

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    res.json({ success: true, message: `Room status changed to ${status}`, data: room });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (room.status === 'Occupied') {
      return res.status(400).json({ success: false, message: 'Cannot delete an occupied room' });
    }

    await Room.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
