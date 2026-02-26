from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, BackgroundTasks, Request, Response
from fastapi.responses import JSONResponse, PlainTextResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
import httpx
import base64
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone, timedelta
import random
import string
import secrets
from passlib.context import CryptContext
import resend

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Resend configuration
resend.api_key = os.environ.get('RESEND_API_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')

# MSG91 Configuration
MSG91_WIDGET_ID = os.environ.get('MSG91_WIDGET_ID')
MSG91_AUTH_KEY = os.environ.get('MSG91_AUTH_KEY')
MSG91_BASE_URL = "https://api.msg91.com/api/v5/widget"

# Exotel Configuration
EXOTEL_API_KEY = os.environ.get('EXOTEL_API_KEY')
EXOTEL_API_TOKEN = os.environ.get('EXOTEL_API_TOKEN')
EXOTEL_ACCOUNT_SID = os.environ.get('EXOTEL_ACCOUNT_SID', 'formulaw1')
EXOTEL_SUBDOMAIN = os.environ.get('EXOTEL_SUBDOMAIN', 'api.exotel.com')
EXOTEL_EXOPHONE = os.environ.get('EXOTEL_EXOPHONE', '04041893878')
EXOTEL_APP_ID = os.environ.get('EXOTEL_APP_ID', '1191053')
PER_MINUTE_RATE = float(os.environ.get('PER_MINUTE_RATE', 10))

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ========== MODELS ==========

# OTP Model
class OTPCreate(BaseModel):
    email: EmailStr
    role: Literal["client", "advocate", "admin"]

class OTPVerify(BaseModel):
    email: EmailStr
    otp_code: str
    role: Literal["client", "advocate", "admin"]

class OTPDocument(BaseModel):
    email: str
    otp_code: str
    expires_at: datetime
    verified: bool = False
    role: str

# User Models
class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    city: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    name: Optional[str] = None
    city: Optional[str] = None
    created_at: datetime

# Advocate Models
class AdvocateRegister(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone_number: str
    bar_council_id: str
    bar_council_issue_years: int
    bar_council_issue_months: int
    languages: List[str]
    law_types: List[str]
    working_hours: Literal["anytime", "9am_10pm", "24_7"]
    area: str
    city: str
    state: str
    per_minute_charge: float

class AdvocateUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    languages: Optional[List[str]] = None
    law_types: Optional[List[str]] = None
    working_hours: Optional[str] = None
    area: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    per_minute_charge: Optional[float] = None

class AdvocateResponse(BaseModel):
    id: str
    fid: str
    email: str
    first_name: str
    last_name: str
    phone_number: str
    bar_council_id: str
    bar_council_issue_years: int
    bar_council_issue_months: int
    languages: List[str]
    law_types: List[str]
    working_hours: str
    area: str
    city: str
    state: str
    per_minute_charge: float
    verification_status: str
    duty_status: bool
    average_rating: float
    total_cases: int
    created_at: datetime

class DutyStatusUpdate(BaseModel):
    duty_status: bool

# Call Models
class CallInitiate(BaseModel):
    advocate_id: str

class CallResponse(BaseModel):
    id: str
    client_id: str
    advocate_id: str
    status: str
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration_minutes: Optional[float] = None
    cost_per_minute: float
    total_cost: Optional[float] = None
    rating: Optional[int] = None
    created_at: datetime

class CallRating(BaseModel):
    call_id: str
    rating: int  # 1-5

# Wallet Models
class WalletResponse(BaseModel):
    user_id: str
    balance: float
    currency: str = "INR"

class WalletTopup(BaseModel):
    amount: float
    razorpay_payment_id: Optional[str] = None

class TransactionResponse(BaseModel):
    type: str
    amount: float
    timestamp: datetime
    reference: Optional[str] = None

# Admin Models
class AdvocateVerification(BaseModel):
    status: Literal["approved", "rejected"]
    reason: Optional[str] = None

class AdminStats(BaseModel):
    total_users: int
    total_advocates: int
    pending_verifications: int
    total_calls: int
    total_revenue: float

# Auth Response
class AuthResponse(BaseModel):
    user: UserResponse
    token: str
    message: str

# MSG91 OTP Models
class MSG91SendOTP(BaseModel):
    identifier: str  # Phone number (91XXXXXXXXXX) or email
    channel: Optional[str] = None  # sms, email, whatsapp, voice

class MSG91VerifyOTP(BaseModel):
    req_id: str
    otp: str

class MSG91Response(BaseModel):
    success: bool
    req_id: Optional[str] = None
    message: str

# Exotel Call Models
class ExotelCallInitiate(BaseModel):
    advocate_id: str
    client_phone: str

class ExotelCallStatus(BaseModel):
    call_sid: str
    status: str
    duration: Optional[int] = None
    cost: Optional[float] = None

# ========== HELPER FUNCTIONS ==========

async def generate_fid():
    """Generate unique FormuLAW ID"""
    # Get the highest FID number
    last_advocate = await db.advocates.find_one(
        sort=[("fid_number", -1)]
    )
    
    if last_advocate and "fid_number" in last_advocate:
        next_number = last_advocate["fid_number"] + 1
    else:
        next_number = 1
    
    fid = f"FID-IND-{str(next_number).zfill(6)}"
    return fid, next_number

def generate_otp():
    """Generate 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))

def generate_token():
    """Generate secure token"""
    return secrets.token_urlsafe(32)

async def send_otp_email(email: str, otp_code: str):
    """Send OTP via email using Resend"""
    try:
        params = {
            "from": SENDER_EMAIL,
            "to": [email],
            "subject": "Your FormuLAW Verification Code",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #92400e; margin: 0;">FormuLAW</h1>
                    <p style="color: #a78bfa; font-size: 14px;">Say it • Seek it • Sorted</p>
                </div>
                <div style="background: #fef3c7; border-radius: 10px; padding: 30px; text-align: center;">
                    <h2 style="color: #78350f; margin-bottom: 20px;">Your Verification Code</h2>
                    <div style="background: #ffffff; border-radius: 8px; padding: 20px; display: inline-block;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #92400e;">{otp_code}</span>
                    </div>
                    <p style="color: #78350f; margin-top: 20px; font-size: 14px;">
                        This code expires in <strong>60 seconds</strong>
                    </p>
                </div>
                <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 30px;">
                    If you didn't request this code, please ignore this email.<br>
                    © 2026 FormuLAW - Legal Consultation Platform
                </p>
            </div>
            """
        }
        # Run sync SDK in thread to keep FastAPI non-blocking
        email_response = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"OTP email sent to {email}, ID: {email_response.get('id')}")
        return True
    except Exception as e:
        logger.error(f"Failed to send OTP email to {email}: {str(e)}")
        # Return True anyway so flow continues - user can request resend
        return True

