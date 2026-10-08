import React, { useState, useEffect } from 'react';
import {
  BedDouble,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Sparkles,
  Wifi,
  Tv,
  Wind,
  Layers,
  Users,
} from 'lucide-react';
import { getRooms, createRoom, updateRoomStatus, deleteRoom } from '../services/api';

const roomTypes = ['Single', 'Double', 'Deluxe', 'Suite', 'Penthouse'];
const statusList = ['Available', 'Occupied', 'Cleaning', 'Maintenance'];

export default function RoomsView() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    roomNumber: '',
    roomType: 'Deluxe',
    pricePerNight: '',
    floor: '1',
    capacity: '2',
    amenities: 'Wi-Fi, AC, Smart TV',
    description: '',
  });

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.roomType = typeFilter;
      if (search) params.search = search;

      const res = await getRooms(params);
      setRooms(res.data.data);
    } catch (err) {
      console.error('Failed to load rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [statusFilter, typeFilter, search]);

  const handleStatusChange = async (roomId, newStatus) => {
    try {
      await updateRoomStatus(roomId, newStatus);
      setActionMessage(`Room status updated to ${newStatus}`);
      setTimeout(() => setActionMessage(null), 3000);
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (roomId, roomNumber) => {
    if (!window.confirm(`Are you sure you want to delete Room ${roomNumber}?`)) return;
    try {
      await deleteRoom(roomId);
      setActionMessage(`Room ${roomNumber} deleted successfully`);
      setTimeout(() => setActionMessage(null), 3000);
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete room');
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const amenitiesArr = formData.amenities
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);

      await createRoom({
        ...formData,
        pricePerNight: Number(formData.pricePerNight),
        floor: Number(formData.floor),
        capacity: Number(formData.capacity),
        amenities: amenitiesArr,
      });

      setShowAddModal(false);
      setFormData({
        roomNumber: '',
        roomType: 'Deluxe',
        pricePerNight: '',
        floor: '1',
        capacity: '2',
        amenities: 'Wi-Fi, AC, Smart TV',
        description: '',
      });
      setActionMessage('New room added successfully');
      setTimeout(() => setActionMessage(null), 3000);
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create room');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Occupied':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Cleaning':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Maintenance':
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
            <h2 className="text-xl font-bold text-slate-900">Room Management</h2>
            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-mono">
              Module 2
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage rooms, track live occupancy, change room status, and view amenities.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Room</span>
        </button>
      </div>

      {/* Success Notification */}
      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search room number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Statuses</option>
            {statusList.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Room Types</option>
            {roomTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {(statusFilter || typeFilter || search) && (
            <button
              onClick={() => {
                setStatusFilter('');
                setTypeFilter('');
                setSearch('');
              }}
              className="text-xs text-amber-600 hover:text-amber-700 px-2 py-1 font-medium"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Rooms Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-500">Loading rooms...</div>
      ) : rooms.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 text-center rounded-2xl shadow-xs">
          <BedDouble className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-slate-800 font-semibold text-lg">No rooms found</h3>
          <p className="text-slate-500 text-sm mt-1">Try adjusting your search or filter options.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {rooms.map((room) => (
            <div
              key={room._id}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 hover:shadow-xs transition flex flex-col justify-between shadow-xs relative group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-amber-600 tracking-wider">FLOOR {room.floor}</span>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Room {room.roomNumber}</h3>
                    <p className="text-xs text-slate-500">{room.roomType} Room</p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBadge(
                      room.status
                    )}`}
                  >
                    {room.status}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Max {room.capacity} Guests</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-slate-900">₹{room.pricePerNight?.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-slate-400"> / night</span>
                  </div>
                </div>

                {/* Amenities Tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {room.amenities?.map((amenity, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Status Change Selector & Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                    Quick Status
                  </label>
                  <select
                    value={room.status}
                    onChange={(e) => handleStatusChange(room._id, e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 focus:outline-none focus:border-amber-500"
                  >
                    {statusList.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => handleDelete(room._id, room.roomNumber)}
                  disabled={room.status === 'Occupied'}
                  title={room.status === 'Occupied' ? 'Occupied rooms cannot be deleted' : 'Delete Room'}
                  className="mt-4 p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Add New Room</h3>
            <p className="text-xs text-slate-500 mb-4">Add a new room to hotel inventory</p>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">Room Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 501"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">Room Type *</label>
                  <select
                    value={formData.roomType}
                    onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                  >
                    {roomTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">Price/Night (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="3500"
                    value={formData.pricePerNight}
                    onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">Floor *</label>
                  <input
                    type="number"
                    required
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">Capacity *</label>
                  <input
                    type="number"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 font-medium block mb-1">Amenities (comma-separated)</label>
                <input
                  type="text"
                  placeholder="Wi-Fi, AC, Smart TV, Jacuzzi"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 font-medium block mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Brief room description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
