"""
FormuLAW Backend API Tests
Testing: Auth (OTP), Client APIs, Advocate APIs, Admin APIs, Utility APIs
"""
import pytest
import requests
import os
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# ============ FIXTURES ============

@pytest.fixture(scope="session")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture(scope="session")
def test_client_email():
    return f"TEST_client_{datetime.now().strftime('%Y%m%d%H%M%S')}@example.com"

@pytest.fixture(scope="session")
def test_advocate_email():
    return f"TEST_advocate_{datetime.now().strftime('%Y%m%d%H%M%S')}@example.com"

# ============ UTILITY API TESTS ============

class TestUtilityAPIs:
    """Test utility endpoints - no auth required"""
    
    def test_get_cities(self, api_client):
        """Test GET /api/utils/cities"""
        response = api_client.get(f"{BASE_URL}/api/utils/cities")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "cities" in data
        assert isinstance(data["cities"], list)
        assert len(data["cities"]) > 0
        assert "Mumbai" in data["cities"]
        print(f"SUCCESS: Got {len(data['cities'])} cities")
    
    def test_get_law_types(self, api_client):
        """Test GET /api/utils/law-types"""
        response = api_client.get(f"{BASE_URL}/api/utils/law-types")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "law_types" in data
        assert isinstance(data["law_types"], list)
        assert len(data["law_types"]) > 0
        assert "Criminal Law" in data["law_types"]
        print(f"SUCCESS: Got {len(data['law_types'])} law types")
    
    def test_get_languages(self, api_client):
        """Test GET /api/utils/languages"""
        response = api_client.get(f"{BASE_URL}/api/utils/languages")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "languages" in data
        assert isinstance(data["languages"], list)
        assert len(data["languages"]) > 0
        assert "English" in data["languages"]
        print(f"SUCCESS: Got {len(data['languages'])} languages")


# ============ AUTH API TESTS ============

