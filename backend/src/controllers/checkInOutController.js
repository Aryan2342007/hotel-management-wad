const Reservation = require('../models/Reservation');
const Room = require('../models/Room');
const Payment = require('../models/Payment');

// Helper to generate invoice number
const generateInvoiceNumber = () => {
  const prefix = 'INV';
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${random}`;
};

// @desc    Get arrivals and departures for front desk
// @route   GET /api/checkinout/desk
exports.getDeskSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Expected arrivals: Confirmed reservations
    const arrivals = await Reservation.find({
      status: 'Confirmed',
    })
      .populate('guest', 'firstName lastName email phone idProof')
      .populate('room', 'roomNumber roomType pricePerNight floor')
      .sort({ checkInDate: 1 });

    // Active in-house guests: CheckedIn
    const inHouse = await Reservation.find({
      status: 'CheckedIn',
    })
      .populate('guest', 'firstName lastName email phone idProof')
      .populate('room', 'roomNumber roomType pricePerNight floor')
      .sort({ checkOutDate: 1 });

    // Recent check-outs: CheckedOut
    const departures = await Reservation.find({
      status: 'CheckedOut',
    })
      .populate('guest', 'firstName lastName email phone')
      .populate('room', 'roomNumber roomType pricePerNight floor')
      .sort({ actualCheckOutTime: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        arrivals,
        inHouse,
        departures,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check-in guest (Module 4)
// @route   POST /api/checkinout/check-in/:reservationId
exports.performCheckIn = async (req, res) => {
  try {
    const { reservationId } = req.params;

    const reservation = await Reservation.findById(reservationId).populate('room');
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    if (reservation.status !== 'Confirmed') {
      return res.status(400).json({
        success: false,
        message: `Cannot check in reservation with status '${reservation.status}'`,
      });
    }

    // Update reservation
    reservation.status = 'CheckedIn';
    reservation.actualCheckInTime = new Date();
    await reservation.save();

    // Update Room status to 'Occupied'
    await Room.findByIdAndUpdate(reservation.room._id, { status: 'Occupied' });

    const updated = await Reservation.findById(reservationId)
      .populate('guest')
      .populate('room');

    res.json({
      success: true,
      message: `Guest checked in successfully. Room ${reservation.room.roomNumber} is now Occupied.`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check-out guest and release room (Module 5)
// @route   POST /api/checkinout/check-out/:reservationId
exports.performCheckOut = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const {
      serviceCharges = 0,
      discountAmount = 0,
      paymentMethod = 'Credit Card',
      remarks = '',
    } = req.body;

    const reservation = await Reservation.findById(reservationId)
      .populate('guest')
      .populate('room');

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    if (reservation.status !== 'CheckedIn') {
      return res.status(400).json({
        success: false,
        message: `Cannot check out reservation with status '${reservation.status}'. Only 'CheckedIn' guests can be checked out.`,
      });
    }

    // Calculate billing
    const roomCharges = reservation.totalAmount;
    const taxRate = 0.12; // 12% GST
    const taxAmount = Math.round(roomCharges * taxRate);
    const totalAmount = Math.max(0, roomCharges + Number(serviceCharges) + taxAmount - Number(discountAmount));

    // Create payment invoice if not already paid
    let payment = await Payment.findOne({ reservation: reservation._id });
    if (!payment) {
      payment = await Payment.create({
        invoiceNumber: generateInvoiceNumber(),
        reservation: reservation._id,
        guest: reservation.guest._id,
        roomCharges,
        taxAmount,
        serviceCharges: Number(serviceCharges),
        discountAmount: Number(discountAmount),
        totalAmount,
        paymentMethod,
        paymentStatus: 'Paid',
        paidAt: new Date(),
        remarks: remarks || 'Payment settled upon check-out',
      });
    }

    // Mark reservation as CheckedOut
    reservation.status = 'CheckedOut';
    reservation.actualCheckOutTime = new Date();
    await reservation.save();

    // Release Room: Change status to 'Cleaning' so staff can sanitize it
    await Room.findByIdAndUpdate(reservation.room._id, { status: 'Cleaning' });

    res.json({
      success: true,
      message: `Guest checked out successfully! Room ${reservation.room.roomNumber} released to 'Cleaning'.`,
      data: {
        reservation,
        payment,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
