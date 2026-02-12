# ParthSarthi – Deployment & Environment Variables

## Architecture

- **Frontend (Next.js):** Netlify → `https://paarthsarthi.netlify.app`
- **Backend (Express):** Vercel → e.g. `https://parthsarthi-api.vercel.app`

Frontend calls backend via `NEXT_PUBLIC_API_URL` (must point to backend base URL + `/api`).

---

## 1. Backend on Vercel

### Create project
- Vercel → **Add New** → **Project** → repo **PaarthSarthi**
- **Root Directory:** `backend`
- **Framework:** Other (no override)
- **Build Command:** `npm install` (or leave default)
- **Output Directory:** leave empty

### Environment variables (Vercel → Project → Settings → Environment Variables)

Add these for **Production** (and same for Preview if you use branches):

| Variable       | Value (example) | Required |
|----------------|------------------|----------|
| `MONGO_URI`    | `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/parthsarthi?retryWrites=true&w=majority` | Yes |
| `JWT_SECRET`   | Long random string (e.g. 32+ chars) | Yes |
| `JWT_EXPIRE`   | `7d` | Yes |
| `FRONTEND_URL` | `https://paarthsarthi.netlify.app` | Yes (for CORS) |
| `BLOB_READ_WRITE_TOKEN` | From Vercel → Storage → Blob store (Create store if needed) | Yes (for image uploads on Vercel) |
| `NODE_ENV`     | `production` | Optional |

- **Do not** set `PORT` or `VERCEL` – Vercel sets these.
- **BLOB_READ_WRITE_TOKEN:** Create a Blob store in the same Vercel project (Storage tab), then copy the token into env vars so alumni/mentor/course/startup/blog photos are stored in Blob and persist.
- After deploy, note the backend URL, e.g. `https://parthsarthi-api.vercel.app`.  
  API base for the frontend is: **`https://parthsarthi-api.vercel.app/api`**

---

## 2. Frontend on Netlify

### Create project
- Netlify → **Add new site** → **Import from Git** → repo **PaarthSarthi**
- **Base directory:** leave empty (repo root = Next.js app)
- **Build command:** `pnpm run build` or `npm run build`
- **Publish directory:** leave default (Netlify detects Next.js)

### Environment variables (Netlify → Site → Site configuration → Environment variables)

| Variable                | Value (example) | Required |
|-------------------------|------------------|----------|
| `NEXT_PUBLIC_API_URL`   | `https://parthsarthi-api.vercel.app/api` | Yes |

- Replace `parthsarthi-api.vercel.app` with your actual **Vercel backend** URL.
- No trailing slash: use `.../api`, not `.../api/`.

---

## 3. Local development

### Backend (`.env` in `backend/`)

```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-secret
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Frontend (`.env.local` in project root)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Quick checklist

1. **Vercel (backend):** Root = `backend`, env: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `FRONTEND_URL`.
2. **Netlify (frontend):** Root = default, env: `NEXT_PUBLIC_API_URL` = `https://<backend-url>/api`.
3. **MongoDB Atlas:** Network Access → allow `0.0.0.0/0` (or add Vercel IPs if you restrict).
4. After any env change on Netlify or Vercel, trigger a **redeploy**.
