# FormuLAW - Legal Consultation Platform

A comprehensive Practo-like platform for legal consultations with THREE separate portals.

## 🚀 Platform Overview

FormuLAW is a full-stack legal consultation platform featuring:
- **Client Portal** - Find and consult with verified advocates
- **Advocate Portal** - Manage profile, consultations, and earnings
- **Admin Panel** - Verify advocates and monitor platform operations

## 📋 Features

### Client Portal (`/client`)
✅ Email OTP authentication (1-minute expiry)
✅ Search advocates by:
  - Law type (Family, Criminal, Civil, Corporate, etc.)
  - Location (city-based)
  - Language preference
  - Availability (Duty ON/OFF)
  - Rating and experience
✅ Advocate profiles with ratings and reviews
✅ Wallet system with PhonePe/Razorpay integration
✅ Audio call initiation (Twilio masked calls)
✅ Real-time wallet deduction per minute
✅ Call history with mandatory rating system
✅ Transaction history

### Advocate Portal (`/advocate`)
✅ Email OTP authentication
✅ Registration with Bar Council ID verification
✅ Profile management:
  - Personal details (name, email, phone)
  - Professional details (Bar Council ID, experience)
  - Languages and specializations
  - Working hours preference
  - Per-minute consultation charges
  - Office location
✅ Dashboard with:
  - Duty ON/OFF toggle
  - Total earnings
  - Wallet balance
  - Total cases
  - Average rating
✅ Call management (accept/reject)
✅ Earnings tracking
✅ Call history
✅ FormuLAW ID (FID) - unique advocate identifier
  - Format: FID-IND-000001
  - Auto-generated at registration

### Admin Panel (`/admin`)
✅ Secure admin authentication
✅ Advocate verification workflow:
  - Pending verifications dashboard
  - Bar Council ID verification
  - Approve/reject advocates
  - Email notifications on approval
✅ User management
✅ Call logs monitoring
✅ Platform analytics:
  - Total users
  - Total advocates
  - Total calls
  - Total revenue
✅ Detailed advocate profiles review

## 🔧 Technical Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB with Motor (async driver)
- **Authentication**: OTP-based (email)
- **Port**: 8001 (internal)

### Frontend
- **Framework**: React 19
- **Routing**: React Router v7
- **UI Components**: Shadcn UI + Tailwind CSS
- **Notifications**: Sonner (toast notifications)
- **Port**: 3000

### Integrations (Placeholders Ready)
- **Resend**: Email OTP delivery
- **Twilio**: Masked GSM calls (Rapido-style)
- **Razorpay**: Wallet payments with PhonePe support

## 📂 Project Structure

```
/app/
├── backend/
│   ├── server.py                 # Main FastAPI application
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── client/          # Client portal pages
│   │   │   ├── advocate/        # Advocate portal pages
│   │   │   └── admin/           # Admin portal pages
│   │   ├── components/          # Shadcn UI components
│   │   ├── context/
│   │   │   └── AuthContext.js   # Authentication context
│   │   ├── lib/
│   │   │   └── utils.js         # Utility functions
│   │   ├── App.js               # Main routing
│   │   └── index.js
│   └── package.json
└── README_FORMULAW.md
```

## 🗄️ Database Schema

### Collections

#### `users`
```json
{
  "id": "uuid",
  "email": "string",
  "role": "client",
  "name": "string",
  "city": "string",
  "token": "string",
  "created_at": "datetime",
  "last_login": "datetime"
}
```

#### `advocates`
```json
{
  "id": "uuid",
  "fid": "FID-IND-000001",
  "fid_number": 1,
  "email": "string",
  "role": "advocate",
  "first_name": "string",
  "last_name": "string",
  "phone_number": "string",
  "bar_council_id": "string",
  "bar_council_issue_years": "int",
  "bar_council_issue_months": "int",
  "languages": ["array"],
  "law_types": ["array"],
  "working_hours": "anytime|9am_10pm|24_7",
  "area": "string",
  "city": "string",
  "state": "string",
  "per_minute_charge": "float",
  "verification_status": "pending|approved|rejected",
  "duty_status": "boolean",
  "average_rating": "float",
  "total_cases": "int",
  "token": "string",
  "created_at": "datetime"
}
```

