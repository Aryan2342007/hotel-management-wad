import React, { useState, useEffect } from 'react';
import {
  BedDouble,
  Users,
  CalendarCheck,
  IndianRupee,
  LogIn,
  LogOut,
  RefreshCw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { getDashboardStats, getRoomAnalytics } from '../services/api';

export default function DashboardView({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [roomAnalytics, setRoomAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, analyticsRes] = await Promise.all([
        getDashboardStats(),
        getRoomAnalytics(),
      ]);
      setStats(statsRes.data.data);
      setRoomAnalytics(analyticsRes.data.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Failed to connect to backend server or database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-slate-500 text-sm">Loading hotel real-time metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-2xl text-center space-y-3 max-w-lg mx-auto my-12">
        <p className="text-red-700 font-semibold">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl text-sm font-medium transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const roomStatus = stats?.roomStatus || {
    Available: 0,
    Occupied: 0,
    Cleaning: 0,
    Maintenance: 0,
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Hotel Operations Overview</h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time status calculated via MongoDB Aggregation Pipelines
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDashboardData}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium border border-slate-200 transition"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            <span>Refresh Stats</span>
          </button>
          <button
            onClick={() => onNavigate('reservations')}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition shadow-xs"
          >
            <span>+ New Booking</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Rooms & Occupancy */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-slate-300 hover:shadow-xs transition shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Occupancy Rate</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-slate-900">{stats?.occupancyRate}%</div>
            <span className="text-xs text-slate-500">{roomStatus.Occupied} of {stats?.totalRooms} Rooms Occupied</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats?.occupancyRate || 0}%` }}
            ></div>
          </div>
        </div>

        {/* Card 2: Total Revenue */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-slate-300 hover:shadow-xs transition shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-emerald-600">
              ₹{stats?.totalRevenue?.toLocaleString('en-IN') || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Settled Invoices via Mongoose Aggregation</span>
            </p>
          </div>
        </div>

        {/* Card 3: Active Bookings */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-slate-300 hover:shadow-xs transition shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Bookings</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900">{stats?.activeBookings || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Confirmed & Checked-In stays</p>
          </div>
        </div>

        {/* Card 4: Total Guests */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-slate-300 hover:shadow-xs transition shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Guests</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900">{stats?.totalGuests || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Guest Profiles in Database</p>
          </div>
        </div>
      </div>

      {/* Room Status Breakdown Bar */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <BedDouble className="w-4 h-4 text-amber-600" />
          <span>Room Inventory Status Breakdown</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
            <span className="text-xs text-emerald-700 font-semibold uppercase">Available</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{roomStatus.Available}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Ready for check-in</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
            <span className="text-xs text-amber-800 font-semibold uppercase">Occupied</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{roomStatus.Occupied}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Guests currently staying</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
            <span className="text-xs text-blue-700 font-semibold uppercase">Cleaning</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{roomStatus.Cleaning}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Housekeeping in progress</p>
          </div>
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl">
            <span className="text-xs text-rose-700 font-semibold uppercase">Maintenance</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{roomStatus.Maintenance}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Under repair/inspection</p>
          </div>
        </div>
      </div>

      {/* Room Type Analytics & Front Desk Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Types Aggregated */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Room Categories & Pricing</h3>
            <span className="text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono">
              $group by roomType
            </span>
          </div>
          <div className="space-y-3">
            {roomAnalytics.map((type) => (
              <div
                key={type.roomType}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
              >
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">{type.roomType} Room</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {type.totalRooms} rooms configured
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-amber-600">
                    ₹{type.avgPrice?.toLocaleString('en-IN')}{' '}
                    <span className="text-[10px] text-slate-400 font-normal">/ night</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Front Desk Snapshot */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Front Desk Daily Activity</h3>
              <button
                onClick={() => onNavigate('checkinout')}
                className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center space-x-1"
              >
                <span>Open Front Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
                  <LogIn className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500">Today's Arrivals</span>
                  <div className="text-xl font-bold text-slate-900">{stats?.todayArrivals || 0}</div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-rose-50 text-rose-600">
                  <LogOut className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500">Today's Departures</span>
                  <div className="text-xl font-bold text-slate-900">{stats?.todayDepartures || 0}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-amber-50/70 p-4 rounded-xl border border-amber-200">
            <div className="flex items-center space-x-2 text-amber-800 font-semibold text-xs mb-1">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>ADBMS Demonstration Ready</span>
            </div>
            <p className="text-xs text-slate-600">
              All metrics update dynamically via MongoDB live aggregations (`$group`, `$facet`, `$lookup`).
            </p>
          </div>
        </div>
      </div>

      {/* Recent Reservations Table */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">Recent Reservations</h3>
          <button
            onClick={() => onNavigate('reservations')}
            className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Booking #</th>
                <th className="py-3 px-4">Guest</th>
                <th className="py-3 px-4">Room</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recentReservations?.map((res) => (
                <tr key={res._id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-mono font-medium text-amber-600">{res.bookingNumber}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {res.guest?.firstName} {res.guest?.lastName}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800">Room {res.room?.roomNumber}</span>
                    <span className="text-xs text-slate-500 block">{res.room?.roomType}</span>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500">
                    {new Date(res.checkInDate).toLocaleDateString()} &rarr; {new Date(res.checkOutDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 font-semibold text-emerald-600">
                    ₹{res.totalAmount?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                        res.status === 'CheckedIn'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : res.status === 'Confirmed'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : res.status === 'CheckedOut'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {res.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
