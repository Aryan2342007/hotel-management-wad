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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900">Front Desk: Check-In & Check-Out</h2>
            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-mono">
              Modules 4 & 5
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage guest arrivals, track in-house occupancy, and execute automated check-out billing & room release.
          </p>
        </div>
      </div>

      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Desk Tabs */}
      <div className="flex border-b border-slate-200 space-x-4">
        <button
          onClick={() => setActiveTab('inhouse')}
          className={`flex items-center space-x-2 pb-3 px-2 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'inhouse'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BedDouble className="w-4 h-4" />
          <span>Currently In-House ({deskData.inHouse.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('arrivals')}
          className={`flex items-center space-x-2 pb-3 px-2 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'arrivals'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>Expected Arrivals ({deskData.arrivals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('departures')}
          className={`flex items-center space-x-2 pb-3 px-2 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'departures'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
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
            <div className="bg-white border border-slate-200 p-12 text-center rounded-2xl shadow-xs">
              <BedDouble className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-500">No guests currently staying in hotel.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deskData.inHouse.map((res) => (
                <div
                  key={res._id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 hover:shadow-xs transition flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-mono font-semibold text-amber-600">
                          {res.bookingNumber}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 mt-1">
                          {res.guest?.firstName} {res.guest?.lastName}
                        </h3>
                        <p className="text-xs text-slate-500">{res.guest?.phone}</p>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        In-House
                      </span>
                    </div>

                    <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Room Allocated:</span>
                        <span className="font-bold text-slate-900">
                          Room {res.room?.roomNumber} ({res.room?.roomType})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Expected Check-Out:</span>
                        <span className="text-slate-700">
                          {new Date(res.checkOutDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Base Room Rent:</span>
                        <span className="font-semibold text-emerald-600">
                          ₹{res.totalAmount?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end">
                    <button
                      onClick={() => handleOpenCheckOutModal(res)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition shadow-xs"
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
            <div className="bg-white border border-slate-200 p-12 text-center rounded-2xl shadow-xs">
              <LogIn className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-500">No pending arrivals today.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deskData.arrivals.map((res) => (
                <div
                  key={res._id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 hover:shadow-xs transition flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-mono font-semibold text-blue-600">
                          {res.bookingNumber}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 mt-1">
                          {res.guest?.firstName} {res.guest?.lastName}
                        </h3>
                        <p className="text-xs text-slate-500">{res.guest?.phone}</p>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        Confirmed
                      </span>
                    </div>

                    <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Assigned Room:</span>
                        <span className="font-bold text-slate-900">
                          Room {res.room?.roomNumber} ({res.room?.roomType})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Stay Duration:</span>
                        <span className="text-slate-700">
                          {res.totalNights} Night{res.totalNights > 1 ? 's' : ''} ({res.numberOfGuests} guests)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">ID Verification:</span>
                        <span className="text-amber-700 font-mono">
                          {res.guest?.idProof?.type} ({res.guest?.idProof?.idNumber})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100">
                    <button
                      onClick={() =>
                        handleCheckIn(res._id, `${res.guest?.firstName} ${res.guest?.lastName}`, res.room?.roomNumber)
                      }
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition shadow-xs"
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
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Booking #</th>
                  <th className="py-3.5 px-4">Guest</th>
                  <th className="py-3.5 px-4">Room Released</th>
                  <th className="py-3.5 px-4">Check-Out Date</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deskData.departures.map((res) => (
                  <tr key={res._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-medium text-amber-600">
                      {res.bookingNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {res.guest?.firstName} {res.guest?.lastName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800">
                      Room {res.room?.roomNumber} ({res.room?.roomType})
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {res.actualCheckOutTime ? new Date(res.actualCheckOutTime).toLocaleString() : 'Recent'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-600">
                      ₹{res.totalAmount?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center space-x-2 text-rose-600 mb-2">
              <Receipt className="w-5 h-5" />
              <h3 className="text-lg font-bold text-slate-900">Guest Check-Out & Final Bill</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Settle account for{' '}
              <strong className="text-slate-900">
                {checkoutModalRes.guest?.firstName} {checkoutModalRes.guest?.lastName}
              </strong>{' '}
              in Room <strong className="text-slate-900">{checkoutModalRes.room?.roomNumber}</strong>.
            </p>

            <form onSubmit={handleCheckOutSubmit} className="space-y-4">
              {/* Itemized Calculation Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-sm">
                <div className="flex justify-between text-slate-700">
                  <span>Room Stay Charges ({checkoutModalRes.totalNights} nights):</span>
                  <span>₹{baseCharges.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-xs">
                  <span>GST (12%):</span>
                  <span>+ ₹{taxAmount.toLocaleString('en-IN')}</span>
                </div>
                {Number(billingForm.serviceCharges) > 0 && (
                  <div className="flex justify-between text-slate-500 text-xs">
                    <span>Extra Service Charges:</span>
                    <span>+ ₹{Number(billingForm.serviceCharges).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {Number(billingForm.discountAmount) > 0 && (
                  <div className="flex justify-between text-emerald-600 text-xs">
                    <span>Discount Applied:</span>
                    <span>- ₹{Number(billingForm.discountAmount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-base text-emerald-700">
                  <span>Total Amount Due:</span>
                  <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">
                    Extra Charges (Food/Laundry) ₹
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={billingForm.serviceCharges}
                    onChange={(e) =>
                      setBillingForm({ ...billingForm, serviceCharges: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">
                    Discount Amount ₹
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={billingForm.discountAmount}
                    onChange={(e) =>
                      setBillingForm({ ...billingForm, discountAmount: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 font-medium block mb-1">Payment Method *</label>
                <select
                  value={billingForm.paymentMethod}
                  onChange={(e) =>
                    setBillingForm({ ...billingForm, paymentMethod: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="NetBanking">NetBanking</option>
                  <option value="Cash">Cash at Counter</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-600 font-medium block mb-1">Billing Notes</label>
                <input
                  type="text"
                  value={billingForm.remarks}
                  onChange={(e) => setBillingForm({ ...billingForm, remarks: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCheckoutModalRes(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-xs"
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
