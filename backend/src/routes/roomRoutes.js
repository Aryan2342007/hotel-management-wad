const express = require('express');
const router = express.Router();
const {
  getRooms,
  getAvailableRooms,
  getRoomById,
  createRoom,
  updateRoom,
  updateRoomStatus,
  deleteRoom,
} = require('../controllers/roomController');

router.get('/available', getAvailableRooms);

router.route('/')
  .get(getRooms)
  .post(createRoom);

router.route('/:id')
  .get(getRoomById)
  .put(updateRoom)
  .delete(deleteRoom);

router.patch('/:id/status', updateRoomStatus);

module.exports = router;
