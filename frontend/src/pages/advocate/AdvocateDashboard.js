import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { LogOut, User, Phone, Wallet, TrendingUp, Star, Briefcase, Clock, ChevronDown, Settings } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

const AdvocateDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingDuty, setUpdatingDuty] = useState(false);
  const { user, logout, axios, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    if (!user || user.role !== 'advocate') {
      navigate('/advocate');
      return;
    }
    fetchDashboard();
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get('/advocate/dashboard');
      setDashboard(response.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/advocate/profile');
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const toggleDutyStatus = async (checked) => {
    setUpdatingDuty(true);
    try {
      await axios.patch('/advocate/duty-status', {
        duty_status: checked
      });
      toast.success(checked ? 'You are now online!' : 'You are now offline');
      fetchDashboard();
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update duty status');
    } finally {
      setUpdatingDuty(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div 
          className="fixed inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://customer-assets.emergentagent.com/job_formulaw-admin/artifacts/kwn9gg7f_1BE7EC66-F614-49CE-9066-FEEE09EE1754.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-amber-900/40"></div>
        </div>
        <p className="relative z-10 text-white text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://customer-assets.emergentagent.com/job_formulaw-admin/artifacts/kwn9gg7f_1BE7EC66-F614-49CE-9066-FEEE09EE1754.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-amber-900/40"></div>
      </div>

      {/* Header Navigation */}
      <nav className="relative z-10 bg-gradient-to-r from-black/60 to-transparent backdrop-blur-md border-b border-amber-900/30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo - Left */}
            <div className="flex items-center gap-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_formulaw-admin/artifacts/40evjnjx_F8F86B73-D0A4-48D1-939C-FFE50AD8BAEC.jpeg" 
                alt="FormuLAW" 
                className="h-12 w-auto object-contain filter brightness-110 contrast-110 drop-shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
                onClick={() => navigate('/advocate/dashboard')}
              />
              <Badge className="bg-amber-600/80 text-white border-amber-500">Advocate Portal</Badge>
            </div>
            
            {/* Navigation - Right */}
            <div className="flex items-center gap-4">
              {/* Earnings Button */}
              <Button
                variant="outline"
                onClick={() => navigate('/advocate/earnings')}
                className="bg-white/10 border-amber-600/50 text-white hover:bg-white/20 hover:text-amber-300"
                data-testid="earnings-btn"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Earnings
              </Button>

              {/* Call History Button */}
              <Button
                variant="outline"
                onClick={() => navigate('/advocate/call-history')}
                className="bg-white/10 border-amber-600/50 text-white hover:bg-white/20 hover:text-amber-300"
                data-testid="call-history-btn"
              >
                <Phone className="w-4 h-4 mr-2" />
                History
              </Button>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="bg-white/10 border-amber-600/50 text-white hover:bg-white/20 hover:text-amber-300"
                    data-testid="profile-dropdown-btn"
                  >
                    <User className="w-4 h-4 mr-2" />
                    {profile?.first_name || 'Profile'}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/advocate/profile')} data-testid="profile-menu-item">
                    <User className="w-4 h-4 mr-2" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/advocate/earnings')} data-testid="earnings-menu-item">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Earnings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/advocate/call-history')} data-testid="history-menu-item">
                    <Phone className="w-4 h-4 mr-2" />
                    Call History
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600" data-testid="logout-menu-item">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Welcome Section with Tagline */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 text-2xl md:text-3xl mb-4">
              <span className="text-purple-400 font-bold animate-pulse" style={{ color: '#A78BFA' }}>Say it</span>
              <span className="text-purple-300" style={{ color: '#C4B5FD' }}>•</span>
              <span className="text-purple-400 font-bold animate-pulse" style={{ color: '#A78BFA', animationDelay: '0.2s' }}>Seek it</span>
              <span className="text-purple-300" style={{ color: '#C4B5FD' }}>•</span>
              <span className="text-purple-400 font-bold animate-pulse" style={{ color: '#A78BFA', animationDelay: '0.4s' }}>Sorted</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-light text-white mb-2">
              Welcome, {profile?.first_name} {profile?.last_name}
            </h2>
            <p className="text-amber-400 font-medium">FormuLAW ID: {dashboard?.fid}</p>
          </div>

          {/* Verification Status */}
          {dashboard?.verification_status === 'pending' && (
            <Card className="mb-8 bg-yellow-50/95 backdrop-blur-sm border-yellow-300 shadow-xl">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-yellow-600" />
                  <div>
                    <h3 className="font-semibold text-yellow-900">Verification Pending</h3>
                    <p className="text-sm text-yellow-700">
                      Your Bar Council ID verification is in progress. This may take up to 24 hours.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {dashboard?.verification_status === 'rejected' && (
            <Card className="mb-8 bg-red-50/95 backdrop-blur-sm border-red-300 shadow-xl">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="text-red-600">
                    <h3 className="font-semibold text-red-900">Verification Rejected</h3>
                    <p className="text-sm text-red-700">
                      Your Bar Council ID verification was rejected. Please contact support.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Duty Status Toggle */}
          {dashboard?.verification_status === 'approved' && (
            <Card className="mb-8 bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1 text-gray-900">Duty Status</h3>
                    <p className="text-sm text-gray-600">
                      {dashboard?.duty_status
                        ? 'You are currently online and available for calls'
                        : 'You are currently offline and not visible to clients'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={dashboard?.duty_status ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-100 text-gray-800 border-gray-300'}>
                      {dashboard?.duty_status ? 'Online' : 'Offline'}
                    </Badge>
                    <Switch
                      checked={dashboard?.duty_status || false}
                      onCheckedChange={toggleDutyStatus}
                      disabled={updatingDuty}
                      data-testid="duty-status-toggle"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(dashboard?.total_earnings || 0)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Wallet Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-amber-600" />
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(dashboard?.wallet_balance || 0)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboard?.total_cases || 0}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Average Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboard?.average_rating?.toFixed(1) || '0.0'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card 
              className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-[1.02]" 
              onClick={() => navigate('/advocate/profile')}
            >
              <CardContent className="pt-6 pb-6">
                <div className="text-center">
                  <User className="w-12 h-12 mx-auto mb-3 text-amber-700" />
                  <h3 className="font-semibold mb-2 text-gray-900">Manage Profile</h3>
                  <p className="text-sm text-gray-600">Update your details and preferences</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-[1.02]" 
              onClick={() => navigate('/advocate/call-history')}
            >
              <CardContent className="pt-6 pb-6">
                <div className="text-center">
                  <Phone className="w-12 h-12 mx-auto mb-3 text-amber-700" />
                  <h3 className="font-semibold mb-2 text-gray-900">Call History</h3>
                  <p className="text-sm text-gray-600">View your consultation history</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-[1.02]" 
              onClick={() => navigate('/advocate/earnings')}
            >
              <CardContent className="pt-6 pb-6">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 text-amber-700" />
                  <h3 className="font-semibold mb-2 text-gray-900">Earnings Report</h3>
                  <p className="text-sm text-gray-600">Track your earnings and payouts</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-black/60 backdrop-blur-md border-t border-amber-900/30 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="space-y-1">
              <a href="#about" className="block text-white/80 hover:text-amber-400 text-sm transition-colors">
                About Us
              </a>
              <a href="#contact" className="block text-white/80 hover:text-amber-400 text-sm transition-colors">
                Contact Us
              </a>
            </div>
            <div className="w-16 h-px bg-amber-600/50"></div>
            <p className="text-white/60 text-xs">
              © 2026 All rights reserved. FormuLAW - Legal Consultation Platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdvocateDashboard;
