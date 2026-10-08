const Room = require('../models/Room');
const Guest = require('../models/Guest');
const Reservation = require('../models/Reservation');
const Payment = require('../models/Payment');

// @desc    Get dashboard KPIs and summary
// @route   GET /api/dashboard/stats
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Room Status Aggregation Pipeline using $facet
    const [roomStats] = await Room.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
        },
      },
    ]);

    const totalRooms = roomStats.total[0] ? roomStats.total[0].count : 0;
    const statusMap = {
      Available: 0,
      Occupied: 0,
      Cleaning: 0,
      Maintenance: 0,
    };

    roomStats.byStatus.forEach((item) => {
      if (statusMap[item._id] !== undefined) {
        statusMap[item._id] = item.count;
      }
    });

    const occupancyRate = totalRooms > 0 ? Math.round((statusMap.Occupied / totalRooms) * 100) : 0;

    // 2. Total Guests count
    const totalGuests = await Guest.countDocuments();

    // 3. Active Reservations count (Confirmed + CheckedIn)
    const activeBookings = await Reservation.countDocuments({
      status: { $in: ['Confirmed', 'CheckedIn'] },
    });

    // 4. Revenue Aggregation Pipeline
    const [revenueData] = await Payment.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalTax: { $sum: '$taxAmount' },
          transactionCount: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = revenueData ? revenueData.totalRevenue : 0;

    // 5. Today's Expected / Confirmed Arrivals and Departures
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayArrivals = await Reservation.countDocuments({
      status: 'Confirmed',
      checkInDate: { $gte: today, $lt: tomorrow },
    });

    const todayDepartures = await Reservation.countDocuments({
      status: 'CheckedIn',
      checkOutDate: { $gte: today, $lt: tomorrow },
    });

    // 6. Recent Reservations (5 latest)
    const recentReservations = await Reservation.find()
      .populate('guest', 'firstName lastName email')
      .populate('room', 'roomNumber roomType')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalRooms,
        occupancyRate,
        roomStatus: statusMap,
        totalGuests,
        activeBookings,
        totalRevenue,
        todayArrivals,
        todayDepartures,
        recentReservations,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Room Type Distribution & Revenue Aggregation
// @route   GET /api/dashboard/room-analytics
exports.getRoomAnalytics = async (req, res) => {
  try {
    // ADBMS Aggregation Pipeline: $group Rooms by type
    const roomTypeStats = await Room.aggregate([
      {
        $group: {
          _id: '$roomType',
          totalRooms: { $sum: 1 },
          avgPrice: { $avg: '$pricePerNight' },
          minPrice: { $min: '$pricePerNight' },
          maxPrice: { $max: '$pricePerNight' },
        },
      },
      {
        $project: {
          roomType: '$_id',
          totalRooms: 1,
          avgPrice: { $round: ['$avgPrice', 2] },
          minPrice: 1,
          maxPrice: 1,
          _id: 0,
        },
      },
      { $sort: { avgPrice: 1 } },
    ]);

    res.json({ success: true, data: roomTypeStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Monthly Revenue Trends via Aggregation Pipeline
// @route   GET /api/dashboard/revenue-trends
exports.getRevenueTrends = async (req, res) => {
  try {
    // ADBMS Aggregation Pipeline: $project + $dateToString + $group + $sort
    const monthlyTrends = await Payment.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      {
        $project: {
          month: { $dateToString: { format: '%Y-%m', date: '$paidAt' } },
          totalAmount: 1,
          taxAmount: 1,
          roomCharges: 1,
        },
      },
      {
        $group: {
          _id: '$month',
          revenue: { $sum: '$totalAmount' },
          roomRevenue: { $sum: '$roomCharges' },
          taxCollected: { $sum: '$taxAmount' },
          invoices: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          month: '$_id',
          revenue: 1,
          roomRevenue: 1,
          taxCollected: 1,
          invoices: 1,
          _id: 0,
        },
      },
    ]);

    res.json({ success: true, data: monthlyTrends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Run and inspect ADBMS aggregation pipelines live (for presentations & viva)
// @route   GET /api/dashboard/adbms-lab
exports.getAdbmsLabQueries = async (req, res) => {
  try {
    // Pipeline 1: Room Occupancy & Multi-faceted Analytics
    const p1Pipeline = [
      {
        $facet: {
          statusCounts: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
          typeDistribution: [{ $group: { _id: '$roomType', count: { $sum: 1 } } }],
          averagePricing: [{ $group: { _id: '$roomType', avgPrice: { $avg: '$pricePerNight' } } }],
        },
      },
    ];
    const p1Result = await Room.aggregate(p1Pipeline);

    // Pipeline 2: Top Paying Guests via $lookup, $group, $sort, $limit
    const p2Pipeline = [
      { $match: { paymentStatus: 'Paid' } },
      {
        $group: {
          _id: '$guest',
          totalSpent: { $sum: '$totalAmount' },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'guests',
          localField: '_id',
          foreignField: '_id',
          as: 'guestInfo',
        },
      },
      { $unwind: '$guestInfo' },
      {
        $project: {
          guestName: { $concat: ['$guestInfo.firstName', ' ', '$guestInfo.lastName'] },
          email: '$guestInfo.email',
          totalSpent: 1,
          transactions: 1,
        },
      },
    ];
    const p2Result = await Payment.aggregate(p2Pipeline);

    // Pipeline 3: Booking Length and Revenue Breakdown by Room Type
    const p3Pipeline = [
      {
        $lookup: {
          from: 'rooms',
          localField: 'room',
          foreignField: '_id',
          as: 'roomDetails',
        },
      },
      { $unwind: '$roomDetails' },
      {
        $group: {
          _id: '$roomDetails.roomType',
          totalBookings: { $sum: 1 },
          totalNightsBooked: { $sum: '$totalNights' },
          totalRevenueGenerated: { $sum: '$totalAmount' },
          averageStayNights: { $avg: '$totalNights' },
        },
      },
      { $sort: { totalRevenueGenerated: -1 } },
    ];
    const p3Result = await Reservation.aggregate(p3Pipeline);

    res.json({
      success: true,
      queries: [
        {
          title: 'Query 1: Multi-Facet Room Statistics ($facet, $group)',
          description: 'Demonstrates $facet to perform multiple parallel aggregations on room inventory in a single database pass.',
          pipeline: p1Pipeline,
          result: p1Result,
        },
        {
          title: 'Query 2: Top Spending Guests ($lookup, $unwind, $group, $sort, $limit)',
          description: 'Demonstrates cross-collection joining ($lookup) between Payments and Guests to identify top revenue generating clients.',
          pipeline: p2Pipeline,
          result: p2Result,
        },
        {
          title: 'Query 3: Room Type Performance Analytics ($lookup, $group, $avg)',
          description: 'Demonstrates joining Reservations with Rooms to compute total nights, bookings count, and revenue partitioned by room type.',
          pipeline: p3Pipeline,
          result: p3Result,
        },
      ],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
