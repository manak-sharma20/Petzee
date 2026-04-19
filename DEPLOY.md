# 🚀 Petzee Deployment Guide

Follow these steps to deploy your application to production in under 5 minutes.

---

## 1. Backend Deployment (Railway)

1.  **Push to GitHub**: Ensure all changes are pushed to your repository.
2.  **Create Railway Project**:
    - Go to [railway.app](https://railway.app) and click **"New Project"**.
    - Select **"Deploy from GitHub repo"** and choose `Petzee`.
    - Set the **Root Directory** to `backend`.
3.  **Add Database**:
    - Click **"Add Service"** → **"Database"** → **"PostgreSQL"**.
    - Railway will automatically provide a `DATABASE_URL`.
4.  **Set Environment Variables**:
    - Select the `backend` service → **Variables** tab.
    - Click **"Raw Editor"** and copy-paste the contents of your `backend/.env.production`.
    - **IMPORTANT**: Replace placeholders with real values (JWT secret, Cloudinary, etc.).
    - Ensure `CLIENT_URL` is set to your future Vercel URL (you can update this later).

---

## 2. Frontend Deployment (Vercel)

1.  **Create Vercel Project**:
    - Go to [vercel.com](https://vercel.com) and click **"Add New"** → **"Project"**.
    - Import your `Petzee` repository.
    - Set the **Root Directory** to `frontend`.
2.  **Configure Framework**:
    - Vercel should auto-detect **Vite**.
3.  **Set Environment Variables**:
    - Expand the **Environment Variables** section.
    - Add `VITE_API_URL`.
    - Value: `https://your-backend-name.up.railway.app/api` (get this from Railway).
4.  **Deploy**:
    - Click **"Deploy"**. Done! ✅

---

## 🛠️ Verification & Troubleshooting

- **CORS Errors?** Make sure `CLIENT_URL` in Railway matches your Vercel domain exactly.
- **Prisma Errors?** I've added a `postinstall` script to your `backend/package.json` so Railway should handle this automatically.
- **Blank Screen?** Check the Vercel logs and ensure `VITE_API_URL` is correct.

---

### Prepared Files Summary
- Recreated `frontend/package.json` (was missing).
- Configured `frontend/vercel.json` for Vite routing.
- Added `backend/package.json` with `postinstall`.
- Added `.env.production` templates for both.
