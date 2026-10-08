import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import {
  getReservations,
  createReservation,
  cancelReservation,
  getRooms,
  getGuests,
  performCheckIn,
} from '../services/api';

const reservationStatuses = ['Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled'];

export default function ReservationsView({ onNavigateToDesk }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [cancelModalRes, setCancelModalRes] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [actionMessage, setActionMessage] = useState(null);

  // Aux state for form
  const [allRooms, setAllRooms] = useState([]);
  const [allGuests, setAllGuests] = useState([]);

  // Form state
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 2);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    guestId: '',
    roomId: '',
    checkInDate: todayStr,
    checkOutDate: tomorrowStr,
    numberOfGuests: 1,
    specialRequests: '',
  });

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      const res = await getReservations(params);
      setReservations(res.data.data);
    } catch (err) {
      console.error('Failed to load reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [statusFilter, search]);

  const loadAuxData = async () => {
    try {
      const [roomsRes, guestsRes] = await Promise.all([getRooms(), getGuests()]);
      setAllRooms(roomsRes.data.data);
      setAllGuests(guestsRes.data.data);
      if (guestsRes.data.data.length > 0 && !formData.guestId) {
        setFormData((prev) => ({ ...prev, guestId: guestsRes.data.data[0]._id }));
      }
      if (roomsRes.data.data.length > 0 && !formData.roomId) {
        setFormData((prev) => ({ ...prev, roomId: roomsRes.data.data[0]._id }));
      }
    } catch (err) {
      console.error('Failed to load aux data:', err);
    }
  };

  const handleOpenAddModal = () => {
    loadAuxData();
    setShowAddModal(true);
  };

  // Calculate nights and estimated total
  const selectedRoomObj = allRooms.find((r) => r._id === formData.roomId);
  const checkInDateObj = new Date(formData.checkInDate);
  const checkOutDateObj = new Date(formData.checkOutDate);
  const diffTime = checkOutDateObj - checkInDateObj;
  const calculatedNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1);
  const calculatedTotal = (selectedRoomObj?.pricePerNight || 0) * calculatedNights;

  const handleCreateReservation = async (e) => {
    e.preventDefault();
    try {
      await createReservation({
        ...formData,
        numberOfGuests: Number(formData.numberOfGuests),
      });

      setShowAddModal(false);
      setActionMessage('Reservation created successfully!');
      setTimeout(() => setActionMessage(null), 3000);
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create reservation');
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelModalRes) return;
    try {
      await cancelReservation(cancelModalRes._id, cancellationReason);
      setCancelModalRes(null);
      setCancellationReason('');
      setActionMessage('Reservation cancelled');
      setTimeout(() => setActionMessage(null), 3000);
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel reservation');
    }
  };

  const handleQuickCheckIn = async (resId) => {
    try {
      await performCheckIn(resId);
      setActionMessage('Guest checked in successfully! Room status marked as Occupied.');
      setTimeout(() => setActionMessage(null), 3000);
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CheckedIn':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'CheckedOut':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900">Reservation Management</h2>
            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-mono">
              Module 3
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Book rooms, prevent collision overlaps, manage active dates, and handle cancellations.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Reservation</span>
        </button>
      </div>

      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search booking number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Reservation Statuses</option>
            {reservationStatuses.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          {(statusFilter || search) && (
            <button
              onClick={() => {
                setStatusFilter('');
                setSearch('');
              }}
              className="text-xs text-amber-600 hover:text-amber-700 px-2 py-1 font-medium"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="text-center py-16 text-slate-500">Loading reservations...</div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-16">
            <CalendarCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500">No reservations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Booking #</th>
                  <th className="py-3.5 px-4">Guest Name</th>
                  <th className="py-3.5 px-4">Room Reserved</th>
                  <th className="py-3.5 px-4">Dates & Duration</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reservations.map((res) => (
                  <tr key={res._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-semibold text-amber-600">
                      {res.bookingNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {res.guest?.firstName} {res.guest?.lastName}
                      </div>
                      <span className="text-xs text-slate-500">{res.guest?.phone}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">Room {res.room?.roomNumber}</span>
                      <span className="text-xs text-slate-500 block">{res.room?.roomType}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs text-slate-600">
                        {new Date(res.checkInDate).toLocaleDateString()} &rarr; {new Date(res.checkOutDate).toLocaleDateString()}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                        {res.totalNights} Night{res.totalNights > 1 ? 's' : ''} ({res.numberOfGuests} guests)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">
                      ₹{res.totalAmount?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBadge(
                          res.status
                        )}`}
                      >
                        {res.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {res.status === 'Confirmed' && (
                        <>
                          <button
                            onClick={() => handleQuickCheckIn(res._id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold border border-emerald-200 transition"
                          >
                            Check In
                          </button>
                          <button
                            onClick={() => {
                              setCancelModalRes(res);
                              setCancellationReason('');
                            }}
                            className="p-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                            title="Cancel Booking"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Reservation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Create New Reservation</h3>
            <p className="text-xs text-slate-500 mb-4">
              Select guest, choose room, and set dates. Overlap collision will be checked automatically.
            </p>

            <form onSubmit={handleCreateReservation} className="space-y-4">
              <div>
                <label className="text-xs text-slate-600 font-medium block mb-1">Select Guest *</label>
                <select
                  required
                  value={formData.guestId}
                  onChange={(e) => setFormData({ ...formData, guestId: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                >
                  {allGuests.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.firstName} {g.lastName} ({g.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-600 font-medium block mb-1">Select Room *</label>
                <select
                  required
                  value={formData.roomId}
                  onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                >
                  {allRooms.map((r) => (
                    <option key={r._id} value={r._id}>
                      Room {r.roomNumber} - {r.roomType} (₹{r.pricePerNight}/night) [{r.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">Check-In Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.checkInDate}
                    onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">Check-Out Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.checkOutDate}
                    onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">Number of Guests</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={formData.numberOfGuests}
                    onChange={(e) => setFormData({ ...formData, numberOfGuests: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">Estimated Stay</label>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-sm text-amber-800 font-semibold">
                    {calculatedNights} Night{calculatedNights > 1 ? 's' : ''} &bull; ₹{calculatedTotal.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 font-medium block mb-1">Special Notes / Requests</label>
                <input
                  type="text"
                  placeholder="e.g. Late arrival, airport taxi required"
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition shadow-xs"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Reservation Modal */}
      {cancelModalRes && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center space-x-2 text-rose-600 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">Cancel Reservation</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Are you sure you want to cancel booking <strong className="text-slate-900">{cancelModalRes.bookingNumber}</strong> for{' '}
              {cancelModalRes.guest?.firstName} {cancelModalRes.guest?.lastName}?
            </p>

            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-600 font-medium block mb-1">Reason for Cancellation</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Guest travel plan changed"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalRes(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-sm transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition shadow-xs"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
