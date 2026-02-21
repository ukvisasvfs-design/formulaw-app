import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ArrowLeft, UserCheck, CheckCircle, XCircle, Eye, Star, MapPin } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const AdminAdvocates = () => {
  const [advocates, setAdvocates] = useState([]);
  const [pendingAdvocates, setPendingAdvocates] = useState([]);
  const [selectedAdvocate, setSelectedAdvocate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const { axios, user } = useAuth();
  const navigate = useNavigate();

  const defaultTab = searchParams.get('tab') || 'all';

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin');
      return;
    }
    fetchAdvocates();
  }, []);

  const fetchAdvocates = async () => {
    try {
      const [allRes, pendingRes] = await Promise.all([
        axios.get('/admin/advocates'),
        axios.get('/admin/advocates/pending')
      ]);
      setAdvocates(allRes.data);
      setPendingAdvocates(pendingRes.data);
    } catch (error) {
      toast.error('Failed to fetch advocates');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (advocateId, status) => {
    try {
      await axios.put(`/admin/advocates/${advocateId}/verify`, { status });
      toast.success(`Advocate ${status} successfully!`);
      setSelectedAdvocate(null);
      fetchAdvocates();
    } catch (error) {
      toast.error('Failed to update verification status');
    }
  };

  const AdvocateCard = ({ advocate, showActions = false }) => (
    <Card key={advocate.id} data-testid={`advocate-${advocate.id}`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg">
              {advocate.first_name} {advocate.last_name}
            </h3>
            <p className="text-sm text-gray-600">{advocate.fid}</p>
            <p className="text-sm text-gray-500">{advocate.email}</p>
          </div>
          <Badge className={
            advocate.verification_status === 'approved'
              ? 'bg-green-100 text-green-800'
              : advocate.verification_status === 'rejected'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }>
            {advocate.verification_status}
          </Badge>
        </div>

        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{advocate.city}, {advocate.state}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>{advocate.average_rating.toFixed(1)} ({advocate.total_cases} cases)</span>
          </div>
          <p><strong>Bar Council ID:</strong> {advocate.bar_council_id}</p>
          <p><strong>Experience:</strong> {advocate.bar_council_issue_years}y {advocate.bar_council_issue_months}m</p>
          <p><strong>Phone:</strong> {advocate.phone_number}</p>
          <p><strong>Registered:</strong> {formatDate(advocate.created_at)}</p>
        </div>

        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAdvocate(advocate)}
                data-testid={`view-details-${advocate.id}`}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Advocate Details</DialogTitle>
              </DialogHeader>
              {selectedAdvocate && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Personal Information</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p><strong>Name:</strong> {selectedAdvocate.first_name} {selectedAdvocate.last_name}</p>
                      <p><strong>FID:</strong> {selectedAdvocate.fid}</p>
                      <p><strong>Email:</strong> {selectedAdvocate.email}</p>
                      <p><strong>Phone:</strong> {selectedAdvocate.phone_number}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Professional Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p><strong>Bar Council ID:</strong> {selectedAdvocate.bar_council_id}</p>
                      <p><strong>Experience:</strong> {selectedAdvocate.bar_council_issue_years}y {selectedAdvocate.bar_council_issue_months}m</p>
                      <p><strong>Working Hours:</strong> {selectedAdvocate.working_hours}</p>
                      <p><strong>Charge:</strong> ₹{selectedAdvocate.per_minute_charge}/min</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Location</h4>
                    <p className="text-sm">{selectedAdvocate.area}, {selectedAdvocate.city}, {selectedAdvocate.state}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Languages</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAdvocate.languages.map(lang => (
                        <Badge key={lang} variant="outline">{lang}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Specializations</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAdvocate.law_types.map(type => (
                        <Badge key={type} variant="outline">{type}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Statistics</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p><strong>Rating:</strong> {selectedAdvocate.average_rating.toFixed(1)}/5</p>
                      <p><strong>Total Cases:</strong> {selectedAdvocate.total_cases}</p>
                      <p><strong>Status:</strong> {selectedAdvocate.duty_status ? 'Online' : 'Offline'}</p>
                      <p><strong>Verification:</strong> {selectedAdvocate.verification_status}</p>
                    </div>
                  </div>

                  {showActions && selectedAdvocate.verification_status === 'pending' && (
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => handleVerification(selectedAdvocate.id, 'rejected')}
                        data-testid="reject-btn"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleVerification(selectedAdvocate.id, 'approved')}
                        data-testid="approve-btn"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                    </DialogFooter>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {showActions && advocate.verification_status === 'pending' && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={() => handleVerification(advocate.id, 'rejected')}
                data-testid={`reject-${advocate.id}`}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleVerification(advocate.id, 'approved')}
                data-testid={`approve-${advocate.id}`}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Advocate Management</h2>
          <p className="text-gray-600">Verify and manage advocate accounts</p>
        </div>

        <Tabs defaultValue={defaultTab}>
          <TabsList>
            <TabsTrigger value="all" data-testid="all-tab">All Advocates ({advocates.length})</TabsTrigger>
            <TabsTrigger value="pending" data-testid="pending-tab">
              Pending Verification ({pendingAdvocates.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {loading ? (
              <p className="text-center py-8">Loading...</p>
            ) : advocates.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No advocates yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {advocates.map(advocate => (
                  <AdvocateCard key={advocate.id} advocate={advocate} showActions={false} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            {loading ? (
              <p className="text-center py-8">Loading...</p>
            ) : pendingAdvocates.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No pending verifications</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingAdvocates.map(advocate => (
                  <AdvocateCard key={advocate.id} advocate={advocate} showActions={true} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminAdvocates;