async def send_approval_email(email: str, advocate_name: str):
    """Send advocate approval email using Resend"""
    try:
        params = {
            "from": SENDER_EMAIL,
            "to": [email],
            "subject": "Your FormuLAW Advocate Account is Approved!",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #92400e; margin: 0;">FormuLAW</h1>
                    <p style="color: #a78bfa; font-size: 14px;">Say it • Seek it • Sorted</p>
                </div>
                <div style="background: #d1fae5; border-radius: 10px; padding: 30px;">
                    <h2 style="color: #065f46; margin-bottom: 20px;">Congratulations, {advocate_name}!</h2>
                    <p style="color: #047857; font-size: 16px;">
                        Your Bar Council ID has been verified and your advocate account is now <strong>APPROVED</strong>.
                    </p>
                    <p style="color: #047857; font-size: 14px; margin-top: 20px;">
                        You can now:
                    </p>
                    <ul style="color: #047857; font-size: 14px;">
                        <li>Toggle your duty status to go online</li>
                        <li>Receive consultation calls from clients</li>
                        <li>Earn money for your legal expertise</li>
                    </ul>
                </div>
                <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 30px;">
                    © 2026 FormuLAW - Legal Consultation Platform
                </p>
            </div>
            """
        }
        email_response = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Approval email sent to {email}, ID: {email_response.get('id')}")
        return True
    except Exception as e:
        logger.error(f"Failed to send approval email to {email}: {str(e)}")
        return True

# ========== MSG91 HELPER FUNCTIONS ==========

async def msg91_send_otp(identifier: str, channel: Optional[str] = None):
    """Send OTP via MSG91 Widget API"""
    try:
        async with httpx.AsyncClient() as client:
            payload = {
                "widgetId": MSG91_WIDGET_ID,
                "identifier": identifier
            }
            if channel:
                payload["channel"] = channel
            
            headers = {
                "authkey": MSG91_AUTH_KEY,
                "Content-Type": "application/json"
            }
            
            response = await client.post(
                f"{MSG91_BASE_URL}/sendOtp",
                json=payload,
                headers=headers,
                timeout=30.0
            )
            
            logger.info(f"MSG91 sendOtp response: {response.status_code} - {response.text}")
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "req_id": data.get("reqId"),
                    "message": "OTP sent successfully"
                }
            else:
                return {
                    "success": False,
                    "req_id": None,
                    "message": response.json().get("message", "Failed to send OTP")
                }
    except Exception as e:
        logger.error(f"MSG91 sendOtp error: {str(e)}")
        return {"success": False, "req_id": None, "message": str(e)}

async def msg91_verify_otp(req_id: str, otp: str):
    """Verify OTP via MSG91 Widget API"""
    try:
        async with httpx.AsyncClient() as client:
            payload = {
                "widgetId": MSG91_WIDGET_ID,
                "reqId": req_id,
                "otp": otp
            }
            
            headers = {
                "authkey": MSG91_AUTH_KEY,
                "Content-Type": "application/json"
            }
            
            response = await client.post(
                f"{MSG91_BASE_URL}/verifyOtp",
                json=payload,
                headers=headers,
                timeout=30.0
            )
            
            logger.info(f"MSG91 verifyOtp response: {response.status_code} - {response.text}")
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "access_token": data.get("accessToken"),
                    "message": "OTP verified successfully"
                }
            else:
                return {
                    "success": False,
                    "access_token": None,
                    "message": "Invalid OTP"
                }
    except Exception as e:
        logger.error(f"MSG91 verifyOtp error: {str(e)}")
        return {"success": False, "access_token": None, "message": str(e)}

async def msg91_retry_otp(req_id: str, channel: Optional[str] = None):
    """Retry OTP on different channel"""
    try:
        async with httpx.AsyncClient() as client:
            payload = {
                "widgetId": MSG91_WIDGET_ID,
                "reqId": req_id
            }
            if channel:
                payload["retryChannel"] = channel
            
            headers = {
                "authkey": MSG91_AUTH_KEY,
                "Content-Type": "application/json"
            }
            
            response = await client.post(
                f"{MSG91_BASE_URL}/retryOtp",
                json=payload,
                headers=headers,
                timeout=30.0
            )
            
            return response.json()
    except Exception as e:
        logger.error(f"MSG91 retryOtp error: {str(e)}")
        return {"success": False, "message": str(e)}

# ========== EXOTEL HELPER FUNCTIONS ==========

def get_exotel_auth():
    """Get Exotel Basic Auth header"""
    credentials = f"{EXOTEL_API_KEY}:{EXOTEL_API_TOKEN}"
    encoded = base64.b64encode(credentials.encode()).decode()
    return f"Basic {encoded}"

async def exotel_initiate_call(from_number: str, to_number: str, call_id: str):
    """
    Initiate a masked call via Exotel
    from_number: Client's phone (caller)
    to_number: Advocate's phone (callee)
    """
    try:
        # Clean phone numbers (remove +91 or 0 prefix)
        from_clean = from_number.replace("+91", "").replace(" ", "").lstrip("0")
        to_clean = to_number.replace("+91", "").replace(" ", "").lstrip("0")
        
        async with httpx.AsyncClient() as client:
            # Exotel Connect API URL
            url = f"https://api.exotel.com/v1/Accounts/{EXOTEL_ACCOUNT_SID}/Calls/connect.json"
            
            payload = {
                "From": from_clean,
                "To": to_clean,
                "CallerId": EXOTEL_EXOPHONE,
                "CallType": "trans",
                "StatusCallback": f"{os.environ.get('REACT_APP_BACKEND_URL', '')}/api/webhooks/exotel/status",
                "StatusCallbackEvents[]": ["terminal"],
                "CustomField": call_id  # Store our call ID for reference
            }
            
            headers = {
                "Authorization": get_exotel_auth(),
                "Content-Type": "application/x-www-form-urlencoded"
            }
            
            response = await client.post(url, data=payload, headers=headers, timeout=30.0)
            
            logger.info(f"Exotel call initiate response: {response.status_code} - {response.text}")
            
            if response.status_code in [200, 201]:
                data = response.json()
                call_data = data.get("Call", {})
                return {
                    "success": True,
                    "exotel_call_sid": call_data.get("Sid"),
                    "status": call_data.get("Status"),
                    "message": "Call initiated successfully"
                }
            else:
                return {
                    "success": False,
                    "exotel_call_sid": None,
                    "status": "failed",
                    "message": f"Failed to initiate call: {response.text}"
                }
    except Exception as e:
        logger.error(f"Exotel call error: {str(e)}")
        return {"success": False, "exotel_call_sid": None, "status": "error", "message": str(e)}

async def get_current_user(authorization: Optional[str] = Header(None)):
    """Get current authenticated user from token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    
    # Find user by token
    user = await db.users.find_one({"token": token}, {"_id": 0})
    if user:
        return user
    
    advocate = await db.advocates.find_one({"token": token}, {"_id": 0})
    if advocate:
        return advocate
    
    admin = await db.admins.find_one({"token": token}, {"_id": 0})
    if admin:
        return admin
    
    raise HTTPException(status_code=401, detail="Invalid token")

async def require_role(user: dict, allowed_roles: List[str]):
    """Check if user has required role"""
    if user.get("role") not in allowed_roles:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    return user

# ========== AUTH ENDPOINTS ==========

@api_router.post("/auth/send-otp")
async def send_otp(data: OTPCreate):
    """Send OTP to email"""
    try:
        # Generate OTP
        otp_code = generate_otp()
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=1)
        
        # Save OTP to database
        otp_doc = {
            "email": data.email,
            "otp_code": otp_code,
            "expires_at": expires_at.isoformat(),
            "verified": False,
            "role": data.role
        }
        
        # Delete old OTPs for this email
        await db.otps.delete_many({"email": data.email})
        
        # Insert new OTP
        await db.otps.insert_one(otp_doc)
        
        # Send email
        await send_otp_email(data.email, otp_code)
        
        return {"message": "OTP sent successfully", "expires_in": 60}
    
    except Exception as e:
        logger.error(f"Error sending OTP: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send OTP")