#### `calls`
```json
{
  "id": "uuid",
  "client_id": "uuid",
  "advocate_id": "uuid",
  "twilio_call_sid": "string",
  "status": "initiated|connected|completed|failed",
  "start_time": "datetime",
  "end_time": "datetime",
  "duration_minutes": "float",
  "cost_per_minute": "float",
  "total_cost": "float",
  "masked_number": "string",
  "rating": "1-5",
  "created_at": "datetime"
}
```

#### `wallets`
```json
{
  "user_id": "uuid",
  "balance": "float",
  "currency": "INR",
  "transactions": [
    {
      "type": "credit|debit",
      "amount": "float",
      "timestamp": "datetime",
      "reference": "string"
    }
  ]
}
```

#### `otps`
```json
{
  "email": "string",
  "otp_code": "string",
  "expires_at": "datetime",
  "verified": "boolean",
  "role": "client|advocate|admin"
}
```

#### `admins`
```json
{
  "id": "uuid",
  "email": "string",
  "role": "admin",
  "name": "string",
  "token": "string",
  "created_at": "datetime"
}
```

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and login
- `GET /api/auth/me` - Get current user profile

### Client APIs (`/api/client`)
- `GET /api/client/advocates` - List advocates with filters
- `GET /api/client/advocate/:id` - Get advocate details
- `POST /api/client/initiate-call` - Initiate masked call
- `GET /api/client/call-history` - Get call history
- `POST /api/client/rate-call` - Rate a call
- `GET /api/client/wallet` - Get wallet balance
- `POST /api/client/wallet/topup` - Add money to wallet
- `GET /api/client/wallet/transactions` - Get transaction history

### Advocate APIs (`/api/advocate`)
- `POST /api/advocate/register` - Register new advocate
- `GET /api/advocate/profile` - Get advocate profile
- `PUT /api/advocate/profile` - Update profile
- `PATCH /api/advocate/duty-status` - Toggle ON/OFF
- `GET /api/advocate/dashboard` - Get dashboard stats
- `GET /api/advocate/call-history` - Get call history

### Admin APIs (`/api/admin`)
- `GET /api/admin/advocates/pending` - Get pending verifications
- `PUT /api/admin/advocates/:id/verify` - Approve/reject advocate
- `GET /api/admin/advocates` - List all advocates
- `GET /api/admin/users` - List all users
- `GET /api/admin/calls` - Get all call logs
- `GET /api/admin/analytics` - Platform analytics

### Utility APIs (`/api/utils`)
- `GET /api/utils/cities` - Get Indian cities list
- `GET /api/utils/law-types` - Get law types
- `GET /api/utils/languages` - Get languages

## 🚦 Getting Started

### Prerequisites
All services are already running via supervisor:
```bash
sudo supervisorctl status
```

### Access the Portals

1. **Client Portal**: https://formulaw-legal.preview.emergentagent.com/client
2. **Advocate Portal**: https://formulaw-legal.preview.emergentagent.com/advocate
3. **Admin Portal**: https://formulaw-legal.preview.emergentagent.com/admin

### Default Admin Credentials
- **Email**: admin@formulaw.com
- **OTP**: Check backend logs (placeholder mode)

### Testing Flow

#### 1. Test Client Portal
```
1. Go to /client
2. Enter email → Send OTP
3. Check backend logs for OTP code
4. Verify OTP → Login successful
5. Browse advocates (will be empty initially)
```

#### 2. Test Advocate Registration
```
1. Go to /advocate/register
2. Fill all required fields:
   - Personal details
   - Bar Council ID
   - Languages & specializations
   - Location
   - Charges
3. Submit → "Verification pending" message
4. Check admin panel for approval
```

#### 3. Test Admin Verification
```
1. Go to /admin
2. Login with admin@formulaw.com
3. Navigate to Advocates → Pending tab
4. Review advocate details
5. Approve advocate
6. Advocate receives approval notification
```

#### 4. Test Full Call Flow
```
1. Admin approves advocate
2. Advocate logs in → Dashboard
3. Advocate toggles Duty ON
4. Client searches advocates → sees newly approved advocate
5. Client clicks "Call Now"
6. System checks wallet balance
7. If sufficient → Call initiated (Twilio placeholder)
8. After call → Client must rate
```

## 🔐 Integration Setup

