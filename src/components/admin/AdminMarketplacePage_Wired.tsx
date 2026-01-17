/**
 * AdminMarketplacePage_Wired - Marketplace Management
 * Uses: useMarketplaceListings, useAnalytics
 * 
 * MASTER GUIDELINE COMPLIANCE:
 * - Single source of truth: marketplace_listings table
 * - Admin sees all listings (all statuses)
 * - No hard-coded data
 * - Role-based access with RLS
 */

import { useEffect } from 'react';
import { Car, TrendingUp, DollarSign, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useMarketplaceListings, useAnalytics, useRole } from '../../src/hooks';

export function AdminMarketplacePage_Wired() {
  const { isAdmin } = useRole();
  
  // Admin sees ALL listings (all statuses)
  const { listings, loading } = useMarketplaceListings({
    isAdmin: true, // Don't filter by status - show everything
  });
  
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView('/admin/marketplace');
  }, []);

  const stats = {
    totalListings: listings.length,
    activeListings: listings.filter(l => l.status === 'active').length,
    pendingListings: listings.filter(l => l.status === 'pending').length,
    totalViews: listings.reduce((sum, l) => sum + (l.view_count || 0), 0),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl text-[#E8EAED]" style={{ fontWeight: 600 }}>
        Marketplace Management
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-4">
            <Car className="text-[#D4AF37] mb-2" size={24} />
            <p className="text-sm text-[#8B92A7] mb-1">Total Listings</p>
            <p className="text-2xl text-[#E8EAED]" style={{ fontWeight: 600 }}>
              {stats.totalListings}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-4">
            <TrendingUp className="text-green-500 mb-2" size={24} />
            <p className="text-sm text-[#8B92A7] mb-1">Active</p>
            <p className="text-2xl text-green-500" style={{ fontWeight: 600 }}>
              {stats.activeListings}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-4">
            <DollarSign className="text-orange-500 mb-2" size={24} />
            <p className="text-sm text-[#8B92A7] mb-1">Pending</p>
            <p className="text-2xl text-orange-500" style={{ fontWeight: 600 }}>
              {stats.pendingListings}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-4">
            <Eye className="text-blue-500 mb-2" size={24} />
            <p className="text-sm text-[#8B92A7] mb-1">Total Views</p>
            <p className="text-2xl text-blue-500" style={{ fontWeight: 600 }}>
              {stats.totalViews.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#0F1829] border-[#1A2332]">
        <CardHeader>
          <CardTitle className="text-xl text-[#E8EAED]">Recent Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {listings.slice(0, 10).map((listing) => (
              <div key={listing.id} className="flex items-center justify-between p-4 bg-[#0B1426] rounded-lg">
                <div>
                  <p className="text-[#E8EAED]" style={{ fontWeight: 600 }}>{listing.title}</p>
                  <p className="text-sm text-[#8B92A7]">{listing.category}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="bg-[#D4AF37]/20 text-[#D4AF37]">
                    AED {listing.price?.toLocaleString()}
                  </Badge>
                  <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
                    {listing.status}
                  </Badge>
                  <Button size="sm" variant="outline">View</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
