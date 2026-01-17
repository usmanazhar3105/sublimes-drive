/**
 * MyPackagesPage_Wired - Database-connected Package Tracking page
 * Uses: useWallet (for boost packages), useAnalytics
 */

import { useState, useEffect } from 'react';
import { Package2, Truck, CheckCircle, Clock, MapPin, Star, Zap, Loader2, X, ShoppingBag } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { useWallet, useAnalytics } from '../hooks';

interface MyPackagesPageProps {
  onNavigate?: (page: string) => void;
}

export function MyPackagesPage({ onNavigate }: MyPackagesPageProps) {
  // State
  const [selectedTab, setSelectedTab] = useState('all');

  // Hooks
  const { wallet, loading, error, refetch } = useWallet();
  const analytics = useAnalytics();

  // Track page view
  useEffect(() => {
    analytics.trackPageView('/my-packages');
  }, []);

  // Mock packages data (in a real app, this would come from useOrders or similar)
  const boostPackages = [
    {
      id: 'PKG-BOOST-001',
      name: 'Standard Boost Package',
      type: 'boost',
      status: 'active',
      credits: 5,
      usedCredits: 2,
      purchaseDate: '2024-01-15',
      expiryDate: '2024-02-15',
      price: 150,
    },
    {
      id: 'PKG-BOOST-002',
      name: 'Premium Boost Package',
      type: 'boost',
      status: 'active',
      credits: 10,
      usedCredits: 7,
      purchaseDate: '2024-01-10',
      expiryDate: '2024-02-10',
      price: 250,
    },
    {
      id: 'PKG-BOOST-003',
      name: 'Basic Boost Package',
      type: 'boost',
      status: 'expired',
      credits: 3,
      usedCredits: 3,
      purchaseDate: '2023-12-01',
      expiryDate: '2024-01-01',
      price: 75,
    },
  ];

  const availablePackages = [
    {
      id: 'PACKAGE-BASIC',
      name: 'Basic Boost',
      credits: 3,
      price: 75,
      description: 'Perfect for trying out boosts',
      features: ['3 Boost Credits', '7 Days Validity', 'Standard Support'],
      popular: false,
    },
    {
      id: 'PACKAGE-STANDARD',
      name: 'Standard Boost',
      credits: 5,
      price: 150,
      description: 'Most popular for regular sellers',
      features: ['5 Boost Credits', '30 Days Validity', 'Priority Support', '10% Bonus Views'],
      popular: true,
    },
    {
      id: 'PACKAGE-PREMIUM',
      name: 'Premium Boost',
      credits: 10,
      price: 250,
      description: 'Best value for power sellers',
      features: ['10 Boost Credits', '60 Days Validity', 'VIP Support', '25% Bonus Views', 'Featured Badge'],
      popular: false,
    },
  ];

  const filteredPackages = boostPackages.filter((pkg) => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'active') return pkg.status === 'active';
    if (selectedTab === 'expired') return pkg.status === 'expired';
    return true;
  });

  const handleBuyPackage = (packageId: string) => {
    analytics.trackEvent('boost_package_purchase_clicked', { package_id: packageId });
    toast.success('Redirecting to payment...');
    onNavigate?.('payment');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1426] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mb-4" />
        <p className="text-[#8B92A7]">Loading your packages...</p>
      </div>
    );
  }

  // Error state
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-[#0B1426] p-6">
        <Card className="bg-red-500/10 border-red-500 max-w-2xl mx-auto">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <X className="text-red-400 mt-1" size={20} />
              <div>
                <h3 className="text-red-400 mb-1" style={{ fontWeight: 600 }}>Error Loading Packages</h3>
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1426]">
      {/* Header */}
      <div className="bg-[#0F1829] border-b border-[#1A2332]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl text-[#E8EAED]" style={{ fontWeight: 600 }}>
            My Boost Packages
          </h1>
          <p className="text-[#8B92A7] mt-1">
            Manage your boost credits and purchase new packages
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Credits Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-[#D4AF37]/20 to-transparent border-[#D4AF37]/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8B92A7] mb-1">Available Credits</p>
                  <p className="text-4xl text-[#D4AF37]" style={{ fontWeight: 700 }}>
                    {boostPackages
                      .filter((p) => p.status === 'active')
                      .reduce((sum, p) => sum + (p.credits - p.usedCredits), 0)}
                  </p>
                </div>
                <Zap className="text-[#D4AF37]" size={48} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0F1829] border-[#1A2332]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8B92A7] mb-1">Total Credits Used</p>
                  <p className="text-4xl text-[#E8EAED]" style={{ fontWeight: 700 }}>
                    {boostPackages.reduce((sum, p) => sum + p.usedCredits, 0)}
                  </p>
                </div>
                <CheckCircle className="text-green-500" size={48} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0F1829] border-[#1A2332]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8B92A7] mb-1">Active Packages</p>
                  <p className="text-4xl text-[#E8EAED]" style={{ fontWeight: 700 }}>
                    {boostPackages.filter((p) => p.status === 'active').length}
                  </p>
                </div>
                <Package2 className="text-blue-500" size={48} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Packages Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
          <TabsList className="bg-[#0F1829] border border-[#1A2332]">
            <TabsTrigger value="all">All Packages</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-6">
            {filteredPackages.length === 0 && (
              <div className="text-center py-16">
                <Package2 className="w-16 h-16 text-[#8B92A7] mx-auto mb-4" />
                <h3 className="text-xl text-[#E8EAED] mb-2">No Packages Found</h3>
                <p className="text-[#8B92A7] mb-6">
                  Purchase a boost package to get started!
                </p>
              </div>
            )}

            {filteredPackages.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPackages.map((pkg) => (
                  <Card key={pkg.id} className="bg-[#0F1829] border-[#1A2332]">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl text-[#E8EAED]">{pkg.name}</CardTitle>
                          <p className="text-sm text-[#8B92A7] mt-1">Package ID: {pkg.id}</p>
                        </div>
                        {pkg.status === 'active' ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                            Expired
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Credits Progress */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-[#8B92A7]">Credits Usage</span>
                            <span className="text-sm text-[#E8EAED]">
                              {pkg.usedCredits} / {pkg.credits} used
                            </span>
                          </div>
                          <Progress 
                            value={(pkg.usedCredits / pkg.credits) * 100} 
                            className="h-2"
                          />
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-[#8B92A7] mb-1">Purchase Date</p>
                            <p className="text-[#E8EAED]">
                              {new Date(pkg.purchaseDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#8B92A7] mb-1">Expiry Date</p>
                            <p className="text-[#E8EAED]">
                              {new Date(pkg.expiryDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#8B92A7] mb-1">Price Paid</p>
                            <p className="text-[#E8EAED]">AED {pkg.price}</p>
                          </div>
                          <div>
                            <p className="text-[#8B92A7] mb-1">Remaining Credits</p>
                            <p className="text-[#D4AF37]" style={{ fontWeight: 600 }}>
                              {pkg.credits - pkg.usedCredits}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        {pkg.status === 'active' && (
                          <Button
                            onClick={() => onNavigate?.('my-boosts')}
                            className="w-full bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A037]"
                          >
                            <Zap className="mr-2" size={16} />
                            Use Credits
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Buy New Packages */}
        <div className="mt-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl text-[#E8EAED] mb-3" style={{ fontWeight: 600 }}>
              Buy Boost Packages
            </h2>
            <p className="text-[#8B92A7]">
              Choose the perfect package for your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availablePackages.map((pkg) => (
              <Card 
                key={pkg.id} 
                className={`bg-[#0F1829] border-[#1A2332] ${
                  pkg.popular ? 'ring-2 ring-[#D4AF37]' : ''
                } relative`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-[#D4AF37] text-[#0B1426]">
                      <Star className="mr-1" size={12} />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl text-[#E8EAED] text-center">{pkg.name}</CardTitle>
                  <p className="text-sm text-[#8B92A7] text-center">{pkg.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="text-5xl text-[#D4AF37] mb-2" style={{ fontWeight: 700 }}>
                      AED {pkg.price}
                    </div>
                    <p className="text-[#8B92A7]">{pkg.credits} Boost Credits</p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-[#E8EAED]">
                        <CheckCircle className="text-[#D4AF37]" size={16} />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleBuyPackage(pkg.id)}
                    className={`w-full ${
                      pkg.popular
                        ? 'bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A037]'
                        : 'bg-[#1A2332] text-[#E8EAED] hover:bg-[#243447]'
                    }`}
                  >
                    <ShoppingBag className="mr-2" size={16} />
                    Buy Package
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
