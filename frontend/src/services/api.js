import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dashboard & ADBMS Analytics
export const getDashboardStats = () => api.get('/dashboard/stats');
export const getRoomAnalytics = () => api.get('/dashboard/room-analytics');
export const getRevenueTrends = () => api.get('/dashboard/revenue-trends');
export const getAdbmsLabQueries = () => api.get('/dashboard/adbms-lab');

// Rooms
export const getRooms = (params) => api.get('/rooms', { params });
export const getAvailableRooms = (params) => api.get('/rooms/available', { params });
export const getRoomById = (id) => api.get(`/rooms/${id}`);
export const createRoom = (data) => api.post('/rooms', data);
export const updateRoom = (id, data) => api.put(`/rooms/${id}`, data);
export const updateRoomStatus = (id, status) => api.patch(`/rooms/${id}/status`, { status });
export const deleteRoom = (id) => api.delete(`/rooms/${id}`);

// Guests
export const getGuests = (params) => api.get('/guests', { params });
export const getGuestById = (id) => api.get(`/guests/${id}`);
export const createGuest = (data) => api.post('/guests', data);
export const updateGuest = (id, data) => api.put(`/guests/${id}`, data);
export const deleteGuest = (id) => api.delete(`/guests/${id}`);

// Reservations
export const getReservations = (params) => api.get('/reservations', { params });
export const getReservationById = (id) => api.get(`/reservations/${id}`);
export const createReservation = (data) => api.post('/reservations', data);
export const cancelReservation = (id, reason) => api.patch(`/reservations/${id}/cancel`, { cancellationReason: reason });
export const updateReservation = (id, data) => api.put(`/reservations/${id}`, data);

// Check-In / Check-Out
export const getDeskSummary = () => api.get('/checkinout/desk');
export const performCheckIn = (reservationId) => api.post(`/checkinout/check-in/${reservationId}`);
export const performCheckOut = (reservationId, billingData) => api.post(`/checkinout/check-out/${reservationId}`, billingData);

// Payments & Invoices
export const getPayments = (params) => api.get('/payments', { params });
export const getPaymentById = (id) => api.get(`/payments/${id}`);
export const createPayment = (data) => api.post('/payments', data);
export const updatePaymentStatus = (id, status) => api.patch(`/payments/${id}/status`, { status });

// Staff
export const getStaff = (params) => api.get('/staff', { params });
export const getStaffById = (id) => api.get(`/staff/${id}`);
export const createStaff = (data) => api.post('/staff', data);
export const updateStaff = (id, data) => api.put(`/staff/${id}`, data);
export const deleteStaff = (id) => api.delete(`/staff/${id}`);

export default api;
