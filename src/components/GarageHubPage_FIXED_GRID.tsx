/**
 * GarageHubPage - FIXED Grid View (More Compact)
 * 
 * Changes:
 * - 4 columns on desktop (instead of 3)
 * - More compact card layout
 * - Reduced spacing
 */

import { useState, useEffect } from 'react';
import { GarageCard } from './GarageCard';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { ViewToggle } from './ui/ViewToggle';
import { Search, MapPin, Wrench, Star, Plus, Loader2, X, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';

// Import Supabase hooks
import { useGarages, useRole, useAnalytics } from '../hooks';

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
  const { garages = [], loading, error, createGarage, refetch } = useGarages({
    services: selectedService !== 'all' ? [selectedService] : undefined,
    minRating: selectedRating !== 'all' ? parseFloat(selectedRating) : undefined,
  }) || { garages: [], loading: false, error: null };
  
  const { profile, isAdmin } = useRole() || { profile: null, isAdmin: false };
  const analytics = useAnalytics() || { trackPageView: () => {}, trackEvent: () => {} };

  // Track page view
  useEffect(() => {
    if (analytics?.trackPageView) {
      analytics.trackPageView('/garage-hub');
    }
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

  return (
    <div className="min-h-screen bg-[#0B1426] pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-[#0F1829] border-b border-[#1A2332] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl text-[#E8EAED] mb-2">Garage Hub</h1>
              <p className="text-sm text-[#8B92A7]">
                {loading ? 'Loading...' : `${filteredGarages.length} garages found`}
              </p>
            </div>
            
            {profile && (
              <Button
                onClick={() => onNavigate?.('repair-bid')}
                className="bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426] gap-2 w-full md:w-auto"
              >
                <Plus size={20} />
                Request Repair Bid
              </Button>
            )}
          </div>

          {/* Filters - Mobile Responsive */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B92A7]" size={20} />
              <Input
                placeholder="Search garages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1A2332] border-[#2A3342] text-[#E8EAED]"
              />
            </div>

            <div className="grid grid-cols-2 md:flex gap-3">
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="bg-[#1A2332] border-[#2A3342] text-[#E8EAED]">
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
                <SelectTrigger className="bg-[#1A2332] border-[#2A3342] text-[#E8EAED]">
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
                <SelectTrigger className="bg-[#1A2332] border-[#2A3342] text-[#E8EAED]">
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
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
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

        {/* Garages Grid/List - FIXED: 4 columns on desktop */}
        {!loading && !error && filteredGarages.length > 0 && (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5'
              : 'space-y-4'
          }>
            {filteredGarages.map((garage) => (
              <GarageCard
                key={garage.id}
                garage={{
                  id: garage.id,
                  name: garage.name,
                  logo: '',
                  location: garage.address?.split(',')[0] || '',
                  address: garage.address || '',
                  rating: garage.rating || 4.5,
                  reviewCount: garage.review_count || 0,
                  isVerified: garage.verified || true,
                  isPremium: garage.premium || false,
                  featured: garage.featured || false,
                  openingHours: garage.hours || '9AM - 6PM',
                  phone: garage.phone || '',
                  whatsapp: garage.phone || '',
                  email: garage.email || '',
                  website: '',
                  services: garage.services || [],
                  specialties: garage.specialties || [],
                  priceRange: '$$',
                  responseTime: '< 24h',
                  completedJobs: 100,
                  images: [garage.image || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800'],
                  description: garage.description || '',
                  yearsOfService: 5,
                  certifications: [],
                  teamSize: 10,
                  workingDays: 'Mon-Sat',
                  emergencyService: false,
                  pickupService: false,
                  warrantyPeriod: '3 months',
                }}
                variant={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
