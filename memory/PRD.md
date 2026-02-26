# FormuLAW - Legal Consultation Platform
## Product Requirements Document

### Overview
FormuLAW is India's premier legal consultation platform connecting clients with verified advocates for instant legal help. The platform consists of three portals powered by a single backend.

---

## Tech Stack

### Frontend
- **Framework**: React 18 with Create React App + CRACO
- **Styling**: Tailwind CSS + Shadcn/UI Components
- **Routing**: React Router DOM v6
- **State**: React Context API
- **HTTP**: Axios

### Backend
- **Framework**: FastAPI (Python 3.9+)
- **Database**: MongoDB with Motor (async driver)
- **Email**: Resend API ✅ Connected
- **Auth**: JWT + Email OTP

---

## Portals & Features

### 1. Client Portal (`/client/*`)
| Route | Page | Status |
|-------|------|--------|
| `/client` | Login | ✅ |
| `/client/home` | Dashboard - Search Advocates | ✅ |
| `/client/advocate/:id` | Advocate Profile | ✅ |
| `/client/wallet` | Wallet & Transactions | ✅ |
| `/client/call-history` | Call History | ✅ |
| `/client/profile` | User Profile | ✅ |

### 2. Advocate Portal (`/advocate/*`)
| Route | Page | Status |
|-------|------|--------|
| `/advocate` | Login | ✅ |
| `/advocate/register` | Registration Form | ✅ |
| `/advocate/dashboard` | Dashboard | ✅ |
| `/advocate/profile` | Profile Management | ✅ |
| `/advocate/call-history` | Call History | ✅ |
| `/advocate/earnings` | Earnings Report | ✅ |

### 3. Admin Portal (`/admin/*`)
| Route | Page | Status |
|-------|------|--------|
| `/admin` | Login | ✅ |
| `/admin/dashboard` | Analytics Dashboard | ✅ |
| `/admin/advocates` | Advocate Management | ✅ |
| `/admin/users` | User Management | ✅ |
| `/admin/calls` | Call Logs | ✅ |

---

## Integrations

| Service | Purpose | Status |
|---------|---------|--------|
| Resend | Email OTP | ✅ Connected |
| Razorpay | Payments | ⏳ Mock (needs key) |
| Twilio | Masked Calls | ⏳ Mock (needs key) |

---

## Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm install
npm run build
# Output: /build folder
```

**Vercel Settings:**
- Framework: Create React App
- Build Command: `npm run build`
- Output Directory: `build`
- Root Directory: `frontend`

**Environment Variables:**
```
REACT_APP_BACKEND_URL=https://your-backend-url.com
```

### Backend (Railway/Render)
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001
```

**Environment Variables:**
```
MONGO_URL=mongodb+srv://...
DB_NAME=formulaw
RESEND_API_KEY=re_xxxxx
SENDER_EMAIL=noreply@formulaw.in
```

---

## Database Schema

### Collections
- `users` - Client accounts
- `advocates` - Advocate profiles with verification status
- `admins` - Admin accounts
- `otps` - OTP storage (auto-expires)
- `calls` - Call records
- `wallets` - Wallet balances and transactions

---

## What's Complete (Feb 26, 2026)

1. ✅ Full project structure with professional comments
2. ✅ Three working portals (Client, Advocate, Admin)
3. ✅ Premium UI with law library theme
4. ✅ Email OTP authentication (Resend)
5. ✅ Advocate registration with Bar Council verification
6. ✅ Wallet system with transaction history
7. ✅ Search advocates with filters
8. ✅ Admin verification workflow
9. ✅ Vercel/Netlify deployment configs
10. ✅ Professional README

---

## Pending (Needs API Keys)

1. ⏳ Razorpay - Real payment processing
2. ⏳ Twilio - Masked GSM calls
3. ⏳ Custom domain (formulaw.in) - Ready to connect

---

## File Structure

```
/app
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/ui/     # Shadcn components
│   │   ├── context/           # AuthContext
│   │   ├── hooks/             # Custom hooks
│   │   ├── lib/               # Utilities
│   │   └── pages/
│   │       ├── admin/         # Admin pages
│   │       ├── advocate/      # Advocate pages
│   │       └── client/        # Client pages
│   ├── App.js                 # Main router
│   ├── craco.config.js        # Build config
│   ├── package.json
│   ├── vercel.json            # Vercel config
│   └── netlify.toml           # Netlify config
│
└── backend/
    ├── server.py              # FastAPI server
    ├── requirements.txt
    └── .env
```

---

## Test Credentials

- **Client**: Any email (auto-creates)
- **Advocate**: Register at /advocate/register
- **Admin**: admin@formulaw.com (auto-created)

---

© 2026 FormuLAW. All rights reserved.
