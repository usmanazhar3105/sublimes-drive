/**
 * MyListingsPage - Wired with Supabase Hooks
 * Uses: useListings, useAnalytics
 * Mobile optimized with proper stats alignment
 */

import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, Edit, Trash2, Eye, TrendingUp, Clock, CheckCircle, XCircle, Loader2, Zap, DollarSign, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useListings, useAnalytics } from '../hooks';

interface MyListingsPageProps {
  onNavigate?: (page: string) => void;
}

export function MyListingsPage({ onNavigate }: MyListingsPageProps) {
  const [activeTab, setActiveTab] = useState('all');

  const { listings, loading, error, deleteListing, refetch } = useListings({ myListings: true });
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView('/my-listings');
  }, []);

  const activeListings = listings.filter(l => l.status === 'active');
  const pendingListings = listings.filter(l => l.status === 'pending');
  const soldListings = listings.filter(l => l.status === 'sold');
  const boostedListings = listings.filter(l => l.is_boosted);
  
  // Calculate total invested (sum of all boost payments)
  const totalInvested = listings.reduce((sum, l) => {
    // This would come from boost_payments table in real implementation
    return sum + (l.boost_cost || 0);
  }, 0);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      const { error } = await deleteListing(id);
      if (!error) {
        toast.success('Listing deleted');
        analytics.trackEvent('listing_deleted', { listing_id: id });
        refetch();
      } else {
        toast.error('Failed to delete listing');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1426] pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-[#0F1829] border-b border-[#1A2332]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl text-[#E8EAED] mb-1 md:mb-2">My Listings</h1>
              <p className="text-sm text-[#8B92A7]">Manage your marketplace listings</p>
            </div>
            <Button 
              onClick={() => onNavigate?.('place-ad')} 
              className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A037] w-full md:w-auto"
            >
              <Plus size={20} className="mr-2" />
              Create Listing
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards - Mobile Optimized */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          {/* All Listings */}
          <Card 
            className={`bg-[#0F1829] border-[#1A2332] cursor-pointer hover:border-[#D4AF37] transition-colors ${activeTab === 'all' ? 'ring-2 ring-[#D4AF37]' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <Package className="w-6 h-6 md:w-8 md:h-8 text-[#D4AF37] mb-2" />
                <div className="text-3xl md:text-4xl text-[#D4AF37] mb-1">
                  {listings.length}
                </div>
                <div className="text-xs md:text-sm text-[#8B92A7]">
                  All
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active */}
          <Card 
            className={`bg-[#0F1829] border-[#1A2332] cursor-pointer hover:border-[#D4AF37] transition-colors ${activeTab === 'active' ? 'ring-2 ring-[#D4AF37]' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-500 mb-2" />
                <div className="text-3xl md:text-4xl text-green-500 mb-1">
                  {activeListings.length}
                </div>
                <div className="text-xs md:text-sm text-[#8B92A7]">
                  Active
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Pending */}
          <Card 
            className={`bg-[#0F1829] border-[#1A2332] cursor-pointer hover:border-[#D4AF37] transition-colors ${activeTab === 'pending' ? 'ring-2 ring-[#D4AF37]' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <Clock className="w-6 h-6 md:w-8 md:h-8 text-yellow-500 mb-2" />
                <div className="text-3xl md:text-4xl text-yellow-500 mb-1">
                  {pendingListings.length}
                </div>
                <div className="text-xs md:text-sm text-[#8B92A7]">
                  Pending
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Boosted */}
          <Card 
            className={`bg-[#0F1829] border-[#1A2332] cursor-pointer hover:border-[#D4AF37] transition-colors ${activeTab === 'boosted' ? 'ring-2 ring-[#D4AF37]' : ''}`}
            onClick={() => setActiveTab('boosted')}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <Zap className="w-6 h-6 md:w-8 md:h-8 text-blue-500 mb-2" />
                <div className="text-3xl md:text-4xl text-blue-500 mb-1">
                  {boostedListings.length}
                </div>
                <div className="text-xs md:text-sm text-[#8B92A7]">
                  Boosted
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Invested */}
          <Card className="bg-[#0F1829] border-[#1A2332]">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-purple-500 mb-2" />
                <div className="text-2xl md:text-3xl text-purple-500 mb-1">
                  AED {totalInvested}
                </div>
                <div className="text-xs md:text-sm text-[#8B92A7]">
                  Total Invested
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Listings Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-[#0F1829] border border-[#1A2332]">
            <TabsTrigger value="all" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]">
              All ({listings.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]">
              Active ({activeListings.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]">
              Pending ({pendingListings.length})
            </TabsTrigger>
            <TabsTrigger value="boosted" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]">
              Boosted ({boostedListings.length})
            </TabsTrigger>
          </TabsList>

          {/* All Tab */}
          <TabsContent value="all">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl text-[#E8EAED] mb-2">No listings yet</h3>
                <p className="text-[#8B92A7] mb-6">Create your first listing to get started</p>
                <Button onClick={() => onNavigate?.('place-ad')} className="bg-[#D4AF37] text-[#0B1426]">
                  Create Listing
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {listings.map((listing) => (
                  <ListingManagementCard 
                    key={listing.id} 
                    listing={listing}
                    onDelete={handleDelete}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Active Tab */}
          <TabsContent value="active">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
              </div>
            ) : activeListings.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl text-[#E8EAED] mb-2">No active listings</h3>
                <p className="text-[#8B92A7] mb-6">Create your first listing to get started</p>
                <Button onClick={() => onNavigate?.('place-ad')} className="bg-[#D4AF37] text-[#0B1426]">
                  Create Listing
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {activeListings.map((listing) => (
                  <ListingManagementCard 
                    key={listing.id} 
                    listing={listing}
                    onDelete={handleDelete}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Pending Tab */}
          <TabsContent value="pending">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
              </div>
            ) : pendingListings.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">⏳</div>
                <h3 className="text-xl text-[#E8EAED] mb-2">No pending listings</h3>
                <p className="text-[#8B92A7]">All your listings are approved</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {pendingListings.map((listing) => (
                  <ListingManagementCard 
                    key={listing.id} 
                    listing={listing}
                    onDelete={handleDelete}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Sold Tab */}
          <TabsContent value="sold">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
              </div>
            ) : soldListings.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl text-[#E8EAED] mb-2">No sold listings</h3>
                <p className="text-[#8B92A7]">Listings you mark as sold will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {soldListings.map((listing) => (
                  <ListingManagementCard 
                    key={listing.id} 
                    listing={listing}
                    onDelete={handleDelete}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Boosted Tab */}
          <TabsContent value="boosted">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
              </div>
            ) : boostedListings.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">⚡</div>
                <h3 className="text-xl text-[#E8EAED] mb-2">No boosted listings</h3>
                <p className="text-[#8B92A7]">Boost your listings to get more visibility</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {boostedListings.map((listing) => (
                  <ListingManagementCard 
                    key={listing.id} 
                    listing={listing}
                    onDelete={handleDelete}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Listing Management Card Component
function ListingManagementCard({ listing, onDelete, onNavigate }: any) {
  return (
    <Card className="bg-[#0F1829] border-[#1A2332] overflow-hidden">
      <CardContent className="p-0">
        {/* Image */}
        <div className="relative h-48 bg-[#1A2332]">
          {listing.images?.[0] ? (
            <img 
              src={listing.images[0]} 
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#8B92A7]">
              No Image
            </div>
          )}
          {listing.is_boosted && (
            <Badge className="absolute top-3 left-3 bg-[#D4AF37] text-[#0B1426]">
              <Zap className="w-3 h-3 mr-1" />
              Boosted
            </Badge>
          )}
          {listing.status === 'pending' && (
            <Badge className="absolute top-3 right-3 bg-orange-500 text-white">
              Pending Review
            </Badge>
          )}
          {listing.status === 'sold' && (
            <Badge className="absolute top-3 right-3 bg-green-500 text-white">
              Sold
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-[#E8EAED] mb-2 line-clamp-1">{listing.title}</h3>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl text-[#D4AF37]">
              {listing.currency || 'AED'} {listing.price?.toLocaleString() || 0}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-[#8B92A7] mb-4">
            <span className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {listing.view_count || 0}
            </span>
            <span className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              {listing.clicks || 0}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-[#1A2332] hover:bg-[#1A2332]"
              onClick={() => onNavigate?.(`edit-listing/${listing.id}`)}
            >
              <Edit size={16} className="mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-red-500/20 text-red-500 hover:bg-red-500/10"
              onClick={() => onDelete(listing.id)}
            >
              <Trash2 size={16} className="mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
