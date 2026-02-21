import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Scale } from 'lucide-react';

const AdvocateLogin = () => {
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
        role: 'advocate'
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
        role: 'advocate'
      });
      
      login(response.data.user, response.data.token);
      toast.success('Login successful!');
      navigate('/advocate/dashboard');
    } catch (error) {
      if (error.response?.data?.detail?.includes('not registered')) {
        toast.error('Not registered. Redirecting to registration...');
        setTimeout(() => navigate('/advocate/register'), 1500);
      } else {
        toast.error(error.response?.data?.detail || 'Invalid OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-[#1877f2] p-4 rounded-full">
              <Scale className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">FormuLAW</h1>
          <p className="text-gray-600">Advocate Portal</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Advocate Login</CardTitle>
            <CardDescription>Enter your registered email to receive OTP</CardDescription>
          </CardHeader>
          <CardContent>
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
                  data-testid="advocate-email-input"
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
                    data-testid="advocate-otp-input"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {countdown > 0 ? `OTP expires in ${countdown}s` : 'OTP expired'}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-[#1877f2] hover:bg-[#166fe5]"
                disabled={loading}
                data-testid="advocate-login-submit-btn"
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
                  className="w-full"
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

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            New advocate?{' '}
            <a href="/advocate/register" className="text-[#1877f2] hover:underline font-medium">
              Register here
            </a>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            <a href="/client" className="text-[#1877f2] hover:underline font-medium">
              Client Portal
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdvocateLogin;
