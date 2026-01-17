/**
 * Admin Listing & Boost Management - Real Database Integration
 * Manages listing fees, durations, and boost packages with Supabase
 */

import { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Save, X, DollarSign, Calendar, Zap, Eye, Settings, Clock, Gift, Loader2, Download 
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface BoostPackage {
  id: string;
  name: string;
  duration: number;
  price: number;
  original_price?: number;
  features: string[];
  badge?: string;
  badge_color?: string;
  popular?: boolean;
  active: boolean;
  category: string;
  created_at?: string;
  updated_at?: string;
}

interface BoostRequest {
  id: string;
  user_id: string;
  listing_id: string;
  package_id: string;
  amount: number;
  status: string;
  created_at: string;
  user?: {
    display_name?: string;
    email?: string;
  };
  listing?: {
    title?: string;
    images?: string[];
  };
}

interface ListingStats {
  totalRevenue: number;
  activeBoosts: number;
  durationSettings: number;
  totalListings: number;
}

export function AdminListingBoost_Real() {
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('base-fees');
  const [boostPackages, setBoostPackages] = useState<BoostPackage[]>([]);
  const [boostRequests, setBoostRequests] = useState<BoostRequest[]>([]);
  const [stats, setStats] = useState<ListingStats>({
    totalRevenue: 0,
    activeBoosts: 0,
    durationSettings: 6,
    totalListings: 0,
  });
  const [editingPackage, setEditingPackage] = useState<BoostPackage | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchBoostPackages(),
        fetchBoostRequests(),
        fetchStats(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBoostPackages = async () => {
    try {
      // Try to fetch from boost_packages table first
      const { data, error } = await supabase
        .from('boost_packages')
        .select('*')
        .order('price', { ascending: true });

      if (!error && data && data.length > 0) {
        setBoostPackages(data.map((item: any) => ({
          id: item.id,
          name: item.name,
          duration: item.duration || 7,
          price: Number(item.price) || 0,
          original_price: item.original_price,
          features: item.features || [],
          badge: item.badge,
          badge_color: item.badge_color,
          popular: item.popular || false,
          active: item.active !== false,
          category: item.category || 'all',
          created_at: item.created_at,
          updated_at: item.updated_at,
        })));
        return;
      }

      // Fallback: Use default packages (stored in component for now)
      console.log('Using default boost packages');
      setBoostPackages([
        {
          id: 'default-1',
          name: '7-Day Boost',
          duration: 7,
          price: 50,
          original_price: 75,
          features: ['Top placement for 7 days', 'Featured badge', '2x visibility'],
          badge: 'Basic',
          badge_color: 'blue',
          popular: false,
          active: true,
          category: 'all',
        },
        {
          id: 'default-2',
          name: '14-Day Boost',
          duration: 14,
          price: 90,
          original_price: 150,
          features: ['Top placement for 14 days', 'Featured badge', '3x visibility', 'Priority support'],
          badge: 'Popular',
          badge_color: 'gold',
          popular: true,
          active: true,
          category: 'all',
        },
        {
          id: 'default-3',
          name: '30-Day Boost',
          duration: 30,
          price: 150,
          original_price: 225,
          features: ['Top placement for 30 days', 'Premium badge', '5x visibility', 'Priority support', 'Social media promotion'],
          badge: 'Premium',
          badge_color: 'purple',
          popular: false,
          active: true,
          category: 'all',
        },
      ]);
    } catch (error) {
      console.error('Error fetching boost packages:', error);
      // Set default packages on error
      setBoostPackages([]);
    }
  };

  const fetchBoostRequests = async () => {
    try {
      // Step 1: Fetch marketplace listings that are boosted (without FK join)
      const { data: listingsData, error: listingsError } = await supabase
        .from('marketplace_listings')
        .select(`
          id,
          user_id,
          title,
          images,
          thumbnail_url,
          is_boosted,
          boost_package,
          boost_expires_at,
          boost_payment_id,
          created_at
        `)
        .eq('is_boosted', true)
        .order('created_at', { ascending: false });

      if (listingsError) {
        console.error('Error fetching boost requests:', listingsError);
        return;
      }

      // Step 2: Get unique user IDs and fetch profiles separately
      const userIds = [...new Set((listingsData || []).map(l => l.user_id).filter(Boolean))];
      let profilesMap: Record<string, { display_name?: string; email?: string }> = {};

      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .in('id', userIds);

        if (profilesData) {
          profilesMap = profilesData.reduce((acc, profile) => {
            acc[profile.id] = { display_name: profile.display_name, email: profile.email };
            return acc;
          }, {} as Record<string, { display_name?: string; email?: string }>);
        }
      }

      // Step 3: Transform to BoostRequest format
      const requests: BoostRequest[] = (listingsData || []).map((item: any) => {
        const isExpired = item.boost_expires_at && new Date(item.boost_expires_at) < new Date();
        return {
          id: item.id,
          user_id: item.user_id,
          listing_id: item.id,
          package_id: item.boost_package || '',
          amount: item.boost_package === 'premium' ? 150 : item.boost_package === 'featured' ? 90 : 50,
          status: isExpired ? 'expired' : 'active',
          created_at: item.created_at,
          user: profilesMap[item.user_id] || { display_name: 'Unknown User', email: '' },
          listing: {
            title: item.title || 'Untitled Listing',
            images: item.images,
          },
        };
      });

      setBoostRequests(requests);
    } catch (error) {
      console.error('Error fetching boost requests:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Get total revenue from wallet_transactions (boost payments)
      const { data: revenueData } = await supabase
        .from('wallet_transactions')
        .select('amount')
        .eq('status', 'completed')
        .or('type.eq.boost,description.ilike.%boost%');

      const totalRevenue = (revenueData || []).reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

      // Get active boosts count
      const { count: activeBoosts } = await supabase
        .from('marketplace_listings')
        .select('id', { count: 'exact', head: true })
        .eq('is_boosted', true)
        .gt('boost_expires_at', new Date().toISOString());

      // Get total listings this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: totalListings } = await supabase
        .from('marketplace_listings')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      setStats({
        totalRevenue: totalRevenue || 0,
        activeBoosts: activeBoosts || 0,
        durationSettings: 6,
        totalListings: totalListings || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const createBoostPackage = async (packageData: Partial<BoostPackage>) => {
    try {
      const { data, error } = await supabase
        .from('boost_packages')
        .insert({
          name: packageData.name,
          description: `${packageData.duration}-day boost package`,
          duration: packageData.duration,
          price: packageData.price,
          original_price: packageData.original_price,
          currency: 'AED',
          active: packageData.active ?? true,
          features: packageData.features || [],
          badge: packageData.badge,
          badge_color: packageData.badge_color,
          popular: packageData.popular || false,
          category: packageData.category || 'all',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Boost package created successfully');
      fetchBoostPackages();
      setShowCreateModal(false);
    } catch (error: any) {
      console.error('Error creating boost package:', error);
      toast.error(error.message || 'Failed to create boost package');
    }
  };

  const updateBoostPackage = async (packageId: string, updates: Partial<BoostPackage>) => {
    try {
      // Skip if it's a default package (not in DB)
      if (packageId.startsWith('default-')) {
        toast.info('Default packages cannot be edited. Create a new package instead.');
        setEditingPackage(null);
        return;
      }

      const { error } = await supabase
        .from('boost_packages')
        .update({
          name: updates.name,
          duration: updates.duration,
          price: updates.price,
          original_price: updates.original_price,
          active: updates.active,
          features: updates.features,
          badge: updates.badge,
          badge_color: updates.badge_color,
          popular: updates.popular,
          category: updates.category,
          updated_at: new Date().toISOString(),
        })
        .eq('id', packageId);

      if (error) throw error;

      toast.success('Boost package updated successfully');
      fetchBoostPackages();
      setEditingPackage(null);
    } catch (error: any) {
      console.error('Error updating boost package:', error);
      toast.error(error.message || 'Failed to update boost package');
    }
  };

  const deleteBoostPackage = async (packageId: string) => {
    // Skip if it's a default package
    if (packageId.startsWith('default-')) {
      toast.info('Default packages cannot be deleted.');
      return;
    }

    if (!confirm('Are you sure you want to delete this boost package?')) return;

    try {
      const { error } = await supabase
        .from('boost_packages')
        .delete()
        .eq('id', packageId);

      if (error) throw error;

      toast.success('Boost package deleted');
      fetchBoostPackages();
    } catch (error: any) {
      console.error('Error deleting boost package:', error);
      toast.error(error.message || 'Failed to delete boost package');
    }
  };

  const exportBoostData = () => {
    const csv = [
      ['Name', 'Duration', 'Price', 'Category', 'Active', 'Popular'].join(','),
      ...boostPackages.map(pkg => [
        pkg.name,
        `${pkg.duration} days`,
        `AED ${pkg.price}`,
        pkg.category,
        pkg.active ? 'Yes' : 'No',
        pkg.popular ? 'Yes' : 'No',
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boost_packages_${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Data exported');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--sublimes-gold)]" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-[var(--sublimes-dark-bg)] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)] mb-2">
              Listing & Boost Management
            </h1>
            <p className="text-gray-400">Manage listing fees, duration pricing, and boost packages</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </Button>
            <Button 
              variant="outline"
              onClick={exportBoostData}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-[var(--sublimes-gold)]">
              AED {stats.totalRevenue.toFixed(0)}
            </div>
            <div className="text-sm text-gray-400">Total Revenue</div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-[var(--sublimes-light-text)]">
              {stats.activeBoosts}
            </div>
            <div className="text-sm text-gray-400">Active Boosts</div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-[var(--sublimes-light-text)]">
              {stats.durationSettings}
            </div>
            <div className="text-sm text-gray-400">Duration Settings</div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Gift className="h-8 w-8 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-[var(--sublimes-light-text)]">
              {stats.totalListings}
            </div>
            <div className="text-sm text-gray-400">This Month</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)]">
          <TabsTrigger value="base-fees">Base Listing Fees</TabsTrigger>
          <TabsTrigger value="duration">Duration Settings</TabsTrigger>
          <TabsTrigger value="boost-addons">Boost Addons</TabsTrigger>
        </TabsList>

        {/* Base Listing Fees */}
        <TabsContent value="base-fees">
          <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--sublimes-light-text)]">
                Base Listing Fees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Car Listing Fee */}
                  <Card className="border-[var(--sublimes-border)]">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-[var(--sublimes-light-text)] mb-2">
                        Car Listing
                      </h3>
                      <div className="text-3xl font-bold text-[var(--sublimes-gold)] mb-2">
                        AED 52.50
                      </div>
                      <p className="text-sm text-gray-400">50 AED + 5% VAT</p>
                      <Badge className="mt-2 bg-green-500/10 text-green-500 border-green-500/30">
                        Active
                      </Badge>
                    </CardContent>
                  </Card>

                  {/* Car Parts Fee */}
                  <Card className="border-[var(--sublimes-border)]">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-[var(--sublimes-light-text)] mb-2">
                        Car Parts
                      </h3>
                      <div className="text-3xl font-bold text-[var(--sublimes-gold)] mb-2">
                        8%
                      </div>
                      <p className="text-sm text-gray-400">8% of listing price (incl. VAT)</p>
                      <Badge className="mt-2 bg-green-500/10 text-green-500 border-green-500/30">
                        Active
                      </Badge>
                    </CardContent>
                  </Card>

                  {/* Garage Fee */}
                  <Card className="border-[var(--sublimes-border)]">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-[var(--sublimes-light-text)] mb-2">
                        Garage Service
                      </h3>
                      <div className="text-3xl font-bold text-[var(--sublimes-gold)] mb-2">
                        AED 105.00
                      </div>
                      <p className="text-sm text-gray-400">100 AED + 5% VAT</p>
                      <Badge className="mt-2 bg-green-500/10 text-green-500 border-green-500/30">
                        Active
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
                <p className="text-sm text-gray-400 mt-4">
                  * Base listing fees are managed via the `fn_calculate_fee` database function
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Duration Settings */}
        <TabsContent value="duration">
          <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--sublimes-light-text)]">
                Listing Duration Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 60-day listings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[var(--sublimes-light-text)]">
                    60-Day Listings
                  </h3>
                  {['Car', 'Car Parts', 'Garage'].map((type) => (
                    <Card key={type} className="border-[var(--sublimes-border)]">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-[var(--sublimes-light-text)]">
                              {type} Listing
                            </p>
                            <p className="text-sm text-gray-400">
                              Listing live for 60 days
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30">
                              60 days
                            </Badge>
                            <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
                              Active
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* 90-day trial */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[var(--sublimes-light-text)]">
                    90-Day Trial Pass
                  </h3>
                  {['Car', 'Car Parts', 'Garage'].map((type) => (
                    <Card key={type} className="border-[var(--sublimes-border)]">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-[var(--sublimes-light-text)]">
                              {type} Trial
                            </p>
                            <p className="text-sm text-gray-400">
                              Submit for verification
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/30">
                              90 days
                            </Badge>
                            <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
                              Active
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Boost Addons */}
        <TabsContent value="boost-addons">
          <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[var(--sublimes-light-text)]">
                  Boost Addon Packages
                </CardTitle>
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Package
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {boostPackages.length === 0 ? (
                <div className="text-center py-12">
                  <Zap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg text-[var(--sublimes-light-text)] mb-2">
                    No boost packages yet
                  </p>
                  <p className="text-gray-400 mb-4">
                    Create your first boost package to get started
                  </p>
                  <Button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Package
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {boostPackages.map((pkg) => (
                    <Card 
                      key={pkg.id}
                      className={`border-2 ${
                        pkg.popular 
                          ? 'border-[var(--sublimes-gold)]' 
                          : 'border-[var(--sublimes-border)]'
                      } relative`}
                    >
                      {pkg.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]">
                            Most Popular
                          </Badge>
                        </div>
                      )}
                      <CardContent className="p-6">
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-[var(--sublimes-light-text)] mb-2">
                            {pkg.name}
                          </h3>
                          <div className="flex items-baseline space-x-2 mb-2">
                            <span className="text-3xl font-bold text-[var(--sublimes-gold)]">
                              AED {pkg.price}
                            </span>
                            {pkg.original_price && (
                              <span className="text-lg text-gray-400 line-through">
                                AED {pkg.original_price}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">
                            {pkg.duration} days boost
                          </p>
                        </div>

                        <div className="space-y-2 mb-4">
                          {pkg.features.map((feature, index) => (
                            <div key={index} className="flex items-start space-x-2 text-sm text-gray-300">
                              <Zap className="h-4 w-4 text-[var(--sublimes-gold)] mt-0.5" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setEditingPackage(pkg)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-red-500 text-red-500"
                            onClick={() => deleteBoostPackage(pkg.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}