@api_router.post("/auth/verify-otp", response_model=AuthResponse)
async def verify_otp(data: OTPVerify):
    """Verify OTP and login"""
    try:
        # Find OTP
        otp_doc = await db.otps.find_one({
            "email": data.email,
            "otp_code": data.otp_code,
            "role": data.role,
            "verified": False
        })
        
        if not otp_doc:
            raise HTTPException(status_code=400, detail="Invalid OTP")
        
        # Check expiry
        expires_at = datetime.fromisoformat(otp_doc["expires_at"])
        if datetime.now(timezone.utc) > expires_at:
            raise HTTPException(status_code=400, detail="OTP expired")
        
        # Mark OTP as verified
        await db.otps.update_one(
            {"email": data.email, "otp_code": data.otp_code},
            {"$set": {"verified": True}}
        )
        
        # Generate token
        token = generate_token()
        
        # Find or create user based on role
        if data.role == "client":
            user = await db.users.find_one({"email": data.email}, {"_id": 0})
            if not user:
                # Create new user
                user_id = str(uuid.uuid4())
                user = {
                    "id": user_id,
                    "email": data.email,
                    "role": "client",
                    "name": None,
                    "city": None,
                    "token": token,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "last_login": datetime.now(timezone.utc).isoformat()
                }
                await db.users.insert_one(user)
                
                # Create wallet
                wallet = {
                    "user_id": user_id,
                    "balance": 0.0,
                    "currency": "INR",
                    "transactions": []
                }
                await db.wallets.insert_one(wallet)
            else:
                # Update token and last login
                await db.users.update_one(
                    {"email": data.email},
                    {"$set": {"token": token, "last_login": datetime.now(timezone.utc).isoformat()}}
                )
                user["token"] = token
        
        elif data.role == "advocate":
            advocate = await db.advocates.find_one({"email": data.email}, {"_id": 0})
            if not advocate:
                raise HTTPException(status_code=404, detail="Advocate not registered. Please register first.")
            
            # Update token
            await db.advocates.update_one(
                {"email": data.email},
                {"$set": {"token": token, "last_login": datetime.now(timezone.utc).isoformat()}}
            )
            advocate["token"] = token
            user = advocate
        
        elif data.role == "admin":
            admin = await db.admins.find_one({"email": data.email}, {"_id": 0})
            if not admin:
                raise HTTPException(status_code=403, detail="Admin account not found")
            
            # Update token
            await db.admins.update_one(
                {"email": data.email},
                {"$set": {"token": token, "last_login": datetime.now(timezone.utc).isoformat()}}
            )
            admin["token"] = token
            user = admin
        
        # Format response
        user_response = UserResponse(
            id=user["id"],
            email=user["email"],
            role=user["role"],
            name=user.get("name") or user.get("first_name"),
            city=user.get("city"),
            created_at=datetime.fromisoformat(user["created_at"])
        )
        
        return AuthResponse(
            user=user_response,
            token=token,
            message="Login successful"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying OTP: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to verify OTP")

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        role=current_user["role"],
        name=current_user.get("name") or current_user.get("first_name"),
        city=current_user.get("city"),
        created_at=datetime.fromisoformat(current_user["created_at"])
    )

# ========== CLIENT ENDPOINTS ==========

@api_router.get("/client/advocates", response_model=List[AdvocateResponse])
async def get_advocates(
    law_type: Optional[str] = None,
    city: Optional[str] = None,
    language: Optional[str] = None,
    sort_by: Optional[str] = "newest",
    current_user: dict = Depends(get_current_user)
):
    """Get list of advocates with filters"""
    await require_role(current_user, ["client"])
    
    # Build filter query
    query = {
        "verification_status": "approved",
        "duty_status": True
    }
    
    if law_type:
        query["law_types"] = law_type
    
    if city:
        query["city"] = city
    
    if language:
        query["languages"] = language
    
    # Build sort
    sort_options = {
        "newest": [("created_at", -1)],
        "rating": [("average_rating", -1)],
        "price_low": [("per_minute_charge", 1)],
        "price_high": [("per_minute_charge", -1)]
    }
    sort = sort_options.get(sort_by, [("created_at", -1)])
    
    advocates = await db.advocates.find(query, {"_id": 0}).sort(sort).to_list(100)
    
    result = []
    for adv in advocates:
        result.append(AdvocateResponse(
            id=adv["id"],
            fid=adv["fid"],
            email=adv["email"],
            first_name=adv["first_name"],
            last_name=adv["last_name"],
            phone_number=adv["phone_number"],
            bar_council_id=adv["bar_council_id"],
            bar_council_issue_years=adv["bar_council_issue_years"],
            bar_council_issue_months=adv["bar_council_issue_months"],
            languages=adv["languages"],
            law_types=adv["law_types"],
            working_hours=adv["working_hours"],
            area=adv["area"],
            city=adv["city"],
            state=adv["state"],
            per_minute_charge=adv["per_minute_charge"],
            verification_status=adv["verification_status"],
            duty_status=adv["duty_status"],
            average_rating=adv["average_rating"],
            total_cases=adv["total_cases"],
            created_at=datetime.fromisoformat(adv["created_at"])
        ))
    
    return result

