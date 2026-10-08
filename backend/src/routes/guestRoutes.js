const express = require('express');
const router = express.Router();
const {
  getGuests,
  getGuestById,
  createGuest,
  updateGuest,
  deleteGuest,
} = require('../controllers/guestController');

router.route('/')
  .get(getGuests)
  .post(createGuest);

router.route('/:id')
  .get(getGuestById)
  .put(updateGuest)
  .delete(deleteGuest);

module.exports = router;
