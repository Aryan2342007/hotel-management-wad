# 🏨 Grand Stay Hotel Management System (ADBMS)

A full-stack, enterprise-grade Hotel Management System built for the **Advanced Database Management System (ADBMS)** course.

Developed with **React (Vite)**, **Node.js**, **Express.js**, and **MongoDB (Mongoose)**.

---

## 🌟 Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19 (Vite) + Tailwind CSS v4 + Lucide Icons | Responsive staff dashboard and front-desk portal |
| **Backend** | Node.js + Express.js | Modular RESTful API architecture |
| **Database** | MongoDB (Local / Compass) | Document-oriented database |
| **ODM** | Mongoose | Strict schema validation, population, and indexing |
| **API Testing** | Postman | Ready-to-import Postman JSON collection included |
| **Database GUI**| MongoDB Compass | Direct inspection at `mongodb://127.0.0.1:27017` |

---

## 📋 The 8 Project Modules

1. **Guest Management (`/api/guests`)**
   - Register guests with contact information and official ID proof (Aadhar, Passport, DL).
   - Search guests by name, phone, email, or ID number.
   - Populated guest reservation history.

2. **Room Management (`/api/rooms`)**
   - Manage inventory across 5 room tiers: *Single*, *Double*, *Deluxe*, *Suite*, and *Penthouse*.
   - Filter by status (*Available*, *Occupied*, *Cleaning*, *Maintenance*).
   - Date-range collision availability checking.
   - Quick one-click room status changer.

3. **Reservation Management (`/api/reservations`)**
   - Book rooms with automatic stay duration and pricing calculations.
   - Collision detection using MongoDB compound index queries to prevent double-booking.
   - Cancellation workflow with cancellation reason tracking.

4. **Check-In Management (`/api/checkinout/check-in/:id`)**
   - Front-desk arrival processing for confirmed reservations.
   - Automatically switches room status to `Occupied` and reservation status to `CheckedIn`.

5. **Check-Out Management (`/api/checkinout/check-out/:id`)**
   - Automated billing and checkout calculation.
   - Settle food, laundry, or extra charges and apply discounts.
   - Instantly marks stay as `CheckedOut`, generates a final GST invoice, and releases the room to `Cleaning`.

6. **Payment & Billing Management (`/api/payments`)**
   - Automatic GST (12% or 18%) tax and service charge calculations.
   - Generates itemized invoices with unique invoice numbers (e.g., `INV-2026-801`).
   - Supports Credit/Debit Card, UPI, NetBanking, and Cash.
   - Printable / styled viewable modal invoice.

7. **Staff Management (`/api/staff`)**
   - Employee roster across hotel departments (Manager, Receptionist, Housekeeping, Chef, Security).
   - Track shifts (Morning, Evening, Night, General) and salaries.

8. **Dashboard & ADBMS Aggregations (`/api/dashboard`)**
   - Real-time KPIs: Occupancy rate %, total revenue, active bookings, registered guests.
   - Room status distribution bar and room category price breakdown.
   - Today's expected arrivals and departures.

---

## 🎓 ADBMS Concepts Implemented

1. **Document-Based Data Modeling**: Clean, normalized schemas for `Guest`, `Room`, `Reservation`, `Payment`, and `Staff`.
2. **References & Normalization**: Cross-collection relationships using Mongoose `ref` and `populate`, and MongoDB `$lookup`.
3. **Compound & Single Field Indexing**:
   - Unique index on `roomNumber`, `email`, and `staffCode`.
   - Compound index on `{ room: 1, checkInDate: 1, checkOutDate: 1 }` for high-speed collision checking.
   - Compound index on `{ paidAt: -1, paymentStatus: 1 }` for revenue timeline queries.
4. **MongoDB Aggregation Pipelines**:
   - `$facet` for multi-stage room inventory grouping in a single pass.
   - `$lookup` + `$unwind` + `$group` + `$sort` to aggregate top spending guests.
   - `$lookup` + `$group` + `$avg` to calculate revenue and booking frequency by room category.
   - `$project` + `$dateToString` + `$group` for monthly revenue analytics.
5. **Interactive ADBMS Query Lab**: A dedicated tab in the frontend allowing evaluators to view the exact Mongoose aggregation code alongside live executed JSON results.

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+)
- MongoDB Server running locally (`mongodb://127.0.0.1:27017`)

### 1. Backend Setup
```powershell
cd backend
npm install
npm run seed     # Populates sample rooms, guests, staff, bookings & payments
npm run dev      # Starts Express server on http://localhost:5000
```

### 2. Frontend Setup
```powershell
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

Open your browser at **[http://localhost:5173](http://localhost:5173)**.

---

## 📮 Postman Collection
Import the file located at:
`backend/hotel_management_postman_collection.json`
into Postman for instant testing of all endpoints.
