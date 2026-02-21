import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, Scale, Wallet, History, LogOut, Star, Phone, MapPin, Languages } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

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
  const { user, logout, axios } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'client') {
      navigate('/client');
      return;
    }
    fetchUtilityData();
    fetchWallet();
    fetchAdvocates();
  }, []);

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
    <div className="min-h-screen bg-[#f0f2f5]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-8 h-8 text-[#1877f2]" />
            <h1 className="text-2xl font-bold text-gray-900">FormuLAW</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/client/call-history')}
              data-testid="call-history-btn"
            >
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/client/wallet')}
              data-testid="wallet-btn"
            >
              <Wallet className="w-4 h-4 mr-2" />
              {formatCurrency(walletBalance)}
            </Button>
            <Button variant="ghost" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Find Legal Experts</h2>
          <p className="text-gray-600">Connect with verified advocates for legal consultation</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Law Type</label>
                <Select value={filters.law_type} onValueChange={(value) => setFilters({...filters, law_type: value})}>
                  <SelectTrigger data-testid="law-type-filter">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    {lawTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">City</label>
                <Select value={filters.city} onValueChange={(value) => setFilters({...filters, city: value})}>
                  <SelectTrigger data-testid="city-filter">
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
                <label className="text-sm font-medium mb-2 block">Language</label>
                <Select value={filters.language} onValueChange={(value) => setFilters({...filters, language: value})}>
                  <SelectTrigger data-testid="language-filter">
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
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select value={filters.sort_by} onValueChange={(value) => setFilters({...filters, sort_by: value})}>
                  <SelectTrigger data-testid="sort-filter">
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
            <p className="text-gray-500">Loading advocates...</p>
          </div>
        ) : advocates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No advocates available. Try changing filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advocates.map(advocate => (
              <Card key={advocate.id} className="hover:shadow-lg transition-shadow" data-testid={`advocate-card-${advocate.id}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {advocate.first_name} {advocate.last_name}
                      </h3>
                      <p className="text-sm text-gray-500">{advocate.fid}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{advocate.city}, {advocate.state}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Languages className="w-4 h-4" />
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
                      <Badge key={type} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <p className="text-2xl font-bold text-[#1877f2]">
                        {formatCurrency(advocate.per_minute_charge)}
                      </p>
                      <p className="text-xs text-gray-500">per minute</p>
                    </div>
                    <Button
                      className="bg-[#1877f2] hover:bg-[#166fe5]"
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
      </main>
    </div>
  );
};

export default ClientHome;
