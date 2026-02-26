import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Phone, Star } from 'lucide-react';
import { formatCurrency, formatDate, formatDuration } from '../../lib/utils';

const AdvocateCallHistory = () => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const { axios, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'advocate') {
      navigate('/advocate');
      return;
    }
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      const response = await axios.get('/advocate/call-history');
      setCalls(response.data);
    } catch (error) {
      toast.error('Failed to fetch call history');
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

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/advocate/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Call History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8">Loading...</p>
            ) : calls.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No calls yet</p>
            ) : (
              <div className="space-y-4">
                {calls.map(call => (
                  <div key={call.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">Consultation Call</p>
                        <p className="text-sm text-gray-500">{formatDate(call.created_at)}</p>
                      </div>
                      {getStatusBadge(call.status)}
                    </div>

                    {call.duration_minutes && (
                      <div className="flex items-center justify-between text-sm mt-3 pt-3 border-t">
                        <div>
                          <p className="text-gray-600">Duration: {formatDuration(call.duration_minutes)}</p>
                          <p className="text-gray-600">Rate: {formatCurrency(call.cost_per_minute)}/min</p>
                        </div>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(call.total_cost || 0)}
                        </p>
                      </div>
                    )}

                    {call.rating && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm">Client rated: {call.rating}/5</span>
                        </div>
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

export default AdvocateCallHistory;
