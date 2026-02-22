import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, Wallet, History, LogOut, Star, Phone, MapPin, Languages, User, ChevronDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ClientHome = () => {
  const [advocates, setAdvocates] = useState([]);
  const [lawTypes, setLawTypes] = useState([]);
  const [cities, setCities] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [filters, setFilters] = useState({
    law_type: '',
    city: '',
    language: '',
    sort_by: 'newest'
  });
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const { user, logout, axios, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    if (!user || user.role !== 'client') {
      navigate('/client');
      return;
    }
    fetchUtilityData();
    fetchWallet();
    fetchAdvocates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  useEffect(() => {
    if (user) {
      fetchAdvocates();
    }
  }, [filters]);

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

  const fetchWallet = async () => {
    try {
      const response = await axios.get('/client/wallet');
      setWalletBalance(response.data.balance);
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    }
  };

  const fetchAdvocates = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.law_type) params.law_type = filters.law_type;
      if (filters.city) params.city = filters.city;
      if (filters.language) params.language = filters.language;
      if (filters.sort_by) params.sort_by = filters.sort_by;

      const response = await axios.get('/client/advocates', { params });
      setAdvocates(response.data);
    } catch (error) {
      toast.error('Failed to fetch advocates');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Background Image with Overlay */}
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

      {/* Header Navigation */}
      <nav className="relative z-10 bg-gradient-to-r from-black/60 to-transparent backdrop-blur-md border-b border-amber-900/30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo - Left */}
            <img 
              src="https://customer-assets.emergentagent.com/job_formulaw-admin/artifacts/40evjnjx_F8F86B73-D0A4-48D1-939C-FFE50AD8BAEC.jpeg" 
              alt="FormuLAW" 
              className="h-12 w-auto object-contain filter brightness-110 contrast-110 drop-shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
              onClick={() => navigate('/client/home')}
            />
            
            {/* Navigation - Right */}
            <div className="flex items-center gap-4">
              {/* Wallet Button */}
              <Button
                variant="outline"
                onClick={() => navigate('/client/wallet')}
                className="bg-white/10 border-amber-600/50 text-white hover:bg-white/20 hover:text-amber-300"
                data-testid="wallet-btn"
              >
                <Wallet className="w-4 h-4 mr-2" />
                {formatCurrency(walletBalance)}
              </Button>

              {/* Call History Button */}
              <Button
                variant="outline"
                onClick={() => navigate('/client/call-history')}
                className="bg-white/10 border-amber-600/50 text-white hover:bg-white/20 hover:text-amber-300"
                data-testid="call-history-btn"
              >
                <History className="w-4 h-4 mr-2" />
                History
              </Button>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="bg-white/10 border-amber-600/50 text-white hover:bg-white/20 hover:text-amber-300"
                    data-testid="profile-dropdown-btn"
                  >
                    <User className="w-4 h-4 mr-2" />
                    {user?.name || user?.email?.split('@')[0] || 'Profile'}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/client/profile')} data-testid="profile-menu-item">
                    <User className="w-4 h-4 mr-2" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/client/wallet')} data-testid="wallet-menu-item">
                    <Wallet className="w-4 h-4 mr-2" />
                    Wallet
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/client/call-history')} data-testid="history-menu-item">
                    <History className="w-4 h-4 mr-2" />
                    Call History
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600" data-testid="logout-menu-item">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Welcome Section with Tagline */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 text-2xl md:text-3xl mb-4">
              <span className="text-purple-400 font-bold animate-pulse" style={{ color: '#A78BFA' }}>Say it</span>
              <span className="text-purple-300" style={{ color: '#C4B5FD' }}>•</span>
              <span className="text-purple-400 font-bold animate-pulse" style={{ color: '#A78BFA', animationDelay: '0.2s' }}>Seek it</span>
              <span className="text-purple-300" style={{ color: '#C4B5FD' }}>•</span>
              <span className="text-purple-400 font-bold animate-pulse" style={{ color: '#A78BFA', animationDelay: '0.4s' }}>Sorted</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-light text-white mb-2">Find Your Legal Expert</h2>
            <p className="text-white/70">Connect with verified advocates for professional legal consultation</p>
          </div>

          {/* Filters Card */}
          <Card className="mb-8 bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700">Law Type</label>
                  <Select value={filters.law_type} onValueChange={(value) => setFilters({...filters, law_type: value})}>
                    <SelectTrigger data-testid="law-type-filter" className="border-gray-300">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      {lawTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700">City</label>
                  <Select value={filters.city} onValueChange={(value) => setFilters({...filters, city: value})}>
                    <SelectTrigger data-testid="city-filter" className="border-gray-300">
                      <SelectValue placeholder="All Cities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Cities</SelectItem>
                      {cities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700">Language</label>
                  <Select value={filters.language} onValueChange={(value) => setFilters({...filters, language: value})}>
                    <SelectTrigger data-testid="language-filter" className="border-gray-300">
                      <SelectValue placeholder="All Languages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Languages</SelectItem>
                      {languages.map(lang => (
                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700">Sort By</label>
                  <Select value={filters.sort_by} onValueChange={(value) => setFilters({...filters, sort_by: value})}>
                    <SelectTrigger data-testid="sort-filter" className="border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newly Registered</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="price_low">Price: Low to High</SelectItem>
                      <SelectItem value="price_high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advocates List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-white/70">Loading advocates...</p>
            </div>
          ) : advocates.length === 0 ? (
            <div className="text-center py-12">
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl max-w-md mx-auto">
                <CardContent className="pt-8 pb-8">
                  <Search className="w-16 h-16 mx-auto mb-4 text-amber-600/50" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No Advocates Available</h3>
                  <p className="text-gray-600">Try changing your filters to find available advocates.</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {advocates.map(advocate => (
                <Card 
                  key={advocate.id} 
                  className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]" 
                  data-testid={`advocate-card-${advocate.id}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">
                          {advocate.first_name} {advocate.last_name}
                        </h3>
                        <p className="text-sm text-amber-700 font-medium">{advocate.fid}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-300">Online</Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-amber-600" />
                        <span>{advocate.city}, {advocate.state}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Languages className="w-4 h-4 text-amber-600" />
                        <span>{advocate.languages.join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{advocate.average_rating.toFixed(1)}</span>
                        <span className="text-gray-500">({advocate.total_cases} cases)</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {advocate.law_types.slice(0, 3).map(type => (
                        <Badge key={type} variant="outline" className="text-xs border-amber-300 text-amber-800">
                          {type}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-2xl font-bold text-amber-700">
                          {formatCurrency(advocate.per_minute_charge)}
                        </p>
                        <p className="text-xs text-gray-500">per minute</p>
                      </div>
                      <Button
                        className="bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white shadow-lg"
                        onClick={() => navigate(`/client/advocate/${advocate.id}`)}
                        data-testid={`view-advocate-${advocate.id}`}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-black/60 backdrop-blur-md border-t border-amber-900/30 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="space-y-1">
              <a href="#about" className="block text-white/80 hover:text-amber-400 text-sm transition-colors">
                About Us
              </a>
              <a href="#contact" className="block text-white/80 hover:text-amber-400 text-sm transition-colors">
                Contact Us
              </a>
            </div>
            <div className="w-16 h-px bg-amber-600/50"></div>
            <p className="text-white/60 text-xs">
              © 2026 All rights reserved. FormuLAW - Legal Consultation Platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ClientHome;
