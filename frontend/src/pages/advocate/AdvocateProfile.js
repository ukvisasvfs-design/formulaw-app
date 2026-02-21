import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';

const AdvocateProfile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [lawTypes, setLawTypes] = useState([]);
  const [cities, setCities] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { axios, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'advocate') {
      navigate('/advocate');
      return;
    }
    fetchProfile();
    fetchUtilityData();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/advocate/profile');
      setProfile(response.data);
      setFormData({
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        phone_number: response.data.phone_number,
        languages: response.data.languages,
        law_types: response.data.law_types,
        working_hours: response.data.working_hours,
        area: response.data.area,
        city: response.data.city,
        state: response.data.state,
        per_minute_charge: response.data.per_minute_charge
      });
    } catch (error) {
      toast.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUtilityData = async () => {
    try {
      const [lawTypesRes, citiesRes, languagesRes] = await Promise.all([
        axios.get('/utils/law-types'),
        axios.get('/utils/cities'),
        axios.get('/utils/languages')
      ]);
      setLawTypes(lawTypesRes.data.law_types);
      setCities(citiesRes.data.cities);
      setLanguages(languagesRes.data.languages);
    } catch (error) {
      console.error('Failed to fetch utility data:', error);
    }
  };

  const handleCheckboxChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put('/advocate/profile', formData);
      toast.success('Profile updated successfully!');
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
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
            <CardTitle>Advocate Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Read-only fields */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="text-sm text-gray-600">FormuLAW ID: <span className="font-semibold">{profile?.fid}</span></p>
                <p className="text-sm text-gray-600">Email: <span className="font-semibold">{profile?.email}</span></p>
                <p className="text-sm text-gray-600">Bar Council ID: <span className="font-semibold">{profile?.bar_council_id}</span></p>
                <p className="text-sm text-gray-600">Experience: <span className="font-semibold">{profile?.bar_council_issue_years} years {profile?.bar_council_issue_months} months</span></p>
                <p className="text-sm text-gray-600">Verification: <span className="font-semibold capitalize">{profile?.verification_status}</span></p>
              </div>

              {/* Editable fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="per_minute_charge">Per Minute Charge (₹)</Label>
                  <Input
                    id="per_minute_charge"
                    type="number"
                    value={formData.per_minute_charge}
                    onChange={(e) => setFormData({...formData, per_minute_charge: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <Label>Languages</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {languages.map(lang => (
                    <div key={lang} className="flex items-center space-x-2">
                      <Checkbox
                        id={`lang-${lang}`}
                        checked={formData.languages?.includes(lang)}
                        onCheckedChange={() => handleCheckboxChange('languages', lang)}
                      />
                      <label htmlFor={`lang-${lang}`} className="text-sm">{lang}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Law Types / Specializations</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 max-h-60 overflow-y-auto">
                  {lawTypes.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`law-${type}`}
                        checked={formData.law_types?.includes(type)}
                        onCheckedChange={() => handleCheckboxChange('law_types', type)}
                      />
                      <label htmlFor={`law-${type}`} className="text-sm">{type}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="working_hours">Working Hours</Label>
                <Select
                  value={formData.working_hours}
                  onValueChange={(value) => setFormData({...formData, working_hours: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anytime">Anytime</SelectItem>
                    <SelectItem value="9am_10pm">9 AM - 10 PM</SelectItem>
                    <SelectItem value="24_7">24/7</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="area">Area</Label>
                  <Input
                    id="area"
                    value={formData.area}
                    onChange={(e) => setFormData({...formData, area: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => setFormData({...formData, city: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#1877f2] hover:bg-[#166fe5]"
                disabled={saving}
                data-testid="save-profile-btn"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvocateProfile;