### 1. Resend (Email OTP)
```bash
# Add to /app/backend/.env
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

Update in `server.py`:
```python
async def send_otp_email(email: str, otp_code: str):
    import resend
    resend.api_key = os.environ.get('RESEND_API_KEY')
    resend.Emails.send({
        "from": "noreply@formulaw.com",
        "to": email,
        "subject": "Your FormuLAW OTP",
        "html": f"<p>Your OTP is: <strong>{otp_code}</strong></p>"
    })
```

### 2. Twilio (Masked Calls)
```bash
# Add to /app/backend/.env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+91xxxxxxxxxx
```

Update in `server.py`:
```python
async def initiate_call(...):
    from twilio.rest import Client
    twilio_client = Client(
        os.environ['TWILIO_ACCOUNT_SID'],
        os.environ['TWILIO_AUTH_TOKEN']
    )
    call = twilio_client.calls.create(
        url='https://your-domain.com/api/webhooks/twilio/call-connect',
        to=advocate['phone_number'],
        from_=os.environ['TWILIO_PHONE_NUMBER']
    )
```

### 3. Razorpay (Payments)
```bash
# Add to /app/backend/.env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key
```

Update in `server.py`:
```python
async def topup_wallet(...):
    import razorpay
    client = razorpay.Client(auth=(
        os.environ['RAZORPAY_KEY_ID'],
        os.environ['RAZORPAY_KEY_SECRET']
    ))
    payment = client.payment.fetch(data.razorpay_payment_id)
    if payment['status'] == 'captured':
        # Update wallet
```

## 🎨 Design Theme

The platform uses Facebook's color scheme:
- **Primary Blue**: #1877f2 (Facebook blue)
- **Background**: #f0f2f5 (Light gray)
- **Cards**: White with shadows
- **Text**: Gray scale for hierarchy

## 📝 Key Features Implemented

### Call Flow (Rapido-style)
1. Client initiates call
2. System checks wallet balance
3. If insufficient → Redirect to wallet top-up
4. Twilio creates masked GSM call
5. Both parties see masked numbers
6. Real-time wallet deduction per minute
7. Auto-disconnect when wallet = 0
8. Mandatory rating after call completion

### Verification Workflow
1. Advocate registers with Bar Council ID
2. Status: "Pending verification"
3. Admin receives notification
4. Admin reviews details
5. Admin approves/rejects
6. Advocate receives email notification
7. Only approved advocates can go Duty ON

### Wallet System
- Each user and advocate has a wallet
- Top-up via Razorpay (PhonePe supported)
- Per-minute deduction during calls
- Transaction history
- Real-time balance updates

### FormuLAW ID (FID) System
- Unique identifier for each advocate
- Format: FID-IND-{6-digit number}
- Auto-generated at registration
- Displayed in:
  - Advocate dashboard
  - Client advocate listings
  - Admin panel
  - Call logs

## 🐛 Troubleshooting

### Backend not starting
```bash
tail -n 50 /var/log/supervisor/backend.err.log
sudo supervisorctl restart backend
```

### Frontend compilation errors
```bash
tail -n 50 /var/log/supervisor/frontend.err.log
cd /app/frontend && yarn install
sudo supervisorctl restart frontend
```

### MongoDB connection issues
```bash
sudo supervisorctl restart mongodb
mongo --eval "db.stats()"
```

### Check all services
```bash
sudo supervisorctl status
```

## 🔄 Restart Services
```bash
# Restart all
sudo supervisorctl restart all

# Restart individual services
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
```

## 📊 Platform Statistics

- **Law Types**: 15+ categories
- **Cities**: 46 major Indian cities
- **Languages**: 13 Indian languages
- **OTP Expiry**: 60 seconds
- **Working Hours Options**: Anytime, 9AM-10PM, 24/7

## 🎯 Next Steps

1. **Add Integration Keys**:
   - Resend for email OTP
   - Twilio for calls
   - Razorpay for payments

2. **Test Complete Flow**:
   - Register advocate
   - Admin verification
   - Client search
   - Call initiation
   - Rating system

3. **Production Deployment**:
   - Configure production domains
   - Add SSL certificates
   - Set up monitoring
   - Enable error tracking

## 📞 Support

For issues or questions:
- Check logs: `/var/log/supervisor/`
- Restart services: `sudo supervisorctl restart all`
- Review API responses in browser console

---

**Built with ❤️ using FastAPI, React, MongoDB, and modern web technologies**
