import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  LogIn,
  LogOut,
  Calendar,
  CreditCard,
  CheckCircle2,
  Receipt,
  BedDouble,
  Clock,
  Sparkles,
} from 'lucide-react';
import { getDeskSummary, performCheckIn, performCheckOut } from '../services/api';

export default function CheckInOutView({ onNavigateToPayments }) {
  const [deskData, setDeskData] = useState({ arrivals: [], inHouse: [], departures: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inhouse'); // 'arrivals' | 'inhouse' | 'departures'
  const [checkoutModalRes, setCheckoutModalRes] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  // Billing form state for checkout
  const [billingForm, setBillingForm] = useState({
    serviceCharges: 0,
    discountAmount: 0,
    paymentMethod: 'Credit Card',
    remarks: 'Settled upon check-out',
  });

  const fetchDeskData = async () => {
    try {
      setLoading(true);
      const res = await getDeskSummary();
      setDeskData(res.data.data);
    } catch (err) {
      console.error('Failed to load desk data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeskData();
  }, []);

  const handleCheckIn = async (reservationId, guestName, roomNumber) => {
    try {
      await performCheckIn(reservationId);
      setActionMessage(`Guest ${guestName} checked in to Room ${roomNumber}! Room is now Occupied.`);
      setTimeout(() => setActionMessage(null), 4000);
      fetchDeskData();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed');
    }
  };

  const handleOpenCheckOutModal = (reservation) => {
    setCheckoutModalRes(reservation);
    setBillingForm({
      serviceCharges: 0,
      discountAmount: 0,
      paymentMethod: 'Credit Card',
      remarks: 'Settled upon check-out',
    });
  };

  // Billing calculations
  const baseCharges = checkoutModalRes?.totalAmount || 0;
  const taxAmount = Math.round(baseCharges * 0.12);
  const finalTotal = Math.max(
    0,
    baseCharges + taxAmount + Number(billingForm.serviceCharges) - Number(billingForm.discountAmount)
  );

  const handleCheckOutSubmit = async (e) => {
    e.preventDefault();
    if (!checkoutModalRes) return;

    try {
      const res = await performCheckOut(checkoutModalRes._id, billingForm);
      setCheckoutModalRes(null);
      setActionMessage(
        `Check-out complete! Room ${res.data.data.reservation.room?.roomNumber || ''} released to Cleaning. Invoice generated.`
      );
      setTimeout(() => setActionMessage(null), 4000);
      fetchDeskData();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-out failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white">Front Desk: Check-In & Check-Out</h2>
            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono">
              Modules 4 & 5
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Manage guest arrivals, track in-house occupancy, and execute automated check-out billing & room release.
          </p>
        </div>
      </div>

      {actionMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Desk Tabs */}
      <div className="flex border-b border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab('inhouse')}
          className={`flex items-center space-x-2 pb-3 px-2 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'inhouse'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BedDouble className="w-4 h-4" />
          <span>Currently In-House ({deskData.inHouse.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('arrivals')}
          className={`flex items-center space-x-2 pb-3 px-2 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'arrivals'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>Expected Arrivals ({deskData.arrivals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('departures')}
          className={`flex items-center space-x-2 pb-3 px-2 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'departures'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <LogOut className="w-4 h-4" />
          <span>Recent Check-Outs ({deskData.departures.length})</span>
        </button>
      </div>

      {/* Tab 1: In-House Guests (Module 5 target) */}
      {activeTab === 'inhouse' && (
        <div className="space-y-4">
          {deskData.inHouse.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 p-12 text-center rounded-2xl">
              <BedDouble className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No guests currently staying in hotel.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deskData.inHouse.map((res) => (
                <div
                  key={res._id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-mono font-semibold text-amber-400">
                          {res.bookingNumber}
                        </span>
                        <h3 className="text-lg font-bold text-white mt-1">
                          {res.guest?.firstName} {res.guest?.lastName}
                        </h3>
                        <p className="text-xs text-slate-400">{res.guest?.phone}</p>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        In-House
                      </span>
                    </div>

                    <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Room Allocated:</span>
                        <span className="font-bold text-white">
                          Room {res.room?.roomNumber} ({res.room?.roomType})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Expected Check-Out:</span>
                        <span className="text-slate-300">
                          {new Date(res.checkOutDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Base Room Rent:</span>
                        <span className="font-semibold text-emerald-400">
                          ₹{res.totalAmount?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-end">
                    <button
                      onClick={() => handleOpenCheckOutModal(res)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm transition shadow-md shadow-rose-500/10"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Check-Out & Settle Bill</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Arrivals (Module 4 target) */}
      {activeTab === 'arrivals' && (
        <div className="space-y-4">
          {deskData.arrivals.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 p-12 text-center rounded-2xl">
              <LogIn className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No pending arrivals today.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deskData.arrivals.map((res) => (
                <div
                  key={res._id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-mono font-semibold text-blue-400">
                          {res.bookingNumber}
                        </span>
                        <h3 className="text-lg font-bold text-white mt-1">
                          {res.guest?.firstName} {res.guest?.lastName}
                        </h3>
                        <p className="text-xs text-slate-400">{res.guest?.phone}</p>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Confirmed
                      </span>
                    </div>

                    <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Assigned Room:</span>
                        <span className="font-bold text-white">
                          Room {res.room?.roomNumber} ({res.room?.roomType})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Stay Duration:</span>
                        <span className="text-slate-300">
                          {res.totalNights} Night{res.totalNights > 1 ? 's' : ''} ({res.numberOfGuests} guests)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">ID Verification:</span>
                        <span className="text-amber-400 font-mono">
                          {res.guest?.idProof?.type} ({res.guest?.idProof?.idNumber})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800">
                    <button
                      onClick={() =>
                        handleCheckIn(res._id, `${res.guest?.firstName} ${res.guest?.lastName}`, res.room?.roomNumber)
                      }
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-sm transition shadow-md shadow-emerald-500/10"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Check-In Guest Now</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Departures */}
      {activeTab === 'departures' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Booking #</th>
                  <th className="py-3.5 px-4">Guest</th>
                  <th className="py-3.5 px-4">Room Released</th>
                  <th className="py-3.5 px-4">Check-Out Date</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {deskData.departures.map((res) => (
                  <tr key={res._id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3.5 px-4 font-mono font-medium text-amber-400">
                      {res.bookingNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {res.guest?.firstName} {res.guest?.lastName}
                    </td>
                    <td className="py-3.5 px-4">
                      Room {res.room?.roomNumber} ({res.room?.roomType})
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {res.actualCheckOutTime ? new Date(res.actualCheckOutTime).toLocaleString() : 'Recent'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-400">
                      ₹{res.totalAmount?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Checked Out
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Check-Out Billing Modal */}
      {checkoutModalRes && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center space-x-2 text-rose-400 mb-2">
              <Receipt className="w-5 h-5" />
              <h3 className="text-lg font-bold text-white">Guest Check-Out & Final Bill</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Settle account for{' '}
              <strong className="text-white">
                {checkoutModalRes.guest?.firstName} {checkoutModalRes.guest?.lastName}
              </strong>{' '}
              in Room <strong className="text-white">{checkoutModalRes.room?.roomNumber}</strong>.
            </p>

            <form onSubmit={handleCheckOutSubmit} className="space-y-4">
              {/* Itemized Calculation Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Room Stay Charges ({checkoutModalRes.totalNights} nights):</span>
                  <span>₹{baseCharges.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-xs">
                  <span>GST (12%):</span>
                  <span>+ ₹{taxAmount.toLocaleString('en-IN')}</span>
                </div>
                {Number(billingForm.serviceCharges) > 0 && (
                  <div className="flex justify-between text-slate-400 text-xs">
                    <span>Extra Service Charges:</span>
                    <span>+ ₹{Number(billingForm.serviceCharges).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {Number(billingForm.discountAmount) > 0 && (
                  <div className="flex justify-between text-emerald-400 text-xs">
                    <span>Discount Applied:</span>
                    <span>- ₹{Number(billingForm.discountAmount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-base text-emerald-400">
                  <span>Total Amount Due:</span>
                  <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Extra Charges (Food/Laundry) ₹
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={billingForm.serviceCharges}
                    onChange={(e) =>
                      setBillingForm({ ...billingForm, serviceCharges: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Discount Amount ₹
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={billingForm.discountAmount}
                    onChange={(e) =>
                      setBillingForm({ ...billingForm, discountAmount: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Payment Method *</label>
                <select
                  value={billingForm.paymentMethod}
                  onChange={(e) =>
                    setBillingForm({ ...billingForm, paymentMethod: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="NetBanking">NetBanking</option>
                  <option value="Cash">Cash at Counter</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Billing Notes</label>
                <input
                  type="text"
                  value={billingForm.remarks}
                  onChange={(e) => setBillingForm({ ...billingForm, remarks: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCheckoutModalRes(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm transition"
                >
                  Confirm Payment & Release Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
