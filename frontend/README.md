# FormuLAW - Legal Consultation Platform

<p align="center">
  <strong>Say it • Seek it • Sorted</strong>
</p>

India's premier legal consultation platform connecting clients with verified advocates for instant legal help.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB (for backend)
- Python 3.9+ (for backend)

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python server.py
```

## 📁 Project Structure

```
formulaw/
├── frontend/                 # React Frontend Application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI components (Shadcn/UI)
│   │   ├── context/         # React Context (Auth)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions
│   │   └── pages/           # Page components
│   │       ├── admin/       # Admin portal pages
│   │       ├── advocate/    # Advocate portal pages
│   │       └── client/      # Client portal pages
│   ├── package.json
│   ├── vercel.json          # Vercel deployment config
│   └── netlify.toml         # Netlify deployment config
│
└── backend/                  # FastAPI Backend
    ├── server.py            # Main API server
    ├── requirements.txt     # Python dependencies
    └── .env                 # Environment variables
```

## 🌐 Three Portals

### 1. Client Portal (`/client`)
- Email OTP login
- Search advocates by location, expertise, language
- View advocate profiles and ratings
- Initiate consultations
- Wallet system for payments
- Call history

### 2. Advocate Portal (`/advocate`)
- Professional registration with Bar Council verification
- Dashboard with earnings and case statistics
- Duty ON/OFF toggle for availability
- Call history and client management
- Profile management

### 3. Admin Portal (`/admin`)
- Verify/reject advocate registrations
- View all users and advocates
- Monitor call logs
- Platform analytics

## 🔧 Environment Variables

### Frontend (.env)
```
REACT_APP_BACKEND_URL=https://your-backend-url.com
```

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=formulaw
RESEND_API_KEY=re_xxxxx
SENDER_EMAIL=noreply@yourdomain.com
```

## 🚀 Deployment

### Vercel (Frontend)
1. Push code to GitHub
2. Import project in Vercel
3. Set root directory to `frontend`
4. Add environment variables
5. Deploy!

### Netlify (Frontend)
1. Push code to GitHub
2. Import project in Netlify
3. Build settings are in `netlify.toml`
4. Add environment variables
5. Deploy!

### Backend (Railway/Render/Heroku)
1. Create new project
2. Connect GitHub repository
3. Set root directory to `backend`
4. Add environment variables
5. Deploy!

## 📝 API Documentation

Backend API runs on FastAPI with automatic documentation:
- Swagger UI: `/docs`
- ReDoc: `/redoc`

## 🔒 Security Features
- Email OTP authentication
- JWT token-based sessions
- Role-based access control (RBAC)
- Bar Council ID verification for advocates

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Tailwind CSS
- Shadcn/UI Components
- React Router DOM
- Axios

**Backend:**
- FastAPI (Python)
- MongoDB with Motor (async driver)
- Resend (Email OTP)
- JWT Authentication

## 📄 License

© 2026 FormuLAW. All rights reserved.

---

<p align="center">
  Made with ❤️ in India
</p>
