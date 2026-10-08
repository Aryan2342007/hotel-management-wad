const express = require('express');
const router = express.Router();
const {
  getDeskSummary,
  performCheckIn,
  performCheckOut,
} = require('../controllers/checkInOutController');

router.get('/desk', getDeskSummary);
router.post('/check-in/:reservationId', performCheckIn);
router.post('/check-out/:reservationId', performCheckOut);

module.exports = router;
