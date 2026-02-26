import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Phone, Star } from 'lucide-react';
import { formatCurrency, formatDate, formatDuration } from '../../lib/utils';

const AdminCalls = () => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const { axios, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin');
      return;
    }
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      const response = await axios.get('/admin/calls');
      setCalls(response.data);
    } catch (error) {
      toast.error('Failed to fetch call logs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      initiated: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>{status}</Badge>;
  };

  const totalRevenue = calls
    .filter(c => c.status === 'completed')
    .reduce((sum, c) => sum + (c.total_cost || 0), 0);

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Call Logs</h2>
          <p className="text-gray-600">Monitor all platform consultations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Calls</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">{calls.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {calls.filter(c => c.status === 'completed').length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[#1877f2]">
                {formatCurrency(totalRevenue)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              All Call Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8">Loading...</p>
            ) : calls.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No calls yet</p>
            ) : (
              <div className="space-y-3">
                {calls.map(call => (
                  <div key={call.id} className="p-4 bg-gray-50 rounded-lg" data-testid={`call-${call.id}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">Call ID: {call.id.substring(0, 8)}...</p>
                        <p className="text-sm text-gray-500">{formatDate(call.created_at)}</p>
                      </div>
                      {getStatusBadge(call.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mt-3 pt-3 border-t">
                      <div>
                        <p className="text-gray-600">Client ID: {call.client_id.substring(0, 8)}...</p>
                        <p className="text-gray-600">Advocate ID: {call.advocate_id.substring(0, 8)}...</p>
                      </div>
                      {call.duration_minutes && (
                        <div>
                          <p className="text-gray-600">Duration: {formatDuration(call.duration_minutes)}</p>
                          <p className="text-gray-600">Rate: {formatCurrency(call.cost_per_minute)}/min</p>
                        </div>
                      )}
                    </div>

                    {call.total_cost && (
                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        {call.rating && (
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm">Rating: {call.rating}/5</span>
                          </div>
                        )}
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(call.total_cost)}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCalls;
