import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from 'sonner';
import { Shield, LogOut, Users, UserCheck, Phone, TrendingUp, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout, axios } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin');
      return;
    }
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/admin/analytics');
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-red-700 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Shield className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">FormuLAW Admin</h1>
              <p className="text-xs opacity-90">Platform Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-red-600"
              onClick={() => navigate('/admin/advocates')}
              data-testid="advocates-btn"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Advocates
            </Button>
            <Button
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-red-600"
              onClick={() => navigate('/admin/users')}
              data-testid="users-btn"
            >
              <Users className="w-4 h-4 mr-2" />
              Users
            </Button>
            <Button
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-red-600"
              onClick={() => navigate('/admin/calls')}
              data-testid="calls-btn"
            >
              <Phone className="w-4 h-4 mr-2" />
              Calls
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:bg-white hover:text-red-600"
              onClick={logout}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
          <p className="text-gray-600">Monitor platform performance and manage operations</p>
        </div>

        {loading ? (
          <p className="text-center py-8">Loading analytics...</p>
        ) : (
          <>
            {/* Pending Verifications Alert */}
            {analytics?.pending_verifications > 0 && (
              <Card className="mb-6 border-orange-300 bg-orange-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-orange-900">
                        {analytics.pending_verifications} Advocate{analytics.pending_verifications > 1 ? 's' : ''} Pending Verification
                      </h3>
                      <p className="text-sm text-orange-700">Review and approve new advocate registrations</p>
                    </div>
                    <Button
                      onClick={() => navigate('/admin/advocates?tab=pending')}
                      className="bg-orange-600 hover:bg-orange-700"
                      data-testid="review-pending-btn"
                    >
                      Review Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium opacity-90">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Users className="w-6 h-6" />
                    <p className="text-4xl font-bold">{analytics?.total_users || 0}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium opacity-90">Total Advocates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-6 h-6" />
                    <p className="text-4xl font-bold">{analytics?.total_advocates || 0}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium opacity-90">Total Calls</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Phone className="w-6 h-6" />
                    <p className="text-4xl font-bold">{analytics?.total_calls || 0}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium opacity-90">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6" />
                    <p className="text-4xl font-bold">{formatCurrency(analytics?.total_revenue || 0)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/advocates?tab=pending')}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-orange-600" />
                    <h3 className="font-semibold mb-2">Pending Verifications</h3>
                    <p className="text-sm text-gray-600">Approve or reject advocate applications</p>
                    <p className="text-3xl font-bold text-orange-600 mt-3">{analytics?.pending_verifications || 0}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/advocates')}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <UserCheck className="w-12 h-12 mx-auto mb-3 text-purple-600" />
                    <h3 className="font-semibold mb-2">Manage Advocates</h3>
                    <p className="text-sm text-gray-600">View and manage all advocates</p>
                    <p className="text-3xl font-bold text-purple-600 mt-3">{analytics?.total_advocates || 0}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/calls')}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Phone className="w-12 h-12 mx-auto mb-3 text-green-600" />
                    <h3 className="font-semibold mb-2">Call Logs</h3>
                    <p className="text-sm text-gray-600">Monitor all platform calls</p>
                    <p className="text-3xl font-bold text-green-600 mt-3">{analytics?.total_calls || 0}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
