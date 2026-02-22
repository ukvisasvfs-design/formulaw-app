# FormuLAW - Legal Consultation Platform

## Product Overview
FormuLAW is a Practo-like legal consultation platform with three separate frontend portals (Client, Advocate, Admin) powered by a single FastAPI backend with MongoDB.

## Tech Stack
- **Backend**: FastAPI (Python) with Motor (async MongoDB driver)
- **Frontend**: React with Tailwind CSS and Shadcn/UI components
- **Database**: MongoDB
- **Authentication**: Email OTP based login

## Core Features

### Client Portal (`/client`)
- ✅ Email OTP login
- ✅ Premium dashboard with law library background
- ✅ Search advocates with filters (Law Type, City, Language, Sort)
- ✅ View advocate profiles
- ✅ Wallet system (balance display, topup - mocked)
- ✅ Call history
- ✅ Profile dropdown with logout

### Advocate Portal (`/advocate`)
- ✅ Email OTP login
- ✅ Professional registration form (personal details, Bar Council ID, specializations, pricing)
- ✅ Auto-generated FormuLAW ID (FID-IND-XXXXXX)
- ✅ Premium dashboard with verification status
- ✅ Duty ON/OFF toggle (only for approved advocates)
- ✅ Stats (Earnings, Wallet, Cases, Rating)
- ✅ Profile management
- ✅ Call history
- ✅ Earnings reports

### Admin Portal (`/admin`)
- ✅ Secure OTP login (red color scheme)
- ✅ Pending advocate verifications
- ✅ Approve/Reject advocates
- ✅ View all users
- ✅ View all advocates
- ✅ Call logs
- ✅ Platform analytics

## UI/UX Design
- **Premium Theme**: Law library wallpaper background
- **Tagline**: "Say it • Seek it • Sorted" (purple, animated pulse)
- **Logo**: FormuLAW branding at 80% size
- **Color Scheme**: Amber/gold for client & advocate, Red for admin
- **Consistent Footer**: About Us, Contact Us, Copyright

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and login
- `GET /api/auth/me` - Get current user

### Client APIs
- `GET /api/client/advocates` - Search advocates with filters
- `GET /api/client/advocate/{id}` - Get advocate details
- `POST /api/client/initiate-call` - Start call (mocked Twilio)
- `GET /api/client/call-history` - View call history
- `POST /api/client/rate-call` - Rate completed call
- `GET /api/client/wallet` - Get wallet balance
- `POST /api/client/wallet/topup` - Add money (mocked Razorpay)
- `GET /api/client/wallet/transactions` - Transaction history

### Advocate APIs
- `POST /api/advocate/register` - Register new advocate
- `GET /api/advocate/profile` - Get profile
- `PUT /api/advocate/profile` - Update profile
- `PATCH /api/advocate/duty-status` - Toggle online/offline
- `GET /api/advocate/dashboard` - Dashboard stats
- `GET /api/advocate/call-history` - Call history

### Admin APIs
- `GET /api/admin/advocates/pending` - Pending verifications
- `PUT /api/admin/advocates/{id}/verify` - Approve/Reject
- `GET /api/admin/advocates` - All advocates
- `GET /api/admin/users` - All users
- `GET /api/admin/calls` - All calls
- `GET /api/admin/analytics` - Platform stats

### Utility APIs
- `GET /api/utils/cities` - Indian cities list
- `GET /api/utils/law-types` - Law specializations
- `GET /api/utils/languages` - Indian languages

## MOCKED Integrations (Placeholder)
- **Twilio**: Masked GSM calls - currently logs to console
- **Resend**: Email OTP - OTPs stored in DB, not actually sent
- **Razorpay**: Payments - topup always succeeds

## Test Credentials
- **Client**: Any email (auto-creates user)
- **Advocate**: Must register first at /advocate/register
- **Admin**: admin@formulaw.com (auto-created on startup)

## Database Collections
- `users` - Client accounts
- `advocates` - Advocate profiles
- `admins` - Admin accounts
- `otps` - OTP storage (auto-expires)
- `calls` - Call records
- `wallets` - Wallet data with transactions

## What's Been Implemented (Feb 22, 2026)
1. ✅ Full project scaffolding (FastAPI + React)
2. ✅ All backend APIs for auth, advocates, clients, admin, wallet
3. ✅ Premium UI for all auth pages (login, register)
4. ✅ Premium UI for dashboards (Client Home, Advocate Dashboard)
5. ✅ Profile dropdowns with logout
6. ✅ Logo reduced to 80%
7. ✅ Purple animated tagline across all pages
8. ✅ Verification status handling for advocates
9. ✅ Testing completed - 100% backend, 100% frontend

## Upcoming/Future Tasks
- [ ] Integrate real Twilio for masked calls
- [ ] Integrate Resend for actual email OTPs
- [ ] Integrate Razorpay for real payments
- [ ] Advocate rating & review system
- [ ] Consultation history with recordings
- [ ] Email/SMS booking confirmations
- [ ] Referral program
