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
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, #f0f2f5 0%, #e9ebee 100%)' }}>
      {/* Indian Flag Background - Fluttering */}
      <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0" 
          style={{
            background: 'linear-gradient(to bottom, #FF9933 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #138808 66.66%)',
            backgroundSize: '200% 100%',
            animation: 'flutter 4s ease-in-out infinite'
          }}
        ></div>
        {/* Ashoka Chakra effect */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-8 border-blue-800 rounded-full opacity-20"></div>
      </div>

      <style>{`
        @keyframes flutter {
          0%, 100% { 
            transform: perspective(400px) rotateY(0deg) translateX(0);
            background-position: 0% 0%;
          }
          25% { 
            transform: perspective(400px) rotateY(-5deg) translateX(-10px);
            background-position: -5% 0%;
          }
          50% { 
            transform: perspective(400px) rotateY(0deg) translateX(0);
            background-position: 0% 0%;
          }
          75% { 
            transform: perspective(400px) rotateY(5deg) translateX(10px);
            background-position: 5% 0%;
          }
        }
      `}</style>

      {/* Header with Logo and Tagline */}
      <div className="relative z-10 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo - Left */}
          <div className="flex items-center">
            <img 
              src="https://customer-assets.emergentagent.com/job_formulaw-admin/artifacts/6g8uyqyo_6CA97F72-C87A-4CE5-89BD-678CA36A468C.jpeg" 
              alt="FormuLAW Logo" 
              className="h-16 w-auto"
            />
          </div>
          
          {/* Tagline - Right */}
          <div className="text-right">
            <h1 className="text-2xl md:text-3xl font-bold text-[#1877f2] leading-tight">Legal help made simple</h1>
            <p className="text-sm md:text-base text-gray-600 font-medium mt-1">Say it • Seek it • Sorted</p>
          </div>
        </div>
      </div>

      {/* Login Card - Center */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-88px)] p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-2 border-gray-200">
            <CardHeader className="bg-gradient-to-r from-[#1877f2] to-[#166fe5] text-white">
              <CardTitle className="text-center text-2xl">Client Login</CardTitle>
              <CardDescription className="text-gray-100 text-center">Enter your email to receive OTP</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 bg-white">
              <form onSubmit={otpSent ? verifyOTP : sendOTP} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={otpSent}
                    className="border-gray-300 focus:border-[#1877f2] focus:ring-[#1877f2]"
                    data-testid="client-email-input"
                  />
                </div>

                {otpSent && (
                  <div>
                    <Label htmlFor="otp" className="text-gray-700">OTP Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      className="border-gray-300 focus:border-[#1877f2] focus:ring-[#1877f2]"
                      data-testid="client-otp-input"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {countdown > 0 ? `OTP expires in ${countdown}s` : 'OTP expired'}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-[#1877f2] hover:bg-[#166fe5] text-white py-6 text-lg font-semibold"
                  disabled={loading}
                  data-testid="client-login-submit-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
                    className="w-full border-2 border-[#1877f2] text-[#1877f2] hover:bg-[#f0f2f5]"
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

              <div className="mt-6 text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Are you an advocate?{' '}
                  <a href="/advocate" className="text-[#1877f2] hover:underline font-semibold">
                    Login here
                  </a>
                </p>
                <p className="text-sm text-gray-600">
                  Admin?{' '}
                  <a href="/admin" className="text-[#1877f2] hover:underline font-semibold">
                    Admin Portal
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientLogin;
