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
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://customer-assets.emergentagent.com/job_formulaw-admin/artifacts/kwn9gg7f_1BE7EC66-F614-49CE-9066-FEEE09EE1754.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-amber-900/40"></div>
      </div>

      {/* Header Navigation */}
      <nav className="relative z-10 bg-gradient-to-r from-black/40 to-transparent backdrop-blur-sm border-b border-amber-900/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo - Left */}
            <div className="flex items-center gap-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_formulaw-admin/artifacts/40evjnjx_F8F86B73-D0A4-48D1-939C-FFE50AD8BAEC.jpeg" 
                alt="FormuLAW" 
                className="h-14 w-auto"
              />
            </div>
            
            {/* Navigation Links - Right */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#join" className="text-white/90 hover:text-amber-400 transition-colors text-sm font-medium">
                Join the Club
              </a>
              <a href="#about" className="text-white/90 hover:text-amber-400 transition-colors text-sm font-medium">
                About Us
              </a>
              <a href="#contact" className="text-white/90 hover:text-amber-400 transition-colors text-sm font-medium">
                Contact Us
              </a>
              <a 
                href="/advocate" 
                className="px-4 py-2 border border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-white rounded-lg transition-all text-sm font-medium"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto relative z-10 py-8 px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-light text-white mb-2">Join <span className="font-serif italic text-amber-400">FormuLAW</span></h2>
          <p className="text-white/80 font-light">Register as a legal professional</p>
        </div>

        <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-amber-800 to-amber-900 text-white pb-8">
            <CardTitle className="text-center text-2xl font-light tracking-wide">Professional Registration</CardTitle>
            <CardDescription className="text-amber-100 text-center font-light">Complete your advocate profile</CardDescription>
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
                className="w-full bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white py-6 text-lg font-medium tracking-wide shadow-lg"
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
          <p className="text-sm text-white/90">
            Already registered?{' '}
            <a href="/advocate" className="text-amber-400 hover:text-amber-300 font-semibold">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdvocateRegister;
