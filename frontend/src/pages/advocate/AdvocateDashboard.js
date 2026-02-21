import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Scale, LogOut, User, Phone, Wallet, TrendingUp, Star, Briefcase, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const AdvocateDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingDuty, setUpdatingDuty] = useState(false);
  const { user, logout, axios } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'advocate') {
      navigate('/advocate');
      return;
    }
    fetchDashboard();
    fetchProfile();
  }, []);

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
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-8 h-8 text-[#1877f2]" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">FormuLAW</h1>
              <p className="text-xs text-gray-500">Advocate Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/advocate/profile')}
              data-testid="profile-btn"
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/advocate/earnings')}
              data-testid="earnings-btn"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Earnings
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/advocate/call-history')}
              data-testid="call-history-btn"
            >
              <Phone className="w-4 h-4 mr-2" />
              History
            </Button>
            <Button variant="ghost" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {profile?.first_name} {profile?.last_name}
          </h2>
          <p className="text-gray-600">FormuLAW ID: {dashboard?.fid}</p>
        </div>

        {/* Verification Status */}
        {dashboard?.verification_status === 'pending' && (
          <Card className="mb-8 border-yellow-300 bg-yellow-50">
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
          <Card className="mb-8 border-red-300 bg-red-50">
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
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Duty Status</h3>
                  <p className="text-sm text-gray-600">
                    {dashboard?.duty_status
                      ? 'You are currently online and available for calls'
                      : 'You are currently offline and not visible to clients'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={dashboard?.duty_status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
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
          <Card>
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

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Wallet Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#1877f2]" />
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(dashboard?.wallet_balance || 0)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
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

          <Card>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/advocate/profile')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <User className="w-12 h-12 mx-auto mb-3 text-[#1877f2]" />
                <h3 className="font-semibold mb-2">Manage Profile</h3>
                <p className="text-sm text-gray-600">Update your details and preferences</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/advocate/call-history')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <Phone className="w-12 h-12 mx-auto mb-3 text-[#1877f2]" />
                <h3 className="font-semibold mb-2">Call History</h3>
                <p className="text-sm text-gray-600">View your consultation history</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/advocate/earnings')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 text-[#1877f2]" />
                <h3 className="font-semibold mb-2">Earnings Report</h3>
                <p className="text-sm text-gray-600">Track your earnings and payouts</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdvocateDashboard;
