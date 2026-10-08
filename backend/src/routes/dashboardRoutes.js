const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getRoomAnalytics,
  getRevenueTrends,
  getAdbmsLabQueries,
} = require('../controllers/dashboardController');

router.get('/stats', getDashboardStats);
router.get('/room-analytics', getRoomAnalytics);
router.get('/revenue-trends', getRevenueTrends);
router.get('/adbms-lab', getAdbmsLabQueries);

module.exports = router;
