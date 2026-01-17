/**
 * GarageHubPage - Wired with Supabase Hooks
 * 
 * Uses: useGarages, useRepairBids, useRole, useAnalytics
 */

import { useState, useEffect } from 'react';
import { GarageCard } from './GarageCard';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { ViewToggle } from './ui/ViewToggle';
import { Search, MapPin, Wrench, Star, Plus, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

// Import Supabase hooks
import { useGarages, useBidRepair, useRole, useAnalytics } from '../hooks';

interface GarageHubPageProps {
  onNavigate?: (page: string) => void;
}

export function GarageHubPage({ onNavigate }: GarageHubPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 🔥 SUPABASE HOOKS
  const { garages, loading, error, createGarage, refetch } = useGarages({
    services: selectedService !== 'all' ? [selectedService] : undefined,
    minRating: selectedRating !== 'all' ? parseFloat(selectedRating) : undefined,
  });
  
  const { bids, createRepairBid } = useBidRepair();
  const { profile, isAdmin } = useRole();
  const analytics = useAnalytics();

  // Track page view
  useEffect(() => {
    analytics.trackPageView('/garage-hub');
  }, []);

  const locations = ['all', 'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah'];
  
  const services = [
    'all',
    'Oil Change',
    'Brake Service',
    'Tire Service',
    'Engine Diagnostics',
    'AC Repair',
    'Battery Service',
    'General Maintenance',
    'Body Work',
    'Paint Work',
    'Detailing'
  ];

  const ratings = [
    { value: 'all', label: 'All Ratings' },
    { value: '4.5', label: '4.5+ Stars' },
    { value: '4.0', label: '4.0+ Stars' },
    { value: '3.5', label: '3.5+ Stars' },
  ];

  // Client-side filtering
  const filteredGarages = garages.filter(garage => {
    if (searchQuery && !garage.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedLocation !== 'all' && garage.address && !garage.address.includes(selectedLocation)) {
      return false;
    }
    return true;
  });

  const handleCreateBid = async (description: string) => {
    const { data, error } = await createRepairBid({
      description,
      photos: [],
      vehicle: {},
      status: 'open',
    });

    if (!error && data) {
      toast.success('Repair bid created!');
      analytics.trackBidCreated(data.id, '');
      onNavigate?.('repair-bid');
    } else {
      toast.error('Failed to create repair bid');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1426]">
      {/* Header */}
      <div className="bg-[#0F1829] border-b border-[#1A2332]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl text-[#E8EAED] mb-2">Garage Hub</h1>
              <p className="text-sm text-[#8B92A7]">
                {loading ? 'Loading...' : `${filteredGarages.length} garages found`}
              </p>
            </div>
            
            {profile && (
              <Button
                onClick={() => onNavigate?.('repair-bid')}
                className="bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426] gap-2"
              >
                <Plus size={20} />
                Request Repair Bid
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B92A7]" size={20} />
              <Input
                placeholder="Search garages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1A2332] border-[#2A3342] text-[#E8EAED]"
              />
            </div>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-40 bg-[#1A2332] border-[#2A3342] text-[#E8EAED]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A2332] border-[#2A3342]">
                {locations.map(loc => (
                  <SelectItem key={loc} value={loc} className="text-[#E8EAED]">
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger className="w-48 bg-[#1A2332] border-[#2A3342] text-[#E8EAED]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A2332] border-[#2A3342]">
                {services.map(service => (
                  <SelectItem key={service} value={service} className="text-[#E8EAED]">
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRating} onValueChange={setSelectedRating}>
              <SelectTrigger className="w-40 bg-[#1A2332] border-[#2A3342] text-[#E8EAED]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A2332] border-[#2A3342]">
                {ratings.map(rating => (
                  <SelectItem key={rating.value} value={rating.value} className="text-[#E8EAED]">
                    {rating.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mb-4" />
            <p className="text-[#8B92A7]">Loading garages...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="bg-red-500/10 border-red-500">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <X className="text-red-400 mt-1" size={20} />
                <div>
                  <h3 className="text-red-400 font-semibold mb-1">Error Loading Garages</h3>
                  <p className="text-sm text-red-300">{error.message}</p>
                  <Button
                    onClick={() => refetch()}
                    variant="outline"
                    size="sm"
                    className="mt-3 border-red-400 text-red-400 hover:bg-red-400/10"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && filteredGarages.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔧</div>
            <h3 className="text-xl text-[#E8EAED] mb-2">No garages found</h3>
            <p className="text-[#8B92A7] mb-6">
              Try adjusting your filters or search query
            </p>
          </div>
        )}

        {/* Garages Grid/List */}
        {!loading && !error && filteredGarages.length > 0 && (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {filteredGarages.map((garage) => (
              <GarageCard
                key={garage.id}
                garage={{
                  id: garage.id,
                  name: garage.name,
                  rating: garage.rating,
                  location: garage.address || '',
                  services: garage.services || [],
                  specialties: [],
                  yearsOfService: 0,
                  responseTime: '< 24h',
                  verified: true,
                  image: '',
                  contact: {
                    phone: garage.phone,
                    email: garage.email,
                    whatsapp: garage.phone,
                  },
                }}
                onClick={() => analytics.trackEvent('garage_clicked', { garage_id: garage.id })}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
