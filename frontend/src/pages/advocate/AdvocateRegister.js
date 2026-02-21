import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2, Scale } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdvocateRegister = () => {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    bar_council_id: '',
    bar_council_issue_years: '',
    bar_council_issue_months: '',
    languages: [],
    law_types: [],
    working_hours: 'anytime',
    area: '',
    city: '',
    state: '',
    per_minute_charge: '25'
  });
  const [lawTypes, setLawTypes] = useState([]);
  const [cities, setCities] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUtilityData();
  }, []);

  const fetchUtilityData = async () => {
    try {
      const [lawTypesRes, citiesRes, languagesRes] = await Promise.all([
        axios.get(`${API}/utils/law-types`),
        axios.get(`${API}/utils/cities`),
        axios.get(`${API}/utils/languages`)
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

    if (formData.languages.length === 0) {
      toast.error('Please select at least one language');
      return;
    }
    if (formData.law_types.length === 0) {
      toast.error('Please select at least one law type');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/advocate/register`, {
        ...formData,
        bar_council_issue_years: parseInt(formData.bar_council_issue_years),
        bar_council_issue_months: parseInt(formData.bar_council_issue_months),
        per_minute_charge: parseFloat(formData.per_minute_charge)
      });
      
      toast.success(response.data.message);
      setTimeout(() => navigate('/advocate'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, #f0f2f5 0%, #e9ebee 100%)' }}>
      {/* Indian Flag Background - Fluttering */}
      <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0" 
          style={{
            background: 'linear-gradient(to bottom, #FF9933 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #138808 66.66%)',
            backgroundSize: '200% 100%',
            animation: 'flutter 4s ease-in-out infinite'
          }}
        ></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-8 border-blue-800 rounded-full opacity-20"></div>
      </div>

      <style>{`
        @keyframes flutter {
          0%, 100% { 
            transform: perspective(400px) rotateY(0deg) translateX(0);
            background-position: 0% 0%;
          }
          25% { 
            transform: perspective(400px) rotateY(-5deg) translateX(-10px);
            background-position: -5% 0%;
          }
          50% { 
            transform: perspective(400px) rotateY(0deg) translateX(0);
            background-position: 0% 0%;
          }
          75% { 
            transform: perspective(400px) rotateY(5deg) translateX(10px);
            background-position: 5% 0%;
          }
        }
      `}</style>

      {/* Header with Logo and Tagline */}
      <div className="relative z-10 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo - Left */}
          <div className="flex items-center">
            <img 
              src="https://customer-assets.emergentagent.com/job_formulaw-admin/artifacts/6g8uyqyo_6CA97F72-C87A-4CE5-89BD-678CA36A468C.jpeg" 
              alt="FormuLAW Logo" 
              className="h-16 w-auto"
            />
          </div>
          
          {/* Tagline - Right */}
          <div className="text-right">
            <h1 className="text-2xl md:text-3xl font-bold text-[#1877f2] leading-tight">Legal help made simple</h1>
            <p className="text-sm md:text-base text-gray-600 font-medium mt-1">Say it • Seek it • Sorted</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto relative z-10 py-8 px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Join FormuLAW</h2>
          <p className="text-gray-600 mt-2">Register as an Advocate</p>
        </div>

        <Card className="shadow-2xl border-2 border-gray-200">
          <CardHeader className="bg-gradient-to-r from-[#1877f2] to-[#166fe5] text-white">
            <CardTitle className="text-center text-2xl">Advocate Registration</CardTitle>
            <CardDescription className="text-gray-100 text-center">Fill in your details to register as an advocate</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      required
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      data-testid="first-name-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      required
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      data-testid="last-name-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      data-testid="email-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone_number">Phone Number *</Label>
                    <Input
                      id="phone_number"
                      type="tel"
                      required
                      value={formData.phone_number}
                      onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                      data-testid="phone-input"
                    />
                  </div>
                </div>
              </div>

              {/* Bar Council Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Bar Council Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bar_council_id">Bar Council ID *</Label>
                    <Input
                      id="bar_council_id"
                      required
                      value={formData.bar_council_id}
                      onChange={(e) => setFormData({...formData, bar_council_id: e.target.value})}
                      data-testid="bar-council-id-input"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="years">Years *</Label>
                      <Input
                        id="years"
                        type="number"
                        min="0"
                        required
                        value={formData.bar_council_issue_years}
                        onChange={(e) => setFormData({...formData, bar_council_issue_years: e.target.value})}
                        data-testid="years-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="months">Months *</Label>
                      <Input
                        id="months"
                        type="number"
                        min="0"
                        max="11"
                        required
                        value={formData.bar_council_issue_months}
                        onChange={(e) => setFormData({...formData, bar_council_issue_months: e.target.value})}
                        data-testid="months-input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Professional Details</h3>
                
                <div>
                  <Label>Languages * (Select all that apply)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {languages.map(lang => (
                      <div key={lang} className="flex items-center space-x-2">
                        <Checkbox
                          id={`lang-${lang}`}
                          checked={formData.languages.includes(lang)}
                          onCheckedChange={() => handleCheckboxChange('languages', lang)}
                          data-testid={`lang-${lang}`}
                        />
                        <label htmlFor={`lang-${lang}`} className="text-sm">{lang}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Law Types / Specializations * (Select all that apply)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 max-h-60 overflow-y-auto">
                    {lawTypes.map(type => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`law-${type}`}
                          checked={formData.law_types.includes(type)}
                          onCheckedChange={() => handleCheckboxChange('law_types', type)}
                          data-testid={`law-${type}`}
                        />
                        <label htmlFor={`law-${type}`} className="text-sm">{type}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="working_hours">Working Hours *</Label>
                  <Select
                    value={formData.working_hours}
                    onValueChange={(value) => setFormData({...formData, working_hours: value})}
                  >
                    <SelectTrigger data-testid="working-hours-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anytime">Anytime</SelectItem>
                      <SelectItem value="9am_10pm">9 AM - 10 PM</SelectItem>
                      <SelectItem value="24_7">24/7</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Office Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="area">Area *</Label>
                    <Input
                      id="area"
                      required
                      value={formData.area}
                      onChange={(e) => setFormData({...formData, area: e.target.value})}
                      placeholder="e.g., Saket"
                      data-testid="area-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Select
                      value={formData.city}
                      onValueChange={(value) => setFormData({...formData, city: value})}
                    >
                      <SelectTrigger data-testid="city-select">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      placeholder="e.g., Delhi"
                      data-testid="state-input"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Consultation Charges</h3>
                <div>
                  <Label htmlFor="per_minute_charge">Per Minute Charge (₹) *</Label>
                  <Input
                    id="per_minute_charge"
                    type="number"
                    min="1"
                    required
                    value={formData.per_minute_charge}
                    onChange={(e) => setFormData({...formData, per_minute_charge: e.target.value})}
                    data-testid="charge-input"
                  />
                  <p className="text-sm text-gray-500 mt-1">Recommendation for freshers: ₹25/min</p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#1877f2] hover:bg-[#166fe5] text-white py-6 text-lg font-semibold"
                disabled={loading}
                data-testid="register-submit-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already registered?{' '}
            <a href="/advocate" className="text-[#1877f2] hover:underline font-semibold">
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdvocateRegister;
