const express = require('express');
const router = express.Router();
const {
  getReservations,
  getReservationById,
  createReservation,
  cancelReservation,
  updateReservation,
} = require('../controllers/reservationController');

router.route('/')
  .get(getReservations)
  .post(createReservation);

router.route('/:id')
  .get(getReservationById)
  .put(updateReservation);

router.patch('/:id/cancel', cancelReservation);

module.exports = router;
