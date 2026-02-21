import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Shield } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const navigate = useNavigate();
  const { login, API } = useAuth();

  const sendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/auth/send-otp`, {
        email,
        role: 'admin'
      });
      toast.success('OTP sent to your email!');
      setOtpSent(true);
      
      let timer = 60;
      const interval = setInterval(() => {
        timer--;
        setCountdown(timer);
        if (timer === 0) clearInterval(interval);
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error('Please enter OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/verify-otp`, {
        email,
        otp_code: otp,
        role: 'admin'
      });
      
      login(response.data.user, response.data.token);
      toast.success('Login successful!');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #001f3f 0%, #003d7a 100%)' }}>
      {/* Indian Flag Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, #FF9933 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #138808 66.66%)',
          animation: 'wave 3s ease-in-out infinite'
        }}></div>
      </div>

      <style>{`
        @keyframes wave {
          0%, 100% { transform: translateX(0) skewX(0deg); }
          25% { transform: translateX(-5px) skewX(2deg); }
          75% { transform: translateX(5px) skewX(-2deg); }
        }
      `}</style>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img 
              src="https://customer-assets.emergentagent.com/job_formulaw-admin/artifacts/6g8uyqyo_6CA97F72-C87A-4CE5-89BD-678CA36A468C.jpeg" 
              alt="FormuLAW Logo" 
              className="h-32 w-auto"
            />
          </div>
          {/* Tagline */}
          <div className="text-white">
            <p className="text-lg font-semibold mb-1">Legal help made simple</p>
            <p className="text-sm font-medium">Say it • Seek it • Sorted</p>
          </div>
          <div className="mt-4 flex justify-center">
            <div className="bg-red-600 p-3 rounded-full border-2 border-white">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <Card className="border-2 border-white shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-red-700 to-red-800 text-white rounded-t-lg">
            <CardTitle className="text-center">Admin Login</CardTitle>
            <CardDescription className="text-gray-200 text-center">Secure access for administrators only</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={otpSent ? verifyOTP : sendOTP} className="space-y-4">
              <div>
                <Label htmlFor="email">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@formulaw.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={otpSent}
                  className="border-gray-300"
                  data-testid="admin-email-input"
                />
              </div>

              {otpSent && (
                <div>
                  <Label htmlFor="otp">OTP Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="border-gray-300"
                    data-testid="admin-otp-input"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {countdown > 0 ? `OTP expires in ${countdown}s` : 'OTP expired'}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 border-2 border-white"
                disabled={loading}
                data-testid="admin-login-submit-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait...
                  </>
                ) : otpSent ? (
                  'Verify OTP'
                ) : (
                  'Send OTP'
                )}
              </Button>

              {otpSent && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-2 border-red-600"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp('');
                    setCountdown(60);
                  }}
                >
                  Change Email
                </Button>
              )}
            </form>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-xs text-yellow-800">
                <strong>Default Admin:</strong> admin@formulaw.com
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <a href="/client" className="text-white hover:underline text-sm font-medium">
            ← Back to Client Portal
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
