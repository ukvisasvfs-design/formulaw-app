/**
 * Client Profile Page
 * Allows users to view and update their profile information
 * 
 * Features:
 * - View profile details (name, email, phone, city)
 * - Update profile information
 * - Change notification preferences
 * 
 * @author FormuLAW Team
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, User, Mail, Phone, MapPin, Save } from 'lucide-react';

const ClientProfile = () => {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone_number: '',
    city: ''
  });
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // ============================================
  // HOOKS
  // ============================================
  const { user, axios, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // ============================================
  // EFFECTS
  // ============================================
  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'client') {
      navigate('/client');
      return;
    }
    fetchProfile();
    fetchCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  // ============================================
  // API CALLS
  // ============================================
  
  /**
   * Fetch user profile from backend
   */
  const fetchProfile = async () => {
    try {
      const response = await axios.get('/auth/me');
      setProfile({
        name: response.data.name || '',
        email: response.data.email || '',
        phone_number: response.data.phone_number || '',
        city: response.data.city || ''
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch list of cities for dropdown
   */
  const fetchCities = async () => {
    try {
      const response = await axios.get('/utils/cities');
      setCities(response.data.cities);
    } catch (error) {
      console.error('Failed to fetch cities:', error);
    }
  };

  /**
   * Save profile changes to backend
   */
  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put('/client/profile', {
        name: profile.name,
        phone_number: profile.phone_number,
        city: profile.city
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (authLoading || loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div 
          className="fixed inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://customer-assets.emergentagent.com/job_formulaw-admin/artifacts/kwn9gg7f_1BE7EC66-F614-49CE-9066-FEEE09EE1754.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-amber-900/40"></div>
        </div>
        <p className="relative z-10 text-white text-xl">Loading...</p>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://customer-assets.emergentagent.com/job_formulaw-admin/artifacts/kwn9gg7f_1BE7EC66-F614-49CE-9066-FEEE09EE1754.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-amber-900/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/client/home')}
          className="text-white hover:bg-white/10 mb-6"
          data-testid="back-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Profile Card */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
              <User className="w-6 h-6 text-amber-700" />
              My Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2 text-gray-700">
                <User className="w-4 h-4" />
                Full Name
              </Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Enter your full name"
                className="border-gray-300"
                data-testid="profile-name-input"
              />
            </div>

            {/* Email Field (Read Only) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-gray-700">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <Input
                id="email"
                value={profile.email}
                disabled
                className="border-gray-300 bg-gray-100"
                data-testid="profile-email-input"
              />
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2 text-gray-700">
                <Phone className="w-4 h-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                value={profile.phone_number}
                onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                placeholder="+91 XXXXX XXXXX"
                className="border-gray-300"
                data-testid="profile-phone-input"
              />
            </div>

            {/* City Field */}
            <div className="space-y-2">
              <Label htmlFor="city" className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-4 h-4" />
                City
              </Label>
              <Select 
                value={profile.city || "select"} 
                onValueChange={(value) => setProfile({ ...profile, city: value === "select" ? "" : value })}
              >
                <SelectTrigger data-testid="profile-city-select" className="border-gray-300">
                  <SelectValue placeholder="Select your city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select">Select your city</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white"
              data-testid="profile-save-btn"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-black/60 backdrop-blur-md border-t border-amber-900/30 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-white/60 text-xs">
              © 2026 All rights reserved. FormuLAW - Legal Consultation Platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ClientProfile;
