# 🚀 Grand Stay Hotel Management System - Deployment Guide

This project consists of:
- **Frontend**: React 19 (Vite) + Tailwind CSS v4
- **Backend**: Node.js + Express.js REST API
- **Database**: MongoDB (Mongoose ODM)

You have **two main deployment paths** depending on your preference:
1. **Option 1 (Recommended - Easiest & 100% Free)**: **Single Full-Stack App on Render** (Single URL, no CORS configuration needed, 1 free service).
2. **Option 2 (Decoupled / Microservices)**: **Frontend on Vercel** + **Backend on Render** (Industry standard architecture).

---

## ☁️ Step 1: Set Up MongoDB Atlas (Cloud Database - Free)

Since your current project uses local MongoDB (`mongodb://127.0.0.1:27017`), you must create a free cloud database first.

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in or create a free account.
2. Click **Create** and select the **M0 Free Cluster** (Shared, 512 MB).
3. **Database Access (User Credentials)**:
   - Go to **Security** -> **Database Access** -> **Add New Database User**.
   - Create a username and password (e.g. `hotel_admin` and a strong password).
   - Set role to **Read and write to any database**.
4. **Network Access (Whitelist IPs)**:
   - Go to **Security** -> **Network Access** -> **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`). *(Crucial for cloud hosts like Render and Vercel to connect)*.
5. **Get Connection String**:
   - Go to **Database** -> Click **Connect** on your cluster.
   - Choose **Drivers** (Node.js).
   - Copy the URI string provided by MongoDB Atlas.

### 6. Seed the Cloud Database (One-time command from your local machine)
Before deploying, populate your cloud database with rooms, guests, staff, bookings, and sample invoices:
```powershell
# In PowerShell (paste your connection string copied from step 5):
$env:MONGODB_URI="YOUR_MONGODB_ATLAS_CONNECTION_STRING"
npm run seed
```
You should see:
`🎉 MongoDB Hotel Management Database seeded successfully!`

---

## 📦 Step 2: Push Your Project to GitHub

1. Initialize Git in the project root:
```powershell
git init
git add .
git commit -m "feat: initial commit ready for deployment"
```

2. Create a new repository on [GitHub](https://github.com/new) named `Hotel-management-ADBMS`.
3. Push your repository:
```powershell
git branch -M main
git remote add origin https://github.com/<your-username>/Hotel-management-ADBMS.git
git push -u origin main
```

---

## 🎯 Option 1: Full-Stack Monolith on Render (Recommended)

In this setup, a single Render service builds the React frontend, runs the Node server, and serves both UI and API seamlessly from one URL.

1. Go to [Render.com](https://render.com) and log in.
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository: `Hotel-management-ADBMS`.
4. Configure the settings:
   - **Name**: `grand-stay-hotel`
   - **Region**: Choose the closest region (e.g., Singapore, Frankfurt, Oregon)
   - **Branch**: `main`
   - **Root Directory**: *(leave blank)*
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `<your MongoDB Atlas connection string>`
6. Click **Deploy Web Service**.
7. Once deployed, Render provides your public URL:
   `https://grand-stay-hotel.onrender.com`

---

## 🌐 Option 2: Decoupled Deployment (Frontend on Vercel + Backend on Render)

If you prefer deploying frontend and backend independently:

### Step 2A: Deploy Backend to Render
1. Create a **New Web Service** on [Render.com](https://render.com).
2. Connect your repo.
3. Configure settings:
   - **Name**: `hotel-management-api`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Instance Type**: `Free`
4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `<your MongoDB Atlas connection string>`
5. Click **Deploy Web Service**.
6. Note down your backend URL (e.g. `https://hotel-management-api.onrender.com`).

### Step 2B: Deploy Frontend to Vercel
1. Go to [Vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New...** -> **Project**.
3. Import `Hotel-management-ADBMS`.
4. Configure Project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click edit and select `frontend`
5. Expand **Environment Variables** and add:
   - Key: `VITE_API_URL`
   - Value: `https://hotel-management-api.onrender.com/api` *(your Render backend URL followed by /api)*
6. Click **Deploy**.
7. Vercel will build and assign you a live domain:
   `https://hotel-management-adbms.vercel.app`

---

## 📋 Verification Checklist

| Check | Expected Result |
| :--- | :--- |
| MongoDB Atlas Network Access | `0.0.0.0/0` active |
| Database Seeded | Rooms, Guests, and Staff visible in MongoDB Atlas / App |
| Backend Health Check | Visiting `/api/health` returns `{"status":"OK", ...}` |
| Front-desk Dashboard | KPI cards, graphs, and tables load data |
| ADBMS Query Lab | Live aggregation pipelines execute and render JSON output |
