const Payment = require('../models/Payment');
const Reservation = require('../models/Reservation');

const generateInvoiceNumber = () => {
  const prefix = 'INV';
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${random}`;
};

// @desc    Get all payments / invoices
// @route   GET /api/payments
exports.getPayments = async (req, res) => {
  try {
    const { status, method, search } = req.query;
    const filter = {};

    if (status) filter.paymentStatus = status;
    if (method) filter.paymentMethod = method;
    if (search) {
      filter.invoiceNumber = { $regex: search, $options: 'i' };
    }

    const payments = await Payment.find(filter)
      .populate('guest', 'firstName lastName email phone')
      .populate({
        path: 'reservation',
        populate: { path: 'room', select: 'roomNumber roomType' },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payment by ID
// @route   GET /api/payments/:id
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('guest')
      .populate({
        path: 'reservation',
        populate: { path: 'room' },
      });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create manual payment / invoice
// @route   POST /api/payments
exports.createPayment = async (req, res) => {
  try {
    const {
      reservationId,
      roomCharges,
      serviceCharges = 0,
      taxAmount = 0,
      discountAmount = 0,
      paymentMethod = 'Cash',
      paymentStatus = 'Paid',
      remarks,
    } = req.body;

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    const totalAmount = Math.max(
      0,
      Number(roomCharges) + Number(serviceCharges) + Number(taxAmount) - Number(discountAmount)
    );

    const invoiceNumber = generateInvoiceNumber();

    const payment = await Payment.create({
      invoiceNumber,
      reservation: reservationId,
      guest: reservation.guest,
      roomCharges: Number(roomCharges),
      serviceCharges: Number(serviceCharges),
      taxAmount: Number(taxAmount),
      discountAmount: Number(discountAmount),
      totalAmount,
      paymentMethod,
      paymentStatus,
      remarks,
    });

    const populated = await Payment.findById(payment._id)
      .populate('guest')
      .populate({
        path: 'reservation',
        populate: { path: 'room' },
      });

    res.status(201).json({
      success: true,
      message: 'Payment invoice created successfully',
      data: populated,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update payment status
// @route   PATCH /api/payments/:id/status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: status },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.json({ success: true, message: 'Payment status updated', data: payment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