class TestAuthAPIs:
    """Test authentication endpoints"""
    
    def test_send_otp_client(self, api_client, test_client_email):
        """Test POST /api/auth/send-otp for client"""
        response = api_client.post(f"{BASE_URL}/api/auth/send-otp", json={
            "email": test_client_email,
            "role": "client"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "message" in data
        assert "expires_in" in data
        assert data["expires_in"] == 60
        print(f"SUCCESS: OTP sent to {test_client_email}")
    
    def test_send_otp_admin(self, api_client):
        """Test POST /api/auth/send-otp for admin"""
        response = api_client.post(f"{BASE_URL}/api/auth/send-otp", json={
            "email": "admin@formulaw.com",
            "role": "admin"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "message" in data
        print("SUCCESS: OTP sent to admin")
    
    def test_verify_otp_invalid(self, api_client, test_client_email):
        """Test POST /api/auth/verify-otp with invalid OTP"""
        response = api_client.post(f"{BASE_URL}/api/auth/verify-otp", json={
            "email": test_client_email,
            "otp_code": "000000",  # Invalid OTP
            "role": "client"
        })
        assert response.status_code == 400, f"Expected 400 for invalid OTP, got {response.status_code}"
        print("SUCCESS: Invalid OTP correctly rejected")
    
    def test_get_me_unauthorized(self, api_client):
        """Test GET /api/auth/me without token"""
        response = api_client.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("SUCCESS: Unauthorized access correctly rejected")


# ============ ADVOCATE REGISTRATION TEST ============

class TestAdvocateRegistration:
    """Test advocate registration"""
    
    def test_register_advocate(self, api_client, test_advocate_email):
        """Test POST /api/advocate/register"""
        payload = {
            "email": test_advocate_email,
            "first_name": "Test",
            "last_name": "Advocate",
            "phone_number": "+919876543210",
            "bar_council_id": f"TEST-BAR-{datetime.now().strftime('%H%M%S')}",
            "bar_council_issue_years": 5,
            "bar_council_issue_months": 6,
            "languages": ["English", "Hindi"],
            "law_types": ["Criminal Law", "Civil Law"],
            "working_hours": "anytime",
            "area": "Test Area",
            "city": "Mumbai",
            "state": "Maharashtra",
            "per_minute_charge": 25.0
        }
        
        response = api_client.post(f"{BASE_URL}/api/advocate/register", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "fid" in data
        assert data["fid"].startswith("FID-IND-")
        assert data["verification_status"] == "pending"
        print(f"SUCCESS: Advocate registered with FID: {data['fid']}")
        return data["fid"]
    
    def test_register_advocate_duplicate(self, api_client, test_advocate_email):
        """Test duplicate advocate registration fails"""
        payload = {
            "email": test_advocate_email,
            "first_name": "Test",
            "last_name": "Advocate",
            "phone_number": "+919876543210",
            "bar_council_id": "TEST-BAR-DUPE",
            "bar_council_issue_years": 5,
            "bar_council_issue_months": 6,
            "languages": ["English"],
            "law_types": ["Criminal Law"],
            "working_hours": "anytime",
            "area": "Test Area",
            "city": "Mumbai",
            "state": "Maharashtra",
            "per_minute_charge": 25.0
        }
        
        response = api_client.post(f"{BASE_URL}/api/advocate/register", json=payload)
        assert response.status_code == 400, f"Expected 400 for duplicate, got {response.status_code}"
        print("SUCCESS: Duplicate registration correctly rejected")


# ============ WALLET TESTS (CLIENT AUTHENTICATED) ============

class TestWalletAPIs:
    """Test wallet endpoints - requires client auth"""
    
    def test_wallet_unauthorized(self, api_client):
        """Test GET /api/client/wallet without auth"""
        response = api_client.get(f"{BASE_URL}/api/client/wallet")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("SUCCESS: Wallet access without auth correctly rejected")
    
    def test_wallet_topup_unauthorized(self, api_client):
        """Test POST /api/client/wallet/topup without auth"""
        response = api_client.post(f"{BASE_URL}/api/client/wallet/topup", json={
            "amount": 100
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("SUCCESS: Wallet topup without auth correctly rejected")


# ============ CLIENT ADVOCATES LIST (AUTHENTICATED) ============

class TestClientAdvocatesAPIs:
    """Test client advocate endpoints - requires client auth"""
    
    def test_advocates_list_unauthorized(self, api_client):
        """Test GET /api/client/advocates without auth"""
        response = api_client.get(f"{BASE_URL}/api/client/advocates")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("SUCCESS: Advocates list without auth correctly rejected")


# ============ ADMIN ENDPOINTS (AUTHENTICATED) ============

class TestAdminAPIs:
    """Test admin endpoints - requires admin auth"""
    
    def test_admin_pending_advocates_unauthorized(self, api_client):
        """Test GET /api/admin/advocates/pending without auth"""
        response = api_client.get(f"{BASE_URL}/api/admin/advocates/pending")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("SUCCESS: Admin access without auth correctly rejected")
    
    def test_admin_analytics_unauthorized(self, api_client):
        """Test GET /api/admin/analytics without auth"""
        response = api_client.get(f"{BASE_URL}/api/admin/analytics")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("SUCCESS: Admin analytics without auth correctly rejected")


# ============ WEBHOOK ENDPOINTS ============

class TestWebhookAPIs:
    """Test webhook endpoints"""
    
    def test_twilio_webhook(self, api_client):
        """Test POST /api/webhooks/twilio/call-status"""
        response = api_client.post(f"{BASE_URL}/api/webhooks/twilio/call-status", json={
            "test": "webhook"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("SUCCESS: Twilio webhook endpoint working")
    
    def test_razorpay_webhook(self, api_client):
        """Test POST /api/webhooks/razorpay"""
        response = api_client.post(f"{BASE_URL}/api/webhooks/razorpay", json={
            "test": "webhook"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("SUCCESS: Razorpay webhook endpoint working")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