@api_router.get("/client/advocate/{advocate_id}", response_model=AdvocateResponse)
async def get_advocate(advocate_id: str, current_user: dict = Depends(get_current_user)):
    """Get advocate details"""
    await require_role(current_user, ["client"])
    
    advocate = await db.advocates.find_one({"id": advocate_id}, {"_id": 0})
    if not advocate:
        raise HTTPException(status_code=404, detail="Advocate not found")
    
    return AdvocateResponse(
        id=advocate["id"],
        fid=advocate["fid"],
        email=advocate["email"],
        first_name=advocate["first_name"],
        last_name=advocate["last_name"],
        phone_number=advocate["phone_number"],
        bar_council_id=advocate["bar_council_id"],
        bar_council_issue_years=advocate["bar_council_issue_years"],
        bar_council_issue_months=advocate["bar_council_issue_months"],
        languages=advocate["languages"],
        law_types=advocate["law_types"],
        working_hours=advocate["working_hours"],
        area=advocate["area"],
        city=advocate["city"],
        state=advocate["state"],
        per_minute_charge=advocate["per_minute_charge"],
        verification_status=advocate["verification_status"],
        duty_status=advocate["duty_status"],
        average_rating=advocate["average_rating"],
        total_cases=advocate["total_cases"],
        created_at=datetime.fromisoformat(advocate["created_at"])
    )

