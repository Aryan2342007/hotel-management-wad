const express = require('express');
const router = express.Router();
const {
  getPayments,
  getPaymentById,
  createPayment,
  updatePaymentStatus,
} = require('../controllers/paymentController');

router.route('/')
  .get(getPayments)
  .post(createPayment);

router.route('/:id')
  .get(getPaymentById);

router.patch('/:id/status', updatePaymentStatus);

module.exports = router;
