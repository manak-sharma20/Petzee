# 🐾 Petzee — Full-Stack Pet Management Platform

[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://vercel.com)
[![Backend](https://img.shields.io/badge/Backend-Railway-purple?logo=railway)](https://railway.app)
[![DB](https://img.shields.io/badge/Database-PostgreSQL-blue?logo=postgresql)](https://postgresql.org)

> A production-grade platform for pet owners to manage pets, book verified services, consult vets in real-time, and get vaccination reminders.

---

## 🗂️ Project Structure

```
Petzee/
├── frontend/          # React + Vite (deploys to Vercel)
└── backend/           # Node.js + Express (deploys to Railway)
```

---

## ✨ Features

| Module | Features |
|--------|----------|
| 🔐 Auth | JWT login/register, RBAC (Owner / Provider / Vet / Admin) |
| 🐾 Pets | Add/edit pets, vaccination records, file upload to Cloudinary |
| 📅 Bookings | Browse services, book, confirm/cancel, review |
| 💬 Vet Chat | Real-time Socket.io chat with message history |
| 🔔 Notifications | In-app + email (Nodemailer), daily cron reminders |
| 🛠️ Services | Providers list/manage services, accept bookings |
| 🛡️ Admin | User management, provider verification, stats |

---

## 🚀 Local Setup

### Prerequisites
- Node.js ≥ 18
- PostgreSQL running locally
- A free [Cloudinary](https://cloudinary.com) account

### Backend

```bash
cd backend
cp .env.example .env        # fill in your values
npm install
npx prisma migrate dev      # creates DB tables
npm run dev                 # starts on :5000
```

### Frontend

```bash
cd frontend
# .env.local already set to http://localhost:5000/api
npm install
npm run dev                 # starts on :5173
```

---

## 🌍 Deployment

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import `Petzee` repo
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   ```
   VITE_API_URL = https://your-backend.up.railway.app/api
   ```
4. Click **Deploy** ✅

### Backend → Railway

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select the `Petzee` repo, set **Root Directory** to `backend`
3. Add a **PostgreSQL** service (Railway provides one free)
4. Set environment variables from `.env.example`
5. Deploy — Railway auto-runs `npm install && npx prisma generate` then `node src/server.js`

---

## 🗄️ Database Schema

```
User ──< Pet ──< VaccinationRecord
User ──< Booking >── Service ── Provider
User ──< Consultation >── Message
User ──< Notification
Booking ── Review
```

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | JWT | Current user |
| GET | `/api/pets` | OWNER | List pets |
| POST | `/api/pets` | OWNER | Add pet |
| POST | `/api/pets/:id/vaccinations` | OWNER | Add vaccination |
| GET | `/api/services` | Public | Browse services |
| POST | `/api/bookings` | OWNER | Create booking |
| PATCH | `/api/bookings/:id/status` | PROVIDER | Update status |
| POST | `/api/consultations` | OWNER | Start vet chat |
| GET | `/api/consultations/:id/messages` | JWT | Chat history |
| GET | `/api/notifications` | JWT | Notifications |
| GET | `/api/admin/stats` | ADMIN | Platform stats |

### WebSocket Events (Socket.io)

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-user` | Client→Server | Join personal notification room |
| `join-consultation` | Client→Server | Join chat room |
| `send-message` | Client→Server | Send message (persisted to DB) |
| `new-message` | Server→Client | Broadcast new message |
| `typing` / `stop-typing` | Bidirectional | Typing indicators |

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, React Router, Axios, Socket.io-client, react-hot-toast, Lucide Icons
- **Backend**: Node.js, Express, Prisma ORM, PostgreSQL
- **Auth**: JWT + bcrypt
- **Real-time**: Socket.io
- **Uploads**: Cloudinary + Multer
- **Email**: Nodemailer (Gmail SMTP)
- **Scheduler**: node-cron
- **Validation**: Zod
- **Security**: Helmet, CORS, express-rate-limit

---

## 👥 User Roles

| Role | Access |
|------|--------|
| `OWNER` | Manage pets, book services, chat with vets |
| `PROVIDER` | Create services, manage bookings |
| `VET` | Accept consultation chats |
| `ADMIN` | Full platform management |

---

Made with ❤️ for pet lovers 🐾
