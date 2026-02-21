import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, TrendingUp, Wallet, DollarSign, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const AdvocateEarnings = () => {
  const [dashboard, setDashboard] = useState(null);
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const { axios, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'advocate') {
      navigate('/advocate');
      return;
    }
    fetchDashboard();
    fetchCalls();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get('/advocate/dashboard');
      setDashboard(response.data);
    } catch (error) {
      toast.error('Failed to fetch earnings');
    } finally {
      setLoading(false);
    }
  };

  const fetchCalls = async () => {
    try {
      const response = await axios.get('/advocate/call-history');
      const completedCalls = response.data.filter(c => c.status === 'completed');
      setCalls(completedCalls);
    } catch (error) {
      console.error('Failed to fetch calls:', error);
    }
  };

  const thisMonth = new Date().getMonth();
  const thisMonthEarnings = calls
    .filter(call => new Date(call.created_at).getMonth() === thisMonth)
    .reduce((sum, call) => sum + (call.total_cost || 0), 0);

  const avgCallDuration = calls.length > 0
    ? calls.reduce((sum, call) => sum + (call.duration_minutes || 0), 0) / calls.length
    : 0;

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/advocate/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {loading ? (
          <p className="text-center py-8">Loading...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium opacity-90">Total Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6" />
                    <p className="text-4xl font-bold">
                      {formatCurrency(dashboard?.total_earnings || 0)}
                    </p>
                  </div>
                  <p className="text-sm opacity-90 mt-2">All time</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium opacity-90">This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-6 h-6" />
                    <p className="text-4xl font-bold">
                      {formatCurrency(thisMonthEarnings)}
                    </p>
                  </div>
                  <p className="text-sm opacity-90 mt-2">{new Date().toLocaleString('default', { month: 'long' })}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium opacity-90">Wallet Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Wallet className="w-6 h-6" />
                    <p className="text-4xl font-bold">
                      {formatCurrency(dashboard?.wallet_balance || 0)}
                    </p>
                  </div>
                  <p className="text-sm opacity-90 mt-2">Available for payout</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-[#1877f2]">{dashboard?.total_cases || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Total Consultations</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-[#1877f2]">{avgCallDuration.toFixed(1)} min</p>
                    <p className="text-sm text-gray-600 mt-1">Avg Call Duration</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-[#1877f2]">{dashboard?.average_rating?.toFixed(1) || '0.0'}</p>
                    <p className="text-sm text-gray-600 mt-1">Average Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                {calls.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No completed calls yet</p>
                ) : (
                  <div className="space-y-3">
                    {calls.slice(0, 10).map(call => (
                      <div key={call.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Consultation</p>
                          <p className="text-sm text-gray-500">
                            {new Date(call.created_at).toLocaleDateString()} - {call.duration_minutes?.toFixed(1)} min
                          </p>
                        </div>
                        <p className="font-bold text-green-600">
                          +{formatCurrency(call.total_cost || 0)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default AdvocateEarnings;
