import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Phone, Star, MapPin, Languages, Briefcase, Clock, Award } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const ClientAdvocateProfile = () => {
  const { id } = useParams();
  const [advocate, setAdvocate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calling, setCalling] = useState(false);
  const { axios, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'client') {
      navigate('/client');
      return;
    }
    fetchAdvocate();
  }, [id]);

  const fetchAdvocate = async () => {
    try {
      const response = await axios.get(`/client/advocate/${id}`);
      setAdvocate(response.data);
    } catch (error) {
      toast.error('Failed to load advocate profile');
      navigate('/client/home');
    } finally {
      setLoading(false);
    }
  };

  const initiateCall = async () => {
    setCalling(true);
    try {
      const response = await axios.post('/client/initiate-call', {
        advocate_id: id
      });
      toast.success(response.data.message);
      // In production, this would connect the actual call via Twilio
      setTimeout(() => {
        navigate('/client/call-history');
      }, 2000);
    } catch (error) {
      if (error.response?.data?.detail?.includes('Insufficient wallet balance')) {
        toast.error('Insufficient balance. Redirecting to wallet...');
        setTimeout(() => navigate('/client/wallet'), 1500);
      } else {
        toast.error(error.response?.data?.detail || 'Failed to initiate call');
      }
    } finally {
      setCalling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!advocate) return null;

  const experience = advocate.bar_council_issue_years + (advocate.bar_council_issue_months / 12);

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/client/home')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search
        </Button>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {advocate.first_name} {advocate.last_name}
                </h1>
                <p className="text-gray-600 mb-2">{advocate.fid}</p>
                <Badge className="bg-green-100 text-green-800">Available Now</Badge>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-[#1877f2]">
                  {formatCurrency(advocate.per_minute_charge)}
                </p>
                <p className="text-sm text-gray-500">per minute</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{advocate.area}, {advocate.city}, {advocate.state}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Languages className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Languages</p>
                    <p className="font-medium">{advocate.languages.join(', ')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Bar Council ID</p>
                    <p className="font-medium">{advocate.bar_council_id}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="font-medium">{experience.toFixed(1)} years</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-500">Rating</p>
                    <p className="font-medium">{advocate.average_rating.toFixed(1)} / 5 ({advocate.total_cases} cases)</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Working Hours</p>
                    <p className="font-medium">
                      {advocate.working_hours === 'anytime' && 'Anytime'}
                      {advocate.working_hours === '9am_10pm' && '9 AM - 10 PM'}
                      {advocate.working_hours === '24_7' && '24/7'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Specializations</h3>
              <div className="flex flex-wrap gap-2">
                {advocate.law_types.map(type => (
                  <Badge key={type} variant="outline" className="px-3 py-1">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              className="w-full bg-[#1877f2] hover:bg-[#166fe5] text-white py-6 text-lg"
              onClick={initiateCall}
              disabled={calling}
              data-testid="initiate-call-btn"
            >
              <Phone className="w-5 h-5 mr-2" />
              {calling ? 'Connecting...' : 'Start Audio Call'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientAdvocateProfile;
