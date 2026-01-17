/**
 * MyBoostsPage_Wired - Database-connected My Boosts page
 * Uses: useListings, useAnalytics
 */

import { useState, useEffect } from 'react';
import { TrendingUp, Target, Clock, CheckCircle, Zap, Eye, MessageCircle, DollarSign, Star, Calendar, Loader2, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';
import { useListings, useAnalytics } from '../hooks';

interface MyBoostsPageProps {
  onNavigate?: (page: string) => void;
}

export function MyBoostsPage({ onNavigate }: MyBoostsPageProps) {
  // State
  const [selectedTab, setSelectedTab] = useState('all');

  // Hooks
  const { listings, loading, error, refetch } = useListings({ my_listings: true, boosted: true });
  const analytics = useAnalytics();

  // Track page view
  useEffect(() => {
    analytics.trackPageView('/my-boosts');
  }, []);

  // Filter boosts by status
  const filteredBoosts = listings.filter((listing) => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'active') return listing.boost_status === 'active';
    if (selectedTab === 'completed') return listing.boost_status === 'completed';
    if (selectedTab === 'scheduled') return listing.boost_status === 'scheduled';
    return true;
  });

  const handleBoostNow = (listingId: string) => {
    analytics.trackEvent('boost_listing_clicked', { listing_id: listingId });
    toast.success('Redirecting to boost package selection...');
    onNavigate?.('my-packages');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1426] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mb-4" />
        <p className="text-[#8B92A7]">Loading your boosts...</p>
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
                <h3 className="text-red-400 mb-1" style={{ fontWeight: 600 }}>Error Loading Boosts</h3>
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl text-[#E8EAED]" style={{ fontWeight: 600 }}>
                My Boosts
              </h1>
              <p className="text-[#8B92A7] mt-1">
                Track and manage your active boosts
              </p>
            </div>
            <Button
              onClick={() => onNavigate?.('my-packages')}
              className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A037]"
            >
              <Zap className="mr-2" size={20} />
              Buy Boost Package
            </Button>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-[#0B1426] border-[#1A2332]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#8B92A7]">Active Boosts</p>
                    <p className="text-2xl text-[#E8EAED]" style={{ fontWeight: 600 }}>
                      {filteredBoosts.filter((b) => b.boost_status === 'active').length}
                    </p>
                  </div>
                  <TrendingUp className="text-[#D4AF37]" size={32} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0B1426] border-[#1A2332]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#8B92A7]">Total Views</p>
                    <p className="text-2xl text-[#E8EAED]" style={{ fontWeight: 600 }}>
                      {filteredBoosts.reduce((sum, b) => sum + (b.views || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <Eye className="text-blue-500" size={32} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0B1426] border-[#1A2332]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#8B92A7]">Total Messages</p>
                    <p className="text-2xl text-[#E8EAED]" style={{ fontWeight: 600 }}>
                      {filteredBoosts.reduce((sum, b) => sum + (b.messages_count || 0), 0)}
                    </p>
                  </div>
                  <MessageCircle className="text-green-500" size={32} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0B1426] border-[#1A2332]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#8B92A7]">Total Spent</p>
                    <p className="text-2xl text-[#E8EAED]" style={{ fontWeight: 600 }}>
                      AED {filteredBoosts.reduce((sum, b) => sum + (b.boost_budget || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="text-purple-500" size={32} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
          <TabsList className="bg-[#0F1829] border border-[#1A2332]">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-6">
            {/* Empty State */}
            {!loading && filteredBoosts.length === 0 && (
              <div className="text-center py-16">
                <Zap className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
                <h3 className="text-xl text-[#E8EAED] mb-2">No Boosts Found</h3>
                <p className="text-[#8B92A7] mb-6">
                  Start boosting your listings to reach more buyers!
                </p>
                <Button
                  onClick={() => onNavigate?.('my-packages')}
                  className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A037]"
                >
                  <Zap className="mr-2" size={20} />
                  Buy Boost Package
                </Button>
              </div>
            )}

            {/* Boosts List */}
            {filteredBoosts.length > 0 && (
              <div className="space-y-4">
                {filteredBoosts.map((boost) => (
                  <Card key={boost.id} className="bg-[#0F1829] border-[#1A2332]">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Image */}
                        <div className="w-full lg:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                          {boost.images && boost.images.length > 0 ? (
                            <ImageWithFallback
                              src={boost.images[0]}
                              alt={boost.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#1A2332] flex items-center justify-center">
                              <Star className="text-[#8B92A7]" size={32} />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg text-[#E8EAED]" style={{ fontWeight: 600 }}>
                                  {boost.title}
                                </h3>
                                {boost.boost_status === 'active' && (
                                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                    Active
                                  </Badge>
                                )}
                                {boost.boost_status === 'completed' && (
                                  <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                                    Completed
                                  </Badge>
                                )}
                                {boost.boost_status === 'scheduled' && (
                                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                    Scheduled
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-[#8B92A7]">
                                Boost ID: {boost.id.slice(0, 8).toUpperCase()}
                              </p>
                            </div>
                            <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30">
                              {boost.boost_level || 'Standard'} Package
                            </Badge>
                          </div>

                          {/* Progress */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-[#8B92A7]">Budget Progress</span>
                              <span className="text-sm text-[#E8EAED]">
                                AED {boost.boost_spent || 0} / {boost.boost_budget || 0}
                              </span>
                            </div>
                            <Progress 
                              value={((boost.boost_spent || 0) / (boost.boost_budget || 1)) * 100} 
                              className="h-2"
                            />
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-[#8B92A7] mb-1">Views</p>
                              <p className="text-lg text-[#E8EAED]" style={{ fontWeight: 600 }}>
                                {(boost.views || 0).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[#8B92A7] mb-1">Messages</p>
                              <p className="text-lg text-[#E8EAED]" style={{ fontWeight: 600 }}>
                                {boost.messages_count || 0}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[#8B92A7] mb-1">Start Date</p>
                              <p className="text-sm text-[#E8EAED]">
                                {boost.boost_start_date 
                                  ? new Date(boost.boost_start_date).toLocaleDateString()
                                  : 'TBA'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[#8B92A7] mb-1">End Date</p>
                              <p className="text-sm text-[#E8EAED]">
                                {boost.boost_end_date 
                                  ? new Date(boost.boost_end_date).toLocaleDateString()
                                  : 'TBA'}
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3">
                            <Button
                              onClick={() => onNavigate?.(`listing/${boost.id}`)}
                              size="sm"
                              variant="outline"
                              className="border-[#1A2332] text-[#E8EAED] hover:bg-[#1A2332]"
                            >
                              View Listing
                            </Button>
                            {boost.boost_status === 'active' && (
                              <Button
                                onClick={() => handleBoostNow(boost.id)}
                                size="sm"
                                className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A037]"
                              >
                                <Zap className="mr-2" size={16} />
                                Extend Boost
                              </Button>
                            )}
                            {boost.boost_status === 'completed' && (
                              <Button
                                onClick={() => handleBoostNow(boost.id)}
                                size="sm"
                                className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A037]"
                              >
                                <Zap className="mr-2" size={16} />
                                Boost Again
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
