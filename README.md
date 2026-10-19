# MEDIVANTA

**Live Hospital Dashboard for Rural Maharashtra**

A full-stack web application where patients search nearby hospitals, see live bed and OPD status, book appointments, and get instant answers from an AI chatbot — while hospital staff update everything through a secured admin panel.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS 3 |
| Backend | Node.js 20 + Express 4 |
| Database | PostgreSQL 16 |
| Real-time | Socket.IO |
| Maps | Leaflet + OpenStreetMap |
| Auth | JWT + bcrypt |

## Project Structure

```
medivanta/
├── client/          # React SPA
├── server/          # Express API
└── docs/            # Project documentation
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+

### Setup

1. **Configure environment**
   Edit `server/.env` with your PostgreSQL database password:
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/medivanta
   ```
   *(Or use a free cloud PostgreSQL connection string from Neon / Supabase)*

2. **Initialize database & seed sample hospitals**
   ```bash
   cd server
   npm run db:setup
   ```
   This will automatically create the `medivanta` database, apply all tables from `schema.sql`, and seed the surveyed hospitals (Dr. Awari Hospital & Samarth Ayurved College Hospital).

3. **Start the application**
   ```bash
   # Terminal 1 — Backend Express & Socket.IO server
   cd server
   npm run dev

   # Terminal 2 — Frontend React & Vite application
   cd client
   npm run dev
   ```

   - **Frontend App**: `http://localhost:5173`
   - **Backend API**: `http://localhost:5000`

   Server runs on `http://localhost:5000`, client on `http://localhost:5173`.

## Demo Hospitals

| Hospital | Location | Beds | ICU | 24×7 |
|----------|----------|------|-----|------|
| Dr. Awari Hospital | Botal, Sangamner | 10 | — | No |
| Samarth Ayurved College Hospital | Belhe, Junnar | 100 | 5 | Yes |

## License

Academic use only — B.Tech Final Year Project.
