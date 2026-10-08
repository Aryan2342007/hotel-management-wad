import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  FileText,
  MapPin,
  Calendar,
  Trash2,
  Edit,
  History,
  CheckCircle2,
} from 'lucide-react';
import { getGuests, getGuestById, createGuest, updateGuest, deleteGuest } from '../services/api';

const idProofTypes = ['Aadhar Card', 'Passport', 'Driving License', 'National ID', 'Other'];

export default function GuestsView() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  const [selectedGuestHistory, setSelectedGuestHistory] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: { street: '', city: '', state: '', country: 'India' },
    idProof: { type: 'Aadhar Card', idNumber: '' },
    specialRequests: '',
  });

  const fetchGuests = async () => {
    try {
      setLoading(true);
      const res = await getGuests({ search });
      setGuests(res.data.data);
    } catch (err) {
      console.error('Failed to load guests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [search]);

  const handleOpenAdd = () => {
    setEditingGuest(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: { street: '', city: '', state: '', country: 'India' },
      idProof: { type: 'Aadhar Card', idNumber: '' },
      specialRequests: '',
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (guest) => {
    setEditingGuest(guest);
    setFormData({
      firstName: guest.firstName,
      lastName: guest.lastName,
      email: guest.email,
      phone: guest.phone,
      address: guest.address || { street: '', city: '', state: '', country: 'India' },
      idProof: guest.idProof || { type: 'Aadhar Card', idNumber: '' },
      specialRequests: guest.specialRequests || '',
    });
    setShowAddModal(true);
  };

  const handleViewHistory = async (guestId) => {
    try {
      const res = await getGuestById(guestId);
      setSelectedGuestHistory(res.data);
    } catch (err) {
      alert('Failed to load guest history');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGuest) {
        await updateGuest(editingGuest._id, formData);
        setActionMessage('Guest profile updated successfully');
      } else {
        await createGuest(formData);
        setActionMessage('New guest registered successfully');
      }
      setTimeout(() => setActionMessage(null), 3000);
      setShowAddModal(false);
      fetchGuests();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (guestId, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await deleteGuest(guestId);
      setActionMessage(`Guest ${name} removed`);
      setTimeout(() => setActionMessage(null), 3000);
      fetchGuests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete guest');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900">Guest Management</h2>
            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-mono">
              Module 1
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Register guests, manage identity proofs, search records, and view booking history.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Register Guest</span>
        </button>
      </div>

      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, email, phone, ID number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Guests Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="text-center py-16 text-slate-500">Loading guests...</div>
        ) : guests.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500">No guests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Guest</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">ID Proof</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Special Requests</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {guests.map((g) => (
                  <tr key={g._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {g.firstName} {g.lastName}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ID: {g._id.slice(-6)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5 text-xs text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{g.email}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{g.phone}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {g.idProof?.type}
                      </span>
                      <span className="text-xs text-slate-500 block font-mono mt-1">
                        {g.idProof?.idNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {g.address?.city ? `${g.address.city}, ${g.address.state || g.address.country}` : 'Not provided'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate">
                      {g.specialRequests || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleViewHistory(g._id)}
                        title="View Booking History"
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                      >
                        <History className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(g)}
                        title="Edit Guest"
                        className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(g._id, `${g.firstName} ${g.lastName}`)}
                        title="Delete Guest"
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Guest Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingGuest ? 'Edit Guest Profile' : 'Register New Guest'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter identification details and contact info for the guest
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">Phone *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">ID Proof Type *</label>
                  <select
                    value={formData.idProof.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        idProof: { ...formData.idProof, type: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                  >
                    {idProofTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">ID Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1234-5678-9012"
                    value={formData.idProof.idNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        idProof: { ...formData.idProof, idNumber: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">City</label>
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, city: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">State / Country</label>
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, state: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 font-medium block mb-1">Special Preferences / Requests</label>
                <input
                  type="text"
                  placeholder="e.g. Non-smoking room, extra towels"
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
                  {editingGuest ? 'Update Guest' : 'Save Guest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Guest History Modal */}
      {selectedGuestHistory && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto text-slate-800">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedGuestHistory.data.firstName} {selectedGuestHistory.data.lastName}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedGuestHistory.data.email} • {selectedGuestHistory.data.phone}
                </p>
              </div>
              <button
                onClick={() => setSelectedGuestHistory(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold"
              >
                ✕ Close
              </button>
            </div>

            <h4 className="text-xs font-semibold uppercase text-amber-700 tracking-wider mb-3">
              Booking History ({selectedGuestHistory.reservations?.length || 0})
            </h4>

            {selectedGuestHistory.reservations?.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No reservations found for this guest.</p>
            ) : (
              <div className="space-y-3">
                {selectedGuestHistory.reservations?.map((res) => (
                  <div
                    key={res._id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono text-xs font-bold text-amber-600">{res.bookingNumber}</span>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">
                        Room {res.room?.roomNumber} ({res.room?.roomType})
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(res.checkInDate).toLocaleDateString()} &rarr;{' '}
                        {new Date(res.checkOutDate).toLocaleDateString()} ({res.totalNights} nights)
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-emerald-600 block">
                        ₹{res.totalAmount?.toLocaleString('en-IN')}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-1 ${
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
