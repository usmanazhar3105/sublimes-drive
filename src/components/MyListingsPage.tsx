import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Eye, 
  Trash2, 
  Zap, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Star,
  TrendingUp,
  MoreVertical,
  RefreshCw
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { BoostPlansModal } from './ui/BoostPlansModal';
import { FeaturedBadge } from './ui/FeaturedBadge';
import { BoostTimer } from './ui/BoostTimer';
import { toast } from 'sonner';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  type: 'marketplace' | 'garage';
  status: 'active' | 'pending' | 'rejected' | 'draft' | 'expired';
  boostStatus: 'none' | 'active' | 'pending' | 'expired';
  boostExpiresAt?: Date;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  views: number;
  inquiries: number;
  saves: number;
  baseFee: number;
  boostFee?: number;
  totalFee: number;
  paymentStatus: 'paid' | 'pending' | 'failed';
  adminNotes?: string;
  boostType?: string;
  boostDuration?: number;
  featuredUntil?: Date;
}

interface MyListingsPageProps {
  onNavigate?: (page: string, data?: any) => void;
}

export function MyListingsPage({ onNavigate }: MyListingsPageProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [selectedListingForBoost, setSelectedListingForBoost] = useState<Listing | null>(null);

  // Mock listings data
  const [listings, setListings] = useState<Listing[]>([
    {
      id: 'listing-1',
      title: 'NIO ES8 2023 - Premium Electric SUV',
      description: 'Exceptional condition, low mileage, fully loaded with premium features',
      price: 285000,
      currency: 'AED',
      category: 'Electric SUV',
      type: 'marketplace',
      status: 'active',
      boostStatus: 'active',
      boostExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop'],
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      views: 1247,
      inquiries: 23,
      saves: 89,
      baseFee: 52.5,
      boostFee: 149,
      totalFee: 201.5,
      paymentStatus: 'paid',
      boostType: 'Category Top',
      boostDuration: 14,
      featuredUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'listing-2',
      title: 'BMW M4 Competition 2022',
      description: 'Track-ready performance, excellent condition, recent service',
      price: 420000,
      currency: 'AED',
      category: 'Sports Car',
      type: 'marketplace',
      status: 'active',
      boostStatus: 'none',
      images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop'],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      views: 456,
      inquiries: 8,
      saves: 34,
      baseFee: 52.5,
      totalFee: 52.5,
      paymentStatus: 'paid'
    },
    {
      id: 'listing-3',
      title: 'Elite Auto Service - Premium Car Care',
      description: 'Professional automotive services, certified technicians, quality guaranteed',
      price: 0,
      currency: 'AED',
      category: 'Maintenance & Repair',
      type: 'garage',
      status: 'pending',
      boostStatus: 'pending',
      images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      views: 0,
      inquiries: 0,
      saves: 0,
      baseFee: 105,
      boostFee: 249,
      totalFee: 354,
      paymentStatus: 'paid',
      boostType: 'City Top',
      boostDuration: 14,
      adminNotes: 'Under verification review'
    },
    {
      id: 'listing-4',
      title: 'Porsche 911 Carrera S 2021',
      description: 'Immaculate condition, low miles, dealer maintained',
      price: 650000,
      currency: 'AED',
      category: 'Sports Car',
      type: 'marketplace',
      status: 'rejected',
      boostStatus: 'none',
      images: ['https://images.unsplash.com/photo-1544829099-b9a0c5303bea?w=400&h=300&fit=crop'],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      views: 234,
      inquiries: 3,
      saves: 12,
      baseFee: 52.5,
      totalFee: 52.5,
      paymentStatus: 'paid',
      adminNotes: 'Images need to be higher quality'
    },
    {
      id: 'listing-5',
      title: 'Tesla Model Y Performance',
      description: 'Latest model, autopilot, premium interior',
      price: 325000,
      currency: 'AED',
      category: 'Electric SUV',
      type: 'marketplace',
      status: 'active',
      boostStatus: 'expired',
      images: ['https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&h=300&fit=crop'],
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      views: 892,
      inquiries: 15,
      saves: 67,
      baseFee: 52.5,
      boostFee: 99,
      totalFee: 151.5,
      paymentStatus: 'paid',
      boostType: 'Market Top',
      boostDuration: 7
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'draft':
        return <Edit className="h-4 w-4 text-gray-500" />;
      case 'expired':
        return <Clock className="h-4 w-4 text-gray-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'expired':
        return 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-500';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getBoostStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-[var(--sublimes-gold)]/20 text-[var(--sublimes-gold)] border-[var(--sublimes-gold)]/30';
      case 'pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-300';
      case 'expired':
        return 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-500 border-gray-300';
      default:
        return '';
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
    const matchesType = typeFilter === 'all' || listing.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const listingCounts = {
    all: listings.length,
    active: listings.filter(l => l.status === 'active').length,
    pending: listings.filter(l => l.status === 'pending').length,
    boosted: listings.filter(l => l.boostStatus === 'active').length
  };

  const handleBoostListing = (listing: Listing) => {
    setSelectedListingForBoost(listing);
    setShowBoostModal(true);
  };

  const handleBoostPlanSelect = (plan: any) => {
    if (selectedListingForBoost) {
      // Navigate to payment page with boost data
      onNavigate?.('stripe-payment', {
        type: 'boost',
        listingId: selectedListingForBoost.id,
        listingTitle: selectedListingForBoost.title,
        plan: plan,
        amount: plan.price,
        currency: plan.currency
      });
      setShowBoostModal(false);
      setSelectedListingForBoost(null);
    }
  };

  const handleEditListing = (listing: Listing) => {
    if (listing.type === 'marketplace') {
      onNavigate?.('create-car-listing', { editMode: true, listingData: listing });
    } else {
      onNavigate?.('garage-hub', { editMode: true, listingData: listing });
    }
  };

  const handleViewListing = (listing: Listing) => {
    if (listing.type === 'marketplace') {
      onNavigate?.('marketplace', { viewListing: listing.id });
    } else {
      onNavigate?.('garage-hub', { viewListing: listing.id });
    }
  };

  const handleDeleteListing = (listingId: string) => {
    setListings(prev => prev.filter(l => l.id !== listingId));
    toast.success('✅ Listing deleted successfully');
  };

  const handleRenewBoost = (listing: Listing) => {
    handleBoostListing(listing);
  };

  const totalEarnings = listings
    .filter(l => l.status === 'active')
    .reduce((sum, l) => sum + (l.price * 0.02), 0); // Assume 2% commission earned

  const totalSpent = listings.reduce((sum, l) => sum + l.totalFee, 0);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-[var(--sublimes-gold)]" />
                My Listings
              </h1>
              <p className="text-sm text-muted-foreground">Manage your marketplace and garage listings</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => onNavigate?.('garage-hub')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Garage Service
              </Button>
              <Button 
                className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80"
                onClick={() => onNavigate?.('create-car-listing')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Listing
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[var(--sublimes-gold)]">{listingCounts.all}</div>
              <div className="text-sm text-muted-foreground">Total Listings</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500">{listingCounts.active}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">{listingCounts.boosted}</div>
              <div className="text-sm text-muted-foreground">Boosted</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-500">AED {totalSpent.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Invested</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="marketplace">Marketplace</SelectItem>
              <SelectItem value="garage">Garage</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({listingCounts.all})</TabsTrigger>
            <TabsTrigger value="active">Active ({listingCounts.active})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({listingCounts.pending})</TabsTrigger>
            <TabsTrigger value="boosted">Boosted ({listingCounts.boosted})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="space-y-4">
              {filteredListings.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No listings found</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first listing to start selling or promoting your services!
                    </p>
                    <div className="space-x-2">
                      <Button 
                        className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80"
                        onClick={() => onNavigate?.('create-car-listing')}
                      >
                        Create Car Listing
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => onNavigate?.('garage-hub')}
                      >
                        Add Garage Service
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                filteredListings.map((listing) => (
                  <Card key={listing.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="relative">
                          <ImageWithFallback 
                            src={listing.images[0]} 
                            alt={listing.title}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                          {listing.boostStatus === 'active' && (
                            <FeaturedBadge className="absolute -top-2 -right-2" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{listing.title}</h3>
                                <Badge className={`capitalize ${getStatusColor(listing.status)}`}>
                                  {getStatusIcon(listing.status)}
                                  <span className="ml-1">{listing.status}</span>
                                </Badge>
                                {listing.boostStatus !== 'none' && (
                                  <Badge className={`capitalize ${getBoostStatusColor(listing.boostStatus)}`}>
                                    <Zap className="h-3 w-3 mr-1" />
                                    {listing.boostStatus}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{listing.description}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Category: {listing.category}</span>
                                <span>Type: {listing.type.charAt(0).toUpperCase() + listing.type.slice(1)}</span>
                                <span>Created: {listing.createdAt.toLocaleDateString()}</span>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              {listing.price > 0 && (
                                <div className="text-xl font-bold text-[var(--sublimes-gold)] mb-1">
                                  {listing.price.toLocaleString()} {listing.currency}
                                </div>
                              )}
                              <div className="text-sm text-muted-foreground">
                                Fees: {listing.totalFee} AED
                              </div>
                            </div>
                          </div>

                          {/* Boost Timer */}
                          {listing.boostStatus === 'active' && listing.boostExpiresAt && (
                            <div className="mb-4">
                              <BoostTimer 
                                expiresAt={listing.boostExpiresAt}
                                boostType={listing.boostType || ''}
                              />
                            </div>
                          )}

                          {/* Performance Metrics */}
                          <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-500">{listing.views.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">Views</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-500">{listing.inquiries}</div>
                              <div className="text-xs text-muted-foreground">Inquiries</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-purple-500">{listing.saves}</div>
                              <div className="text-xs text-muted-foreground">Saves</div>
                            </div>
                          </div>

                          {/* Admin Notes */}
                          {listing.adminNotes && (
                            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                <strong>Admin Notes:</strong> {listing.adminNotes}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewListing(listing)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              
                              {(listing.status === 'active' || listing.status === 'draft') && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditListing(listing)}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                              )}

                              {listing.status === 'active' && listing.boostStatus === 'none' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-[var(--sublimes-gold)] border-[var(--sublimes-gold)] hover:bg-[var(--sublimes-gold)]/10"
                                  onClick={() => handleBoostListing(listing)}
                                >
                                  <Zap className="h-4 w-4 mr-1" />
                                  Boost
                                </Button>
                              )}

                              {listing.boostStatus === 'expired' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-[var(--sublimes-gold)] border-[var(--sublimes-gold)] hover:bg-[var(--sublimes-gold)]/10"
                                  onClick={() => handleRenewBoost(listing)}
                                >
                                  <RefreshCw className="h-4 w-4 mr-1" />
                                  Renew Boost
                                </Button>
                              )}
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewListing(listing)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {(listing.status === 'active' || listing.status === 'draft') && (
                                  <DropdownMenuItem onClick={() => handleEditListing(listing)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Listing
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteListing(listing.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Boost Plans Modal */}
      <BoostPlansModal
        isOpen={showBoostModal}
        onClose={() => {
          setShowBoostModal(false);
          setSelectedListingForBoost(null);
        }}
        onSelectPlan={handleBoostPlanSelect}
        entityType={selectedListingForBoost?.type || 'marketplace'}
        isVerified={true}
      />
    </div>
  );
}