@api_router.post("/client/initiate-call")
async def initiate_call(data: CallInitiate, current_user: dict = Depends(get_current_user)):
    """Initiate masked call to advocate"""
    await require_role(current_user, ["client"])
    
    # Get advocate
    advocate = await db.advocates.find_one({"id": data.advocate_id}, {"_id": 0})
    if not advocate:
        raise HTTPException(status_code=404, detail="Advocate not found")
    
    if not advocate["duty_status"]:
        raise HTTPException(status_code=400, detail="Advocate is currently offline")
    
    # Check wallet balance
    wallet = await db.wallets.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not wallet or wallet["balance"] < advocate["per_minute_charge"]:
        raise HTTPException(
            status_code=400,
            detail="Insufficient wallet balance. Please add money to your wallet."
        )
    
    # Create call record
    call_id = str(uuid.uuid4())
    call = {
        "id": call_id,
        "client_id": current_user["id"],
        "advocate_id": data.advocate_id,
        "twilio_call_sid": None,
        "status": "initiated",
        "start_time": None,
        "end_time": None,
        "duration_minutes": None,
        "cost_per_minute": advocate["per_minute_charge"],
        "total_cost": None,
        "masked_number": None,
        "rating": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.calls.insert_one(call)
    
    # TODO: Initiate Twilio call
    logger.info(f"[PLACEHOLDER] Initiating Twilio call for call_id: {call_id}")
    # In production:
    # from twilio.rest import Client
    # twilio_client = Client(os.environ['TWILIO_ACCOUNT_SID'], os.environ['TWILIO_AUTH_TOKEN'])
    # call = twilio_client.calls.create(
    #     url='http://your-domain.com/api/webhooks/twilio/call-connect',
    #     to=advocate['phone_number'],
    #     from_=os.environ['TWILIO_PHONE_NUMBER']
    # )
    
    return {
        "message": "Call initiated successfully",
        "call_id": call_id,
        "advocate_name": f"{advocate['first_name']} {advocate['last_name']}",
        "cost_per_minute": advocate["per_minute_charge"]
    }

@api_router.get("/client/call-history", response_model=List[CallResponse])
async def get_call_history(current_user: dict = Depends(get_current_user)):
    """Get client call history"""
    await require_role(current_user, ["client"])
    
    calls = await db.calls.find(
        {"client_id": current_user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    result = []
    for call in calls:
        result.append(CallResponse(
            id=call["id"],
            client_id=call["client_id"],
            advocate_id=call["advocate_id"],
            status=call["status"],
            start_time=datetime.fromisoformat(call["start_time"]) if call.get("start_time") else None,
            end_time=datetime.fromisoformat(call["end_time"]) if call.get("end_time") else None,
            duration_minutes=call.get("duration_minutes"),
            cost_per_minute=call["cost_per_minute"],
            total_cost=call.get("total_cost"),
            rating=call.get("rating"),
            created_at=datetime.fromisoformat(call["created_at"])
        ))
    
    return result

@api_router.post("/client/rate-call")
async def rate_call(data: CallRating, current_user: dict = Depends(get_current_user)):
    """Rate a completed call"""
    await require_role(current_user, ["client"])
    
    if data.rating < 1 or data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    # Get call
    call = await db.calls.find_one({"id": data.call_id, "client_id": current_user["id"]}, {"_id": 0})
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    
    if call["status"] != "completed":
        raise HTTPException(status_code=400, detail="Can only rate completed calls")
    
    if call.get("rating") is not None:
        raise HTTPException(status_code=400, detail="Call already rated")
    
    # Update call rating
    await db.calls.update_one(
        {"id": data.call_id},
        {"$set": {"rating": data.rating}}
    )
    
    # Update advocate average rating
    advocate_calls = await db.calls.find(
        {"advocate_id": call["advocate_id"], "rating": {"$ne": None}},
        {"_id": 0, "rating": 1}
    ).to_list(1000)
    
    total_rating = sum([c.get("rating", 0) for c in advocate_calls]) + data.rating
    avg_rating = total_rating / (len(advocate_calls) + 1)
    
    await db.advocates.update_one(
        {"id": call["advocate_id"]},
        {"$set": {"average_rating": round(avg_rating, 2)}}
    )
    
    return {"message": "Rating submitted successfully"}

@api_router.get("/client/wallet", response_model=WalletResponse)
async def get_wallet(current_user: dict = Depends(get_current_user)):
    """Get wallet balance"""
    await require_role(current_user, ["client"])
    
    wallet = await db.wallets.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    return WalletResponse(
        user_id=wallet["user_id"],
        balance=wallet["balance"],
        currency=wallet["currency"]
    )

@api_router.post("/client/wallet/topup")
async def topup_wallet(data: WalletTopup, current_user: dict = Depends(get_current_user)):
    """Add money to wallet"""
    await require_role(current_user, ["client"])
    
    if data.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    
    # TODO: Verify Razorpay payment
    logger.info(f"[PLACEHOLDER] Verifying Razorpay payment: {data.razorpay_payment_id}")
    # In production:
    # import razorpay
    # client = razorpay.Client(auth=(os.environ['RAZORPAY_KEY_ID'], os.environ['RAZORPAY_KEY_SECRET']))
    # payment = client.payment.fetch(data.razorpay_payment_id)
    # if payment['status'] != 'captured':
    #     raise HTTPException(status_code=400, detail="Payment not successful")
    
    # Update wallet
    wallet = await db.wallets.find_one({"user_id": current_user["id"]}, {"_id": 0})
    new_balance = wallet["balance"] + data.amount
    
    transaction = {
        "type": "credit",
        "amount": data.amount,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "reference": data.razorpay_payment_id
    }
    
    await db.wallets.update_one(
        {"user_id": current_user["id"]},
        {
            "$set": {"balance": new_balance},
            "$push": {"transactions": transaction}
        }
    )
    
    return {
        "message": "Wallet topped up successfully",
        "new_balance": new_balance
    }

@api_router.get("/client/wallet/transactions", response_model=List[TransactionResponse])
async def get_transactions(current_user: dict = Depends(get_current_user)):
    """Get wallet transaction history"""
    await require_role(current_user, ["client"])
    
    wallet = await db.wallets.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    transactions = wallet.get("transactions", [])
    result = []
    for txn in transactions:
        result.append(TransactionResponse(
            type=txn["type"],
            amount=txn["amount"],
            timestamp=datetime.fromisoformat(txn["timestamp"]),
            reference=txn.get("reference")
        ))
    
    return result

# ========== ADVOCATE ENDPOINTS ==========

@api_router.post("/advocate/register")
async def register_advocate(data: AdvocateRegister):
    """Register new advocate"""
    # Check if advocate already exists
    existing = await db.advocates.find_one({"email": data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Advocate already registered")
    
    # Generate FID
    fid, fid_number = await generate_fid()
    
    # Create advocate
    advocate_id = str(uuid.uuid4())
    advocate = {
        "id": advocate_id,
        "fid": fid,
        "fid_number": fid_number,
        "email": data.email,
        "role": "advocate",
        "first_name": data.first_name,
        "last_name": data.last_name,
        "phone_number": data.phone_number,
        "bar_council_id": data.bar_council_id,
        "bar_council_issue_years": data.bar_council_issue_years,
        "bar_council_issue_months": data.bar_council_issue_months,
        "languages": data.languages,
        "law_types": data.law_types,
        "working_hours": data.working_hours,
        "area": data.area,
        "city": data.city,
        "state": data.state,
        "per_minute_charge": data.per_minute_charge,
        "verification_status": "pending",
        "duty_status": False,
        "average_rating": 0.0,
        "total_cases": 0,
        "token": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_login": None
    }
    
    await db.advocates.insert_one(advocate)
    
    # Create wallet for advocate
    wallet = {
        "user_id": advocate_id,
        "balance": 0.0,
        "currency": "INR",
        "transactions": []
    }
    await db.wallets.insert_one(wallet)
    
    return {
        "message": "Registration successful. Your Bar Council ID verification is in progress. This may take up to 24 hours.",
        "fid": fid,
        "verification_status": "pending"
    }

@api_router.get("/advocate/profile", response_model=AdvocateResponse)
async def get_advocate_profile(current_user: dict = Depends(get_current_user)):
    """Get advocate profile"""
    await require_role(current_user, ["advocate"])
    
    return AdvocateResponse(
        id=current_user["id"],
        fid=current_user["fid"],
        email=current_user["email"],
        first_name=current_user["first_name"],
        last_name=current_user["last_name"],
        phone_number=current_user["phone_number"],
        bar_council_id=current_user["bar_council_id"],
        bar_council_issue_years=current_user["bar_council_issue_years"],
        bar_council_issue_months=current_user["bar_council_issue_months"],
        languages=current_user["languages"],
        law_types=current_user["law_types"],
        working_hours=current_user["working_hours"],
        area=current_user["area"],
        city=current_user["city"],
        state=current_user["state"],
        per_minute_charge=current_user["per_minute_charge"],
        verification_status=current_user["verification_status"],
        duty_status=current_user["duty_status"],
        average_rating=current_user["average_rating"],
        total_cases=current_user["total_cases"],
        created_at=datetime.fromisoformat(current_user["created_at"])
    )

@api_router.put("/advocate/profile")
async def update_advocate_profile(data: AdvocateUpdate, current_user: dict = Depends(get_current_user)):
    """Update advocate profile"""
    await require_role(current_user, ["advocate"])
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    
    if update_data:
        await db.advocates.update_one(
            {"id": current_user["id"]},
            {"$set": update_data}
        )
    
    return {"message": "Profile updated successfully"}

@api_router.patch("/advocate/duty-status")
async def update_duty_status(data: DutyStatusUpdate, current_user: dict = Depends(get_current_user)):
    """Toggle duty ON/OFF"""
    await require_role(current_user, ["advocate"])
    
    if current_user["verification_status"] != "approved":
        raise HTTPException(status_code=403, detail="Cannot go online. Your account is not verified yet.")
    
    await db.advocates.update_one(
        {"id": current_user["id"]},
        {"$set": {"duty_status": data.duty_status}}
    )
    
    status_text = "online" if data.duty_status else "offline"
    return {"message": f"Duty status updated to {status_text}"}

@api_router.get("/advocate/dashboard")
async def get_advocate_dashboard(current_user: dict = Depends(get_current_user)):
    """Get advocate dashboard stats"""
    await require_role(current_user, ["advocate"])
    
    # Get total earnings
    calls = await db.calls.find(
        {"advocate_id": current_user["id"], "status": "completed"},
        {"_id": 0, "total_cost": 1}
    ).to_list(1000)
    
    total_earnings = sum([c.get("total_cost", 0) for c in calls])
    total_cases = len(calls)
    
    # Get wallet
    wallet = await db.wallets.find_one({"user_id": current_user["id"]}, {"_id": 0})
    
    return {
        "fid": current_user["fid"],
        "verification_status": current_user["verification_status"],
        "duty_status": current_user["duty_status"],
        "average_rating": current_user["average_rating"],
        "total_cases": total_cases,
        "total_earnings": total_earnings,
        "wallet_balance": wallet["balance"] if wallet else 0.0
    }

@api_router.get("/advocate/call-history", response_model=List[CallResponse])
async def get_advocate_call_history(current_user: dict = Depends(get_current_user)):
    """Get advocate call history"""
    await require_role(current_user, ["advocate"])
    
    calls = await db.calls.find(
        {"advocate_id": current_user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    result = []
    for call in calls:
        result.append(CallResponse(
            id=call["id"],
            client_id=call["client_id"],
            advocate_id=call["advocate_id"],
            status=call["status"],
            start_time=datetime.fromisoformat(call["start_time"]) if call.get("start_time") else None,
            end_time=datetime.fromisoformat(call["end_time"]) if call.get("end_time") else None,
            duration_minutes=call.get("duration_minutes"),
            cost_per_minute=call["cost_per_minute"],
            total_cost=call.get("total_cost"),
            rating=call.get("rating"),
            created_at=datetime.fromisoformat(call["created_at"])
        ))
    
    return result

# ========== ADMIN ENDPOINTS ==========

@api_router.get("/admin/advocates/pending", response_model=List[AdvocateResponse])
async def get_pending_advocates(current_user: dict = Depends(get_current_user)):
    """Get pending advocate verifications"""
    await require_role(current_user, ["admin"])
    
    advocates = await db.advocates.find(
        {"verification_status": "pending"},
        {"_id": 0}
    ).sort("created_at", 1).to_list(100)
    
    result = []
    for adv in advocates:
        result.append(AdvocateResponse(
            id=adv["id"],
            fid=adv["fid"],
            email=adv["email"],
            first_name=adv["first_name"],
            last_name=adv["last_name"],
            phone_number=adv["phone_number"],
            bar_council_id=adv["bar_council_id"],
            bar_council_issue_years=adv["bar_council_issue_years"],
            bar_council_issue_months=adv["bar_council_issue_months"],
            languages=adv["languages"],
            law_types=adv["law_types"],
            working_hours=adv["working_hours"],
            area=adv["area"],
            city=adv["city"],
            state=adv["state"],
            per_minute_charge=adv["per_minute_charge"],
            verification_status=adv["verification_status"],
            duty_status=adv["duty_status"],
            average_rating=adv["average_rating"],
            total_cases=adv["total_cases"],
            created_at=datetime.fromisoformat(adv["created_at"])
        ))
    
    return result

@api_router.put("/admin/advocates/{advocate_id}/verify")
async def verify_advocate(
    advocate_id: str,
    data: AdvocateVerification,
    current_user: dict = Depends(get_current_user)
):
    """Approve or reject advocate"""
    await require_role(current_user, ["admin"])
    
    advocate = await db.advocates.find_one({"id": advocate_id}, {"_id": 0})
    if not advocate:
        raise HTTPException(status_code=404, detail="Advocate not found")
    
    await db.advocates.update_one(
        {"id": advocate_id},
        {"$set": {"verification_status": data.status}}
    )
    
    # Send email notification
    if data.status == "approved":
        await send_approval_email(
            advocate["email"],
            f"{advocate['first_name']} {advocate['last_name']}"
        )
    
    return {"message": f"Advocate {data.status} successfully"}

@api_router.get("/admin/advocates", response_model=List[AdvocateResponse])
async def get_all_advocates(current_user: dict = Depends(get_current_user)):
    """Get all advocates"""
    await require_role(current_user, ["admin"])
    
    advocates = await db.advocates.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    result = []
    for adv in advocates:
        result.append(AdvocateResponse(
            id=adv["id"],
            fid=adv["fid"],
            email=adv["email"],
            first_name=adv["first_name"],
            last_name=adv["last_name"],
            phone_number=adv["phone_number"],
            bar_council_id=adv["bar_council_id"],
            bar_council_issue_years=adv["bar_council_issue_years"],
            bar_council_issue_months=adv["bar_council_issue_months"],
            languages=adv["languages"],
            law_types=adv["law_types"],
            working_hours=adv["working_hours"],
            area=adv["area"],
            city=adv["city"],
            state=adv["state"],
            per_minute_charge=adv["per_minute_charge"],
            verification_status=adv["verification_status"],
            duty_status=adv["duty_status"],
            average_rating=adv["average_rating"],
            total_cases=adv["total_cases"],
            created_at=datetime.fromisoformat(adv["created_at"])
        ))
    
    return result

@api_router.get("/admin/users", response_model=List[UserResponse])
async def get_all_users(current_user: dict = Depends(get_current_user)):
    """Get all users"""
    await require_role(current_user, ["admin"])
    
    users = await db.users.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    result = []
    for user in users:
        result.append(UserResponse(
            id=user["id"],
            email=user["email"],
            role=user["role"],
            name=user.get("name"),
            city=user.get("city"),
            created_at=datetime.fromisoformat(user["created_at"])
        ))
    
    return result

@api_router.get("/admin/calls", response_model=List[CallResponse])
async def get_all_calls(current_user: dict = Depends(get_current_user)):
    """Get all call logs"""
    await require_role(current_user, ["admin"])
    
    calls = await db.calls.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    result = []
    for call in calls:
        result.append(CallResponse(
            id=call["id"],
            client_id=call["client_id"],
            advocate_id=call["advocate_id"],
            status=call["status"],
            start_time=datetime.fromisoformat(call["start_time"]) if call.get("start_time") else None,
            end_time=datetime.fromisoformat(call["end_time"]) if call.get("end_time") else None,
            duration_minutes=call.get("duration_minutes"),
            cost_per_minute=call["cost_per_minute"],
            total_cost=call.get("total_cost"),
            rating=call.get("rating"),
            created_at=datetime.fromisoformat(call["created_at"])
        ))
    
    return result

@api_router.get("/admin/analytics", response_model=AdminStats)
async def get_admin_analytics(current_user: dict = Depends(get_current_user)):
    """Get platform analytics"""
    await require_role(current_user, ["admin"])
    
    total_users = await db.users.count_documents({})
    total_advocates = await db.advocates.count_documents({})
    pending_verifications = await db.advocates.count_documents({"verification_status": "pending"})
    total_calls = await db.calls.count_documents({})
    
    # Calculate total revenue
    calls = await db.calls.find({"status": "completed"}, {"_id": 0, "total_cost": 1}).to_list(10000)
    total_revenue = sum([c.get("total_cost", 0) for c in calls])
    
    return AdminStats(
        total_users=total_users,
        total_advocates=total_advocates,
        pending_verifications=pending_verifications,
        total_calls=total_calls,
        total_revenue=total_revenue
    )

# ========== WEBHOOK ENDPOINTS ==========

@api_router.post("/webhooks/twilio/call-status")
async def twilio_call_status(request: dict):
    """Handle Twilio call status webhooks"""
    # TODO: Implement Twilio webhook handling
    logger.info(f"[PLACEHOLDER] Twilio webhook received: {request}")
    return {"message": "Webhook received"}

@api_router.post("/webhooks/razorpay")
async def razorpay_webhook(request: dict):
    """Handle Razorpay payment webhooks"""
    # TODO: Implement Razorpay webhook handling
    logger.info(f"[PLACEHOLDER] Razorpay webhook received: {request}")
    return {"message": "Webhook received"}

# ========== MSG91 OTP ENDPOINTS ==========

@api_router.post("/msg91/send-otp")
async def msg91_send_otp_endpoint(data: MSG91SendOTP):
    """
    Send OTP via MSG91
    
    identifier: Phone (91XXXXXXXXXX) or email address
    channel: sms, email, whatsapp, voice (optional)
    """
    result = await msg91_send_otp(data.identifier, data.channel)
    
    if result["success"]:
        # Store the req_id in database for verification
        await db.msg91_otps.insert_one({
            "req_id": result["req_id"],
            "identifier": data.identifier,
            "created_at": datetime.now(timezone.utc),
            "verified": False
        })
        return result
    else:
        raise HTTPException(status_code=400, detail=result["message"])

@api_router.post("/msg91/verify-otp")
async def msg91_verify_otp_endpoint(data: MSG91VerifyOTP):
    """
    Verify OTP via MSG91
    
    req_id: Request ID from send-otp response
    otp: OTP entered by user
    """
    result = await msg91_verify_otp(data.req_id, data.otp)
    
    if result["success"]:
        # Mark as verified
        await db.msg91_otps.update_one(
            {"req_id": data.req_id},
            {"$set": {"verified": True, "verified_at": datetime.now(timezone.utc)}}
        )
        return result
    else:
        raise HTTPException(status_code=400, detail=result["message"])

@api_router.post("/msg91/retry-otp")
async def msg91_retry_otp_endpoint(req_id: str, channel: Optional[str] = None):
    """
    Retry OTP on different channel
    
    req_id: Request ID from send-otp response
    channel: sms, email, whatsapp, voice
    """
    result = await msg91_retry_otp(req_id, channel)
    return result

@api_router.post("/webhooks/msg91/otp-verified")
async def msg91_otp_webhook(request: Request):
    """
    MSG91 OTP Verification Webhook
    
    Configure this URL in MSG91 dashboard:
    {BACKEND_URL}/api/webhooks/msg91/otp-verified
    """
    try:
        data = await request.json()
        logger.info(f"MSG91 OTP webhook received: {data}")
        
        req_id = data.get("reqId")
        status = data.get("status")
        identifier = data.get("identifier")
        
        if status == "verified":
            # Update in database
            await db.msg91_otps.update_one(
                {"req_id": req_id},
                {"$set": {"verified": True, "verified_at": datetime.now(timezone.utc)}}
            )
        
        return {"message": "Webhook processed"}
    except Exception as e:
        logger.error(f"MSG91 webhook error: {str(e)}")
        return {"message": "Error processing webhook"}

# ========== EXOTEL CALL ENDPOINTS ==========

@api_router.post("/exotel/initiate-call")
async def exotel_initiate_call_endpoint(
    data: ExotelCallInitiate,
    current_user: dict = Depends(get_current_user)
):
    """
    Initiate masked call via Exotel
    
    - Client calls Exophone
    - Backend identifies advocate
    - Call forwarded to advocate with Exophone as Caller ID
    - Real-time wallet deduction based on call duration
    """
    await require_role(current_user, ["client"])
    
    # Get advocate details
    advocate = await db.advocates.find_one(
        {"id": data.advocate_id},
        {"_id": 0}
    )
    
    if not advocate:
        raise HTTPException(status_code=404, detail="Advocate not found")
    
    if advocate.get("verification_status") != "approved":
        raise HTTPException(status_code=400, detail="Advocate not verified")
    
    if not advocate.get("duty_status"):
        raise HTTPException(status_code=400, detail="Advocate is offline")
    
    # Check client wallet balance
    wallet = await db.wallets.find_one({"user_id": current_user["id"]}, {"_id": 0})
    min_balance = advocate.get("per_minute_charge", PER_MINUTE_RATE) * 5  # Min 5 minutes
    
    if not wallet or wallet.get("balance", 0) < min_balance:
        raise HTTPException(
            status_code=400, 
            detail=f"Insufficient wallet balance. Minimum ₹{min_balance} required for call"
        )
    
    # Create call record
    call_id = str(uuid.uuid4())
    call_record = {
        "id": call_id,
        "client_id": current_user["id"],
        "client_phone": data.client_phone,
        "advocate_id": data.advocate_id,
        "advocate_phone": advocate.get("phone_number"),
        "cost_per_minute": advocate.get("per_minute_charge", PER_MINUTE_RATE),
        "status": "initiating",
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.calls.insert_one(call_record)
    
    # Initiate call via Exotel
    result = await exotel_initiate_call(
        from_number=data.client_phone,
        to_number=advocate.get("phone_number"),
        call_id=call_id
    )
    
    if result["success"]:
        # Update call record with Exotel SID
        await db.calls.update_one(
            {"id": call_id},
            {"$set": {
                "exotel_call_sid": result["exotel_call_sid"],
                "status": "ringing"
            }}
        )
        
        return {
            "success": True,
            "call_id": call_id,
            "exotel_call_sid": result["exotel_call_sid"],
            "message": "Call initiated. Connecting..."
        }
    else:
        # Update call record as failed
        await db.calls.update_one(
            {"id": call_id},
            {"$set": {"status": "failed", "error": result["message"]}}
        )
        raise HTTPException(status_code=500, detail=result["message"])

@api_router.post("/webhooks/exotel/status")
async def exotel_status_webhook(request: Request):
    """
    Exotel Call Status Webhook
    
    Configure this URL in Exotel dashboard as StatusCallback:
    {BACKEND_URL}/api/webhooks/exotel/status
    
    Handles call completion and wallet deduction
    """
    try:
        # Parse form data from Exotel
        form_data = await request.form()
        data = dict(form_data)
        
        logger.info(f"Exotel status webhook received: {data}")
        
        call_sid = data.get("CallSid")
        status = data.get("Status")
        duration = data.get("RecordingDuration") or data.get("Duration") or data.get("ConversationDuration")
        custom_field = data.get("CustomField")  # Our call_id
        
        if not custom_field:
            # Try to find call by exotel_call_sid
            call = await db.calls.find_one({"exotel_call_sid": call_sid}, {"_id": 0})
            if call:
                custom_field = call.get("id")
        
        if custom_field:
            call = await db.calls.find_one({"id": custom_field}, {"_id": 0})
            
            if call and status in ["completed", "busy", "no-answer", "failed", "canceled"]:
                duration_seconds = int(duration or 0)
                duration_minutes = duration_seconds / 60 if duration_seconds > 0 else 0
                
                # Round up to next minute for billing
                billed_minutes = -(-duration_seconds // 60) if duration_seconds > 0 else 0
                
                total_cost = billed_minutes * call.get("cost_per_minute", PER_MINUTE_RATE)
                
                # Update call record
                await db.calls.update_one(
                    {"id": custom_field},
                    {"$set": {
                        "status": "completed" if status == "completed" else status,
                        "end_time": datetime.now(timezone.utc),
                        "duration_seconds": duration_seconds,
                        "duration_minutes": round(duration_minutes, 2),
                        "billed_minutes": billed_minutes,
                        "total_cost": total_cost,
                        "exotel_status": status
                    }}
                )
                
                # Deduct from client wallet if call completed
                if status == "completed" and total_cost > 0:
                    await db.wallets.update_one(
                        {"user_id": call["client_id"]},
                        {
                            "$inc": {"balance": -total_cost},
                            "$push": {
                                "transactions": {
                                    "type": "call_charge",
                                    "amount": -total_cost,
                                    "reference": f"Call {custom_field} - {billed_minutes} mins",
                                    "timestamp": datetime.now(timezone.utc)
                                }
                            }
                        }
                    )
                    
                    # Add to advocate earnings
                    advocate_share = total_cost * 0.8  # 80% to advocate
                    await db.wallets.update_one(
                        {"user_id": call["advocate_id"]},
                        {
                            "$inc": {"balance": advocate_share},
                            "$push": {
                                "transactions": {
                                    "type": "call_earning",
                                    "amount": advocate_share,
                                    "reference": f"Call {custom_field} - {billed_minutes} mins",
                                    "timestamp": datetime.now(timezone.utc)
                                }
                            }
                        },
                        upsert=True
                    )
                    
                    logger.info(f"Call {custom_field} completed. Duration: {billed_minutes} mins, Cost: ₹{total_cost}")
        
        return {"message": "Webhook processed"}
    except Exception as e:
        logger.error(f"Exotel webhook error: {str(e)}")
        return {"message": "Error processing webhook"}

@api_router.get("/webhooks/exotel/passthru")
async def exotel_passthru_webhook(request: Request):
    """
    Exotel Passthru Webhook for Number Masking Flow
    
    Configure this URL in Exotel Flow Builder as Passthru applet URL:
    {BACKEND_URL}/api/webhooks/exotel/passthru
    
    Flow:
    1. Client calls Exophone
    2. Exotel sends client number to this webhook
    3. We lookup active call/booking and return advocate's number
    4. Exotel connects client to advocate
    """
    try:
        # Get query params from Exotel
        params = dict(request.query_params)
        logger.info(f"Exotel passthru webhook received: {params}")
        
        caller_number = params.get("CallFrom") or params.get("From")
        exophone = params.get("CallTo") or params.get("To")
        call_sid = params.get("CallSid")
        
        if not caller_number:
            logger.error("No caller number in passthru request")
            return PlainTextResponse("", status_code=200)
        
        # Clean caller number
        caller_clean = caller_number.replace("+91", "").replace(" ", "").lstrip("0")
        
        # Find pending call for this client
        pending_call = await db.calls.find_one({
            "client_phone": {"$regex": caller_clean},
            "status": {"$in": ["initiating", "pending", "ringing"]}
        }, {"_id": 0}, sort=[("created_at", -1)])
        
        if pending_call:
            advocate_phone = pending_call.get("advocate_phone", "")
            # Clean advocate phone for Exotel
            advocate_clean = advocate_phone.replace("+91", "").replace(" ", "").lstrip("0")
            
            # Update call with Exotel SID
            await db.calls.update_one(
                {"id": pending_call["id"]},
                {"$set": {
                    "exotel_call_sid": call_sid,
                    "status": "connecting"
                }}
            )
            
            logger.info(f"Passthru: Routing {caller_clean} to advocate {advocate_clean}")
            return PlainTextResponse(advocate_clean, status_code=200)
        else:
            # No pending call found - could route to IVR or default number
            logger.warning(f"No pending call found for caller: {caller_clean}")
            return PlainTextResponse("", status_code=302)  # 302 = alternate path in flow
            
    except Exception as e:
        logger.error(f"Exotel passthru error: {str(e)}")
        return PlainTextResponse("", status_code=500)

# ========== UTILITY ENDPOINTS ==========

@api_router.get("/utils/cities")
async def get_cities():
    """Get list of major Indian cities"""
    cities = [
        "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai",
        "Kolkata", "Pune", "Jaipur", "Surat", "Lucknow", "Kanpur", "Nagpur",
        "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad",
        "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik",
        "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivali", "Vasai-Virar",
        "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai",
        "Allahabad", "Ranchi", "Howrah", "Coimbatore", "Jabalpur", "Gwalior",
        "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota"
    ]
    return {"cities": sorted(cities)}

@api_router.get("/utils/law-types")
async def get_law_types():
    """Get list of law types"""
    law_types = [
        "Family Law",
        "Criminal Law",
        "Civil Law",
        "Corporate Law",
        "Property Law",
        "Labour Law",
        "Tax Law",
        "Intellectual Property Law",
        "Consumer Protection Law",
        "Banking & Finance Law",
        "Immigration Law",
        "Environmental Law",
        "Constitutional Law",
        "Cyber Law",
        "International Law"
    ]
    return {"law_types": law_types}

@api_router.get("/utils/languages")
async def get_languages():
    """Get list of languages"""
    languages = [
        "Hindi", "English", "Tamil", "Telugu", "Marathi", "Bengali", "Gujarati",
        "Kannada", "Malayalam", "Punjabi", "Urdu", "Odia", "Assamese"
    ]
    return {"languages": sorted(languages)}

# Include router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

@app.on_event("startup")
async def startup_db():
    """Create indexes on startup"""
    # Create indexes
    await db.otps.create_index("expires_at", expireAfterSeconds=0)
    await db.advocates.create_index("fid", unique=True)
    await db.advocates.create_index("email", unique=True)
    await db.users.create_index("email", unique=True)
    await db.admins.create_index("email", unique=True)
    
    # Create default admin if not exists
    admin_exists = await db.admins.find_one({"email": "admin@formulaw.com"})
    if not admin_exists:
        admin = {
            "id": str(uuid.uuid4()),
            "email": "admin@formulaw.com",
            "role": "admin",
            "name": "Admin",
            "token": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "last_login": None
        }
        await db.admins.insert_one(admin)
        logger.info("Default admin created: admin@formulaw.com")
