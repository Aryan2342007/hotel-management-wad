import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  Printer,
  Receipt,
  CheckCircle2,
  Calendar,
  IndianRupee,
  FileCheck,
} from 'lucide-react';
import { getPayments } from '../services/api';

const paymentStatuses = ['Paid', 'Pending', 'Refunded'];
const paymentMethods = ['Credit Card', 'Debit Card', 'UPI', 'NetBanking', 'Cash'];

export default function PaymentsView() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (methodFilter) params.method = methodFilter;
      if (search) params.search = search;

      const res = await getPayments(params);
      setPayments(res.data.data);
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, methodFilter, search]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white">Payment & Billing Management</h2>
            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono">
              Module 6
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Track transactions, inspect GST invoices, and verify revenue records.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search invoice number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Payment Statuses</option>
            {paymentStatuses.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Payment Methods</option>
            {paymentMethods.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {(statusFilter || methodFilter || search) && (
            <button
              onClick={() => {
                setStatusFilter('');
                setMethodFilter('');
                setSearch('');
              }}
              className="text-xs text-amber-400 hover:text-amber-300 px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-16 text-slate-500">Loading invoices...</div>
        ) : payments.length === 0 ? (
          <div className="text-center py-16">
            <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No payment invoices found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Guest</th>
                  <th className="py-3.5 px-4">Room & Booking</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4">Total Settled</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      {p.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {p.guest?.firstName} {p.guest?.lastName}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="font-semibold text-slate-200">
                        Room {p.reservation?.room?.roomNumber}
                      </span>
                      <span className="text-slate-500 block font-mono">
                        {p.reservation?.bookingNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      {p.paymentMethod}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">
                      ₹{p.totalAmount?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {new Date(p.paidAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          p.paymentStatus === 'Paid'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : p.paymentStatus === 'Pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedInvoice(p)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center space-x-1.5 ml-auto"
                      >
                        <Receipt className="w-3.5 h-3.5 text-amber-400" />
                        <span>View Invoice</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Printable Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-8 shadow-2xl text-slate-200">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-5">
              <div>
                <h3 className="text-xl font-bold text-white">Grand Stay Luxury Hotel</h3>
                <p className="text-xs text-slate-400 mt-0.5">MG Road, City Center, Gujarat, India</p>
                <p className="text-[11px] text-slate-500">GSTIN: 24AAACG1234F1Z8</p>
              </div>
              <div className="text-right">
                <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                  PAID INVOICE
                </span>
                <p className="text-xs font-mono text-amber-400 font-bold mt-2">
                  {selectedInvoice.invoiceNumber}
                </p>
                <p className="text-[11px] text-slate-400">
                  Date: {new Date(selectedInvoice.paidAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Guest & Reservation Info */}
            <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 uppercase font-semibold">Billed To:</span>
                <p className="font-bold text-white text-sm mt-0.5">
                  {selectedInvoice.guest?.firstName} {selectedInvoice.guest?.lastName}
                </p>
                <p className="text-slate-400">{selectedInvoice.guest?.email}</p>
                <p className="text-slate-400">{selectedInvoice.guest?.phone}</p>
              </div>
              <div className="text-right">
                <span className="text-slate-500 uppercase font-semibold">Stay Details:</span>
                <p className="font-bold text-white text-sm mt-0.5">
                  Room {selectedInvoice.reservation?.room?.roomNumber} (
                  {selectedInvoice.reservation?.room?.roomType})
                </p>
                <p className="text-slate-400 font-mono">
                  Booking Ref: {selectedInvoice.reservation?.bookingNumber}
                </p>
                <p className="text-slate-400">Paid via: {selectedInvoice.paymentMethod}</p>
              </div>
            </div>

            {/* Line Items */}
            <div className="py-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Room Charges:</span>
                <span>₹{selectedInvoice.roomCharges?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Goods & Services Tax (GST):</span>
                <span>₹{selectedInvoice.taxAmount?.toLocaleString('en-IN')}</span>
              </div>
              {selectedInvoice.serviceCharges > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>Room Services & Amenities:</span>
                  <span>₹{selectedInvoice.serviceCharges?.toLocaleString('en-IN')}</span>
                </div>
              )}
              {selectedInvoice.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Special Discount:</span>
                  <span>- ₹{selectedInvoice.discountAmount?.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="pt-3 border-t border-slate-800 flex justify-between font-bold text-base text-white">
                <span>Total Amount Paid:</span>
                <span className="text-emerald-400">
                  ₹{selectedInvoice.totalAmount?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {selectedInvoice.remarks && (
              <p className="text-[11px] text-slate-400 italic bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                Note: {selectedInvoice.remarks}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-800 mt-4">
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
