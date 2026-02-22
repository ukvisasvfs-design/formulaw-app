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
  const [hammerAnimate, setHammerAnimate] = useState(false);
  const navigate = useNavigate();
  const { login, API } = useAuth();

  const sendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setHammerAnimate(true);
    setTimeout(() => setHammerAnimate(false), 600);

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

    setHammerAnimate(true);
    setTimeout(() => setHammerAnimate(false), 600);

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
    <div className="min-h-screen relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://customer-assets.emergentagent.com/job_formulaw-admin/artifacts/kwn9gg7f_1BE7EC66-F614-49CE-9066-FEEE09EE1754.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-red-900/30"></div>
      </div>

      <style>{`
        @keyframes hammerStrike {
          0% { transform: rotate(-20deg) translateY(0); }
          50% { transform: rotate(5deg) translateY(5px); }
          100% { transform: rotate(-20deg) translateY(0); }
        }
        .hammer-animate {
          animation: hammerStrike 0.6s ease-in-out;
        }
      `}</style>

      <nav className="relative z-10 bg-gradient-to-r from-black/50 to-transparent backdrop-blur-md border-b border-red-900/30">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="https://customer-assets.emergentagent.com/job_formulaw-admin/artifacts/40evjnjx_F8F86B73-D0A4-48D1-939C-FFE50AD8BAEC.jpeg" 
                alt="FormuLAW" 
                className="h-10 w-auto filter drop-shadow-lg hover:scale-105 transition-transform duration-300"
              />
              <div className="bg-red-600 p-1.5 rounded-lg">
                <Shield className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <a href="#about" className="text-white/90 hover:text-red-400 transition-all text-sm font-medium tracking-wide">
                About Us
              </a>
              <a href="#contact" className="text-white/90 hover:text-red-400 transition-all text-sm font-medium tracking-wide">
                Contact Us
              </a>
              <a 
                href="/client" 
                className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 rounded-lg transition-all text-sm font-semibold shadow-lg hover:shadow-xl"
              >
                Client Portal
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extralight text-white mb-3 tracking-wide">
              Platform <span className="font-light italic">administration</span>
            </h1>
            <div className="flex items-center justify-center gap-3 text-lg md:text-xl">
              <span className="text-red-400 font-semibold animate-pulse">Secure</span>
              <span className="text-red-500">•</span>
              <span className="text-red-400 font-semibold animate-pulse" style={{ animationDelay: '0.2s' }}>Controlled</span>
              <span className="text-red-500">•</span>
              <span className="text-red-400 font-semibold animate-pulse" style={{ animationDelay: '0.4s' }}>Managed</span>
            </div>
          </div>

          <Card className="relative overflow-hidden border-0 shadow-2xl">
            <div 
              className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-40 pointer-events-none"
              style={{
                backgroundImage: 'url(https://customer-assets.emergentagent.com/job_formulaw-admin/artifacts/9s76vk1a_858AB95A-A3BA-47BB-9FE4-9500C88E643C.png)',
                backgroundSize: '60%',
                backgroundPosition: 'center'
              }}
            ></div>

            <div className="relative z-10 bg-white/95 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-red-700/90 to-red-800/90 text-white pb-6 pt-6">
                <CardTitle className="text-center text-2xl font-light tracking-wider">Administrator Access</CardTitle>
                <CardDescription className="text-red-100 text-center font-light text-sm">Authorized personnel only</CardDescription>
              </CardHeader>
              <CardContent className="pt-8 pb-8 px-8">
                <form onSubmit={otpSent ? verifyOTP : sendOTP} className="space-y-5">
                  <div>
                    <Label htmlFor="email" className="text-gray-700 font-medium text-sm">Admin Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@formulaw.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={otpSent}
                      className="mt-2 border-gray-300 focus:border-red-600 focus:ring-red-600 h-12 text-base bg-white/80"
                      data-testid="admin-email-input"
                    />
                  </div>

                  {otpSent && (
                    <div>
                      <Label htmlFor="otp" className="text-gray-700 font-medium text-sm">Security Code</Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        className="mt-2 border-gray-300 focus:border-red-600 focus:ring-red-600 h-12 text-base tracking-widest text-center text-xl bg-white/80"
                        data-testid="admin-otp-input"
                      />
                      <p className="text-sm text-gray-500 mt-2 text-center">
                        {countdown > 0 ? `Code expires in ${countdown}s` : 'Code expired'}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white h-12 text-base font-semibold tracking-wide shadow-lg"
                      disabled={loading}
                      data-testid="admin-login-submit-btn"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Authenticating...
                        </>
                      ) : otpSent ? (
                        'Verify & Access'
                      ) : (
                        'Send Code'
                      )}
                    </Button>
                    <div className={`text-5xl ${hammerAnimate ? 'hammer-animate' : ''}`}>
                      ⚖️
                    </div>
                  </div>

                  {otpSent && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-2 border-red-700 text-red-800 hover:bg-red-50 h-12"
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

                <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded">
                  <p className="text-xs text-amber-800">
                    <strong className="block mb-1">Default Credentials:</strong>
                    Email: admin@formulaw.com
                  </p>
                </div>

                <div className="mt-6 text-center">
                  <a href="/client" className="text-gray-600 hover:text-amber-800 text-sm font-medium">
                    ← Return to main portal
                  </a>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
