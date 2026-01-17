import { useState, useEffect } from 'react';
import { GarageCard } from './GarageCard';
import { GarageDetailModal } from './GarageDetailModal';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ViewToggle } from './ui/ViewToggle';
import { FeaturedRibbon } from './ui/FeaturedRibbon';
import { BoostPlansModal } from './ui/BoostPlansModal';
import { FeaturedBadge } from './ui/FeaturedBadge';
import { useRole } from '../hooks/useRole';
import { supabase } from '@/lib/supabase';
import { 
  Search, 
  MapPin, 
  Wrench, 
  Clock, 
  Star, 
  Users, 
  Plus,
  Building,
  Shield,
  Award,
  Phone,
  Globe,
  Camera,
  CheckCircle,
  Upload,
  Link2,
  Zap,
  TrendingUp,
  List
} from 'lucide-react';

interface GarageHubPageProps {
  onNavigate?: (page: string) => void;
}

export function GarageHubPage({ onNavigate }: GarageHubPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [showAddGarageModal, setShowAddGarageModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  const [selectedGarageId, setSelectedGarageId] = useState<string | null>(null);
  
  // 🔥 REAL DATA FROM DATABASE (not mock)
  const { role, isGarageOwner, loading: roleLoading } = useRole();
  
  const [garages, setGarages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load garages from database
  useEffect(() => {
    loadGarages();
  }, [selectedLocation, selectedService]);
  
  const loadGarages = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('garages')
        .select('*')
        .eq('status', 'approved')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (selectedLocation !== 'all') {
        query = query.eq('location', selectedLocation);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setGarages(data || []);
    } catch (error) {
      console.error('Error loading garages:', error);
      toast.error('Failed to load garages');
    } finally {
      setLoading(false);
    }
  };
  
  // Form state
  const [formData, setFormData] = useState({
    garageName: '',
    description: '',
    yearsOfService: '',
    emirate: '',
    address: '',
    mobile: '+971',
    whatsapp: '+971',
    email: '',
    website: '',
    services: [] as string[],
    brands: [] as string[],
    autoFillUrl: '',
    workingDays: '',
    teamSize: '',
    emergencyService: false,
    pickupService: false,
    warrantyPeriod: '',
    openingHours: '',
    priceRange: ''
  });

  const locations = ['all', 'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain'];
  const services = [
    'all', 'Oil Change', 'Brake Repair', 'Engine Diagnostic', 'Transmission', 
    'AC Repair', 'Body Work', 'Paint Job', 'Tire Service', 'Electrical'
  ];

  // Services offered options from screenshot
  const serviceOptions = [
    'EV Service',
    'Hybrid Service', 
    'Diagnostics',
    'Tires',
    'AC Service',
    'Body Work',
    'Paint',
    'Software Updates',
    'Tuning',
    'General Maintenance',
    'Warranty Service',
    'Mechanical'
  ];

  // Brand specializations from screenshot
  const brandOptions = [
    'Avatr', 'Baic', 'Bestune',
    'BYD', 'Changan', 'Chery', 
    'Dongfeng', 'Exeed', 'Forthing',
    'Foton', 'Gac', 'Geely',
    'Great Wall', 'Haval', 'Hongqi'
  ];

  const sampleGarages = [
    {
      id: '1',
      name: 'BYD Excellence Center',
      logo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=50&h=50&fit=crop&crop=face',
      location: 'Dubai',
      address: 'Al Quoz Industrial Area 3, Workshop 24-A, Dubai',
      rating: 4.8,
      reviewCount: 127,
      isVerified: true,
      isPremium: true,
      featured: true,
      openingHours: '8AM - 8PM',
      workingDays: 'Sunday to Thursday',
      phone: '+971 4 321 7890',
      whatsapp: '+971 50 123 4567',
      email: 'info@bydexcellence.ae',
      website: 'www.bydexcellence.ae',
      services: ['EV Service', 'Engine Diagnostic', 'Transmission', 'Brake Repair', 'Oil Change', 'AC Repair', 'Software Updates', 'Battery Diagnostics'],
      specialties: ['BYD', 'MG', 'Haval', 'Geely', 'Chery', 'Great Wall'],
      priceRange: 'AED 200-500',
      responseTime: '&lt; 2 hours',
      completedJobs: 89,
      description: 'Leading BYD service center in Dubai with certified technicians specializing in Chinese electric and hybrid vehicles. We offer comprehensive diagnostics, repairs, and maintenance services with genuine parts and advanced equipment.',
      yearsOfService: 8,
      teamSize: 12,
      certifications: ['BYD Certified', 'EV Specialist', 'ISO 9001'],
      emergencyService: true,
      pickupService: true,
      warrantyPeriod: '6 months',
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1581579352451-416db0e8a84b?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=400&fit=crop'
      ]
    },
    {
      id: '2',
      name: 'EV Care Sharjah Center',
      logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
      location: 'Sharjah',
      address: 'Industrial Area 6, Street 19, Sharjah',
      rating: 4.7,
      reviewCount: 84,
      isVerified: true,
      isPremium: false,
      featured: false,
      openingHours: '9AM - 7PM',
      workingDays: 'Saturday to Thursday',
      phone: '+971 6 555 2468',
      whatsapp: '+971 55 987 6543',
      email: 'service@evcareservice.com',
      website: 'www.evcareservice.com',
      services: ['EV Service', 'Battery Diagnostics', 'Charging System', 'Software Updates', 'AC Repair', 'Electrical', 'Hybrid Service'],
      specialties: ['NIO', 'XPeng', 'Li Auto', 'Avatr', 'Zeekr', 'BYD'],
      priceRange: 'AED 300-800',
      responseTime: '&lt; 3 hours',
      completedJobs: 67,
      description: 'Specialized EV service center focusing on advanced Chinese electric vehicles. Our technicians are trained on the latest EV technology and use state-of-the-art diagnostic equipment for accurate troubleshooting.',
      yearsOfService: 5,
      teamSize: 8,
      certifications: ['EV Certified', 'NIO Authorized', 'Electrical Safety'],
      emergencyService: false,
      pickupService: true,
      warrantyPeriod: '3 months',
      images: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1581092787765-e3c4f9a7b5a1?w=600&h=400&fit=crop'
      ]
    },
    {
      id: '3',
      name: 'Chinese Auto Specialists',
      logo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
      location: 'Abu Dhabi',
      address: 'Mussafah Industrial Area, M-35, Abu Dhabi',
      rating: 4.9,
      reviewCount: 156,
      isVerified: true,
      isPremium: true,
      featured: true,
      openingHours: '8AM - 8PM',
      workingDays: 'Sunday to Friday',
      phone: '+971 2 987 1234',
      whatsapp: '+971 50 789 0123',
      email: 'contact@chineseautospecialists.ae',
      website: 'www.chineseautospecialists.ae',
      services: ['Engine Diagnostic', 'Body Work', 'Paint Job', 'Electrical', 'Transmission', 'General Maintenance', 'Mechanical', 'Tuning'],
      specialties: ['BYD', 'Geely', 'Changan', 'JAC', 'Dongfeng', 'Chery', 'Haval', 'Great Wall'],
      priceRange: 'AED 250-600',
      responseTime: '&lt; 1 hour',
      completedJobs: 123,
      description: 'Premium automotive service center with over a decade of experience servicing Chinese vehicles. We offer comprehensive mechanical, electrical, and body work services with experienced technicians and quality parts.',
      yearsOfService: 12,
      teamSize: 18,
      certifications: ['Multi-Brand Certified', 'Paint & Body Expert', 'Engine Specialist', 'ISO 14001'],
      emergencyService: true,
      pickupService: true,
      warrantyPeriod: '12 months',
      images: [
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1581092804919-8cf7d8173d15?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=600&h=400&fit=crop'
      ]
    }
  ];

  const filteredGarages = sampleGarages.filter(garage => {
    if (selectedLocation !== 'all' && garage.location !== selectedLocation) return false;
    if (searchQuery && !garage.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedService !== 'all' && !garage.services.some(service => 
      service.toLowerCase().includes(selectedService.toLowerCase())
    )) return false;
    if (selectedRating !== 'all') {
      const minRating = parseFloat(selectedRating.replace('+', ''));
      if (garage.rating < minRating) return false;
    }
    return true;
  });

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service) 
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleBrandToggle = (brand: string) => {
    setFormData(prev => ({
      ...prev,
      brands: prev.brands.includes(brand) 
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand]
    }));
  };

  const handleQuickImport = () => {
    // Mock auto-fill functionality
    if (formData.autoFillUrl) {
      setFormData(prev => ({
        ...prev,
        garageName: 'Elite Auto Services',
        description: 'Professional automotive repair and maintenance services specializing in Chinese electric and hybrid vehicles.',
        yearsOfService: '8',
        emirate: 'Dubai',
        address: 'Al Quoz Industrial Area 3, Workshop 15, Dubai',
        mobile: '+971501234567',
        whatsapp: '+971501234567',
        email: 'info@eliteautoservices.ae',
        website: 'www.eliteautoservices.ae',
        services: ['EV Service', 'Diagnostics', 'AC Service', 'General Maintenance'],
        brands: ['BYD', 'Geely', 'Chery', 'Haval'],
        workingDays: 'Sunday to Thursday',
        teamSize: '10',
        emergencyService: true,
        pickupService: true,
        warrantyPeriod: '6 months',
        openingHours: '8AM - 6PM',
        priceRange: 'AED 200-400'
      }));
    }
  };

  const GarageRegistrationForm = () => (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      {/* Auto-fill URL Section */}
      <div className="p-4 border-2 border-dashed border-[var(--sublimes-gold)] rounded-lg bg-[var(--sublimes-gold)]/5">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-5 w-5 text-[var(--sublimes-gold)]" />
          <Label className="font-semibold">Paste a link to auto-fill</Label>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="https://dubizzle.com/your-garage-listing"
              value={formData.autoFillUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, autoFillUrl: e.target.value }))}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={handleQuickImport}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            Quick Import
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="garageName">Garage Name *</Label>
              <Input 
                id="garageName" 
                placeholder="Enter garage name"
                value={formData.garageName}
                onChange={(e) => setFormData(prev => ({ ...prev, garageName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="yearsOfService">Years of Service</Label>
              <Input 
                id="yearsOfService" 
                placeholder="e.g., 5"
                value={formData.yearsOfService}
                onChange={(e) => setFormData(prev => ({ ...prev, yearsOfService: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="teamSize">Team Size</Label>
              <Input 
                id="teamSize" 
                placeholder="Number of technicians"
                value={formData.teamSize}
                onChange={(e) => setFormData(prev => ({ ...prev, teamSize: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="warrantyPeriod">Warranty Period</Label>
              <Select value={formData.warrantyPeriod} onValueChange={(value) => setFormData(prev => ({ ...prev, warrantyPeriod: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select warranty period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 month">1 Month</SelectItem>
                  <SelectItem value="3 months">3 Months</SelectItem>
                  <SelectItem value="6 months">6 Months</SelectItem>
                  <SelectItem value="12 months">12 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="garageDescription">About Your Garage *</Label>
            <Textarea 
              id="garageDescription" 
              placeholder="Describe your garage, specialties, and experience..."
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Select emirate</Label>
              <Select value={formData.emirate} onValueChange={(value) => setFormData(prev => ({ ...prev, emirate: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select emirate" />
                </SelectTrigger>
                <SelectContent>
                  {locations.slice(1).map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address" 
                placeholder="Full address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="openingHours">Opening Hours</Label>
              <Input 
                id="openingHours" 
                placeholder="e.g., 8AM - 6PM"
                value={formData.openingHours}
                onChange={(e) => setFormData(prev => ({ ...prev, openingHours: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="workingDays">Working Days</Label>
              <Input 
                id="workingDays" 
                placeholder="e.g., Sunday to Thursday"
                value={formData.workingDays}
                onChange={(e) => setFormData(prev => ({ ...prev, workingDays: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="priceRange">Price Range</Label>
            <Select value={formData.priceRange} onValueChange={(value) => setFormData(prev => ({ ...prev, priceRange: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select typical price range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AED 100-300">AED 100-300 (Budget)</SelectItem>
                <SelectItem value="AED 200-500">AED 200-500 (Standard)</SelectItem>
                <SelectItem value="AED 400-800">AED 400-800 (Premium)</SelectItem>
                <SelectItem value="AED 600-1200">AED 600-1200 (Luxury)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Services Offered */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Services Offered</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {serviceOptions.map(service => (
              <div key={service} className="flex items-center space-x-2">
                <Checkbox 
                  id={service}
                  checked={formData.services.includes(service)}
                  onCheckedChange={() => handleServiceToggle(service)}
                />
                <Label htmlFor={service} className="text-sm cursor-pointer">{service}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Brand Specializations */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Brand Specializations</h3>
          <div className="grid grid-cols-3 gap-3">
            {brandOptions.map(brand => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox 
                  id={brand}
                  checked={formData.brands.includes(brand)}
                  onCheckedChange={() => handleBrandToggle(brand)}
                />
                <Label htmlFor={brand} className="text-sm cursor-pointer">{brand}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Contact Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mobile">Mobile Number *</Label>
              <Input 
                id="mobile" 
                placeholder="+971501234567"
                value={formData.mobile}
                onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input 
                id="whatsapp" 
                placeholder="+971501234567"
                value={formData.whatsapp}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                placeholder="garage@example.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="website">Website (Optional)</Label>
              <Input 
                id="website" 
                placeholder="www.yourgarage.com"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Additional Services */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Additional Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="emergencyService"
                checked={formData.emergencyService}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, emergencyService: !!checked }))}
              />
              <Label htmlFor="emergencyService" className="cursor-pointer">24/7 Emergency Service</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="pickupService"
                checked={formData.pickupService}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, pickupService: !!checked }))}
              />
              <Label htmlFor="pickupService" className="cursor-pointer">Vehicle Pickup & Drop Service</Label>
            </div>
          </div>
        </div>

        {/* Images Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Images (Optional)</h3>
          
          {/* Logo Upload */}
          <div>
            <Label className="text-sm font-medium">Logo</Label>
            <div className="mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-[var(--sublimes-gold)] transition-colors cursor-pointer">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Click to upload logo</p>
              <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
            </div>
          </div>

          {/* Banner Image Upload */}
          <div>
            <Label className="text-sm font-medium">Banner Image</Label>
            <div className="mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-[var(--sublimes-gold)] transition-colors cursor-pointer">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Click to upload banner</p>
              <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
            </div>
          </div>

          {/* Gallery Images Upload */}
          <div>
            <Label className="text-sm font-medium">Gallery Images (up to 10)</Label>
            <div className="mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-[var(--sublimes-gold)] transition-colors cursor-pointer">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Click to upload gallery images</p>
              <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB each</p>
            </div>
          </div>
        </div>

        {/* Verification Process Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-semibold text-sm mb-2 flex items-center">
            <Shield className="h-4 w-4 mr-2 text-blue-500" />
            Verification Process
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Submit trade license and insurance documents</li>
            <li>• Physical verification visit by our team</li>
            <li>• Complete profile review (2-3 business days)</li>
            <li>• Get verified badge and start receiving requests</li>
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-background">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => setShowAddGarageModal(false)}
        >
          Cancel
        </Button>
        <Button 
          className="flex-1 bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80"
          onClick={() => {
            setShowAddGarageModal(false);
            // Handle form submission
            console.log('Form data:', formData);
          }}
        >
          Pay & Continue
        </Button>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-4 md:px-6 py-4">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  <Wrench className="h-6 w-6 text-[var(--sublimes-gold)] flex-shrink-0" />
                  <span>Garage Hub</span>
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Verified service providers for Chinese cars (IC + EV)
                </p>
              </div>
              <Dialog open={showAddGarageModal} onOpenChange={setShowAddGarageModal}>
                <DialogTrigger asChild>
                  <Button className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80 shrink-0 ml-4">
                    <Plus className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Add Your Garage</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-[var(--sublimes-gold)]" />
                      Add Your Garage
                    </DialogTitle>
                    <DialogDescription>
                      Register your garage with Sublimes Drive to connect with Chinese car owners and expand your business.
                    </DialogDescription>
                  </DialogHeader>
                  <GarageRegistrationForm />
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Mobile-friendly stats */}
            <div className="grid grid-cols-2 md:flex md:items-center gap-3 md:gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building className="h-3 w-3" />
                3 garages
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                3 verified
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                2 EV specialists
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                4.7 avg rating
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-6">
        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            {/* Mobile-first layout */}
            <div className="space-y-3">
              {/* Search bar - full width on mobile */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search garages, services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters in grid - 2 columns on mobile, all in row on desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Emirates" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>
                        {location === 'all' ? 'All Emirates' : location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Services" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map(service => (
                      <SelectItem key={service} value={service}>
                        {service === 'all' ? 'All Services' : service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedRating} onValueChange={setSelectedRating}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Ratings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="4.5+">4.5+ Stars</SelectItem>
                    <SelectItem value="4.0+">4.0+ Stars</SelectItem>
                    <SelectItem value="3.5+">3.5+ Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Garage Owner Info */}
        {userRole === 'garage-owner' && (
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold mb-1">Welcome, Garage Owner!</h3>
                  <p className="text-sm opacity-90">
                    Manage your garage profile and track your performance in the directory.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto"
                    onClick={() => onNavigate?.('profile')}
                  >
                    <Building className="h-4 w-4 mr-2" />
                    My Profile
                  </Button>
                  {/* Only show upgrade if not verified - assuming garage owners start unverified */}
                  {!garageOwnerVerified && (
                    <Button 
                      size="sm"
                      className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80 w-full sm:w-auto"
                      onClick={() => onNavigate?.('verify-garage-owner')}
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Upgrade
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Building className="h-6 w-6 mx-auto mb-2 text-[var(--sublimes-gold)]" />
              <p className="text-xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">Total Garages</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Shield className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="text-xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">Verified</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <p className="text-xl font-bold">&lt; 2h</p>
              <p className="text-sm text-muted-foreground">Avg Response</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
              <p className="text-xl font-bold">4.8</p>
              <p className="text-sm text-muted-foreground">Avg Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Featured Garages Ribbon */}
        {filteredGarages.filter(g => g.featured).length > 0 && (
          <FeaturedRibbon 
            items={filteredGarages.filter(g => g.featured).map(garage => ({
              id: garage.id,
              title: garage.name,
              image: garage.images[0],
              type: 'garage' as const,
              views: Math.floor(Math.random() * 200) + 50,
              likes: Math.floor(Math.random() * 30) + 5
            }))}
            title="Featured Garages"
            onItemClick={(item) => {
              const garage = filteredGarages.find(g => g.id === item.id);
              if (garage) {
                setSelectedGarageId(garage.id);
              }
            }}
          />
        )}

        {/* Garage Listings */}
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">
                  Verified Garages ({filteredGarages.length})
                </h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Sorted by distance</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end gap-3">
                <ViewToggle view={viewMode} onViewChange={setViewMode} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBoostModalOpen(true)}
                  className="whitespace-nowrap"
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Boost Garage</span>
                  <span className="sm:hidden">Boost</span>
                </Button>
              </div>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid gap-4">
              {filteredGarages.map((garage) => (
                <GarageCard key={garage.id} garage={garage} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGarages.map((garage) => (
                <GarageCard key={garage.id} garage={garage} variant="list" />
              ))}
            </div>
          )}

          {filteredGarages.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No garages found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or location
                </p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedLocation('all');
                    setSelectedService('all');
                    setSelectedRating('all');
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Call to Action for Non-Garage Owners */}
        {userRole !== 'garage-owner' && (
          <Card className="bg-gradient-to-r from-[var(--sublimes-gold)] to-yellow-500 text-black border-none">
            <CardContent className="p-6 text-center">
              <Building className="h-8 w-8 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Own a Garage?</h3>
              <p className="mb-4 opacity-90">
                Join our verified network and connect with Chinese car owners across the UAE
              </p>
              <Dialog open={showAddGarageModal} onOpenChange={setShowAddGarageModal}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="bg-white text-black hover:bg-gray-100">
                    <Plus className="h-4 w-4 mr-2" />
                    Register Your Garage
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Boost Plans Modal */}
      <BoostPlansModal
        isOpen={isBoostModalOpen}
        onClose={() => setIsBoostModalOpen(false)}
        type="garage"
        onSelectPlan={(plan) => {
          console.log('Selected boost plan:', plan);
          setIsBoostModalOpen(false);
        }}
      />

      {/* Featured Garage Detail Modal */}
      {selectedGarageId && (
        <GarageDetailModal
          isOpen={!!selectedGarageId}
          onClose={() => setSelectedGarageId(null)}
          garage={sampleGarages.find(g => g.id === selectedGarageId)!}
        />
      )}
    </div>
  );
}