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
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://customer-assets.emergentagent.com/job_formulaw-admin/artifacts/kwn9gg7f_1BE7EC66-F614-49CE-9066-FEEE09EE1754.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-amber-900/40"></div>
      </div>

      {/* Header Navigation */}
      <nav className="relative z-10 bg-gradient-to-r from-black/40 to-transparent backdrop-blur-sm border-b border-amber-900/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo - Left */}
            <div className="flex items-center gap-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_formulaw-admin/artifacts/40evjnjx_F8F86B73-D0A4-48D1-939C-FFE50AD8BAEC.jpeg" 
                alt="FormuLAW" 
                className="h-14 w-auto"
              />
            </div>
            
            {/* Navigation Links - Right */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#join" className="text-white/90 hover:text-amber-400 transition-colors text-sm font-medium">
                Join the Club
              </a>
              <a href="#about" className="text-white/90 hover:text-amber-400 transition-colors text-sm font-medium">
                About Us
              </a>
              <a href="#contact" className="text-white/90 hover:text-amber-400 transition-colors text-sm font-medium">
                Contact Us
              </a>
              <a 
                href="/client/home" 
                className="px-4 py-2 border border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-white rounded-lg transition-all text-sm font-medium"
              >
                Skip Sign In
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Tagline */}
          <div className="text-white space-y-6 hidden md:block">
            <h1 className="text-5xl font-light leading-tight">
              Legal help
              <span className="block font-serif italic text-amber-400">made simple</span>
            </h1>
            <p className="text-xl text-white/80 font-light tracking-wide">
              Say it • Seek it • Sorted
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-amber-500 to-transparent"></div>
          </div>

          {/* Right Side - Login Card */}
          <div>
            <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-800 to-amber-900 text-white pb-8">
                <CardTitle className="text-center text-2xl font-light tracking-wide">Welcome Back</CardTitle>
                <CardDescription className="text-amber-100 text-center font-light">Sign in to access your account</CardDescription>
              </CardHeader>
              <CardContent className="pt-8 pb-8 px-8">
                <form onSubmit={otpSent ? verifyOTP : sendOTP} className="space-y-5">
                  <div>
                    <Label htmlFor="email" className="text-gray-700 font-medium text-sm">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={otpSent}
                      className="mt-2 border-gray-300 focus:border-amber-600 focus:ring-amber-600 h-12 text-base"
                      data-testid="client-email-input"
                    />
                  </div>

                  {otpSent && (
                    <div>
                      <Label htmlFor="otp" className="text-gray-700 font-medium text-sm">Verification Code</Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        className="mt-2 border-gray-300 focus:border-amber-600 focus:ring-amber-600 h-12 text-base tracking-widest text-center text-xl"
                        data-testid="client-otp-input"
                      />
                      <p className="text-sm text-gray-500 mt-2 text-center">
                        {countdown > 0 ? `Code expires in ${countdown}s` : 'Code expired'}
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white h-12 text-base font-medium tracking-wide shadow-lg"
                    disabled={loading}
                    data-testid="client-login-submit-btn"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : otpSent ? (
                      'Verify & Sign In'
                    ) : (
                      'Send Verification Code'
                    )}
                  </Button>

                  {otpSent && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-2 border-amber-800 text-amber-900 hover:bg-amber-50 h-12"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp('');
                        setCountdown(60);
                      }}
                    >
                      Use Different Email
                    </Button>
                  )}
                </form>

                <div className="mt-8 pt-6 border-t border-gray-200 text-center space-y-3">
                  <p className="text-sm text-gray-600">
                    Are you an advocate?{' '}
                    <a href="/advocate" className="text-amber-800 hover:text-amber-600 font-semibold">
                      Sign in here
                    </a>
                  </p>
                  <p className="text-sm text-gray-600">
                    Platform administrator?{' '}
                    <a href="/admin" className="text-amber-800 hover:text-amber-600 font-semibold">
                      Admin Portal
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Tagline */}
      <div className="md:hidden relative z-10 text-center px-4 pb-8">
        <p className="text-white/80 text-sm font-light">
          Legal help made simple • Say it • Seek it • Sorted
        </p>
      </div>
    </div>
  );
};

export default ClientLogin;
