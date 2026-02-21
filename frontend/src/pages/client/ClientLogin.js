import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const ClientLogin = () => {
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
        role: 'client'
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
        role: 'client'
      });
      
      login(response.data.user, response.data.token);
      toast.success('Login successful!');
      navigate('/client/home');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid OTP');
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
        </div>

        <Card className="border-2 border-white shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-[#001f3f] to-[#003d7a] text-white rounded-t-lg">
            <CardTitle className="text-center">Client Login</CardTitle>
            <CardDescription className="text-gray-200 text-center">Enter your email to receive OTP</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={otpSent ? verifyOTP : sendOTP} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={otpSent}
                  className="border-gray-300"
                  data-testid="client-email-input"
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
                    data-testid="client-otp-input"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {countdown > 0 ? `OTP expires in ${countdown}s` : 'OTP expired'}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-[#001f3f] hover:bg-[#003d7a] border-2 border-white"
                disabled={loading}
                data-testid="client-login-submit-btn"
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
                  className="w-full border-2 border-[#001f3f]"
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
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-white">
          <p className="text-sm">
            Are you an advocate?{' '}
            <a href="/advocate" className="font-bold hover:underline">
              Login here
            </a>
          </p>
          <p className="text-sm mt-2">
            Admin?{' '}
            <a href="/admin" className="font-bold hover:underline">
              Admin Portal
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClientLogin;
