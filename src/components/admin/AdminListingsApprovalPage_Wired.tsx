/**
 * AdminListingsApprovalPage_Wired - Approve/Reject Listings
 * Uses: useListings, useAnalytics
 */

import { useEffect } from 'react';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { useListings, useAnalytics } from '../../src/hooks';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export function AdminListingsApprovalPage_Wired() {
  const { listings, loading, updateListing } = useListings({ status: 'pending' });
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView('/admin/listings-approval');
  }, []);

  const handleApprove = async (id: string) => {
    const { error } = await updateListing(id, { status: 'active' });
    if (!error) {
      analytics.trackEvent('admin_listing_approved', { listing_id: id });
      toast.success('Listing approved');
    }
  };

  const handleReject = async (id: string) => {
    const { error } = await updateListing(id, { status: 'rejected' });
    if (!error) {
      analytics.trackEvent('admin_listing_rejected', { listing_id: id });
      toast.success('Listing rejected');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl text-[#E8EAED]" style={{ fontWeight: 600 }}>
        Listings Approval
      </h1>
      <div className="grid gap-4">
        {listings.map((listing) => (
          <Card key={listing.id} className="bg-[#0F1829] border-[#1A2332]">
            <CardContent className="p-6">
              <div className="flex gap-6">
                {listing.images?.[0] && (
                  <ImageWithFallback
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-48 h-32 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg text-[#E8EAED] mb-2" style={{ fontWeight: 600 }}>
                    {listing.title}
                  </h3>
                  <p className="text-[#8B92A7] mb-4">{listing.description}</p>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-[#D4AF37]/20 text-[#D4AF37]">
                      AED {listing.price?.toLocaleString()}
                    </Badge>
                    <Badge variant="outline">{listing.category}</Badge>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => handleApprove(listing.id)}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <CheckCircle className="mr-2" size={16} />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleReject(listing.id)}
                    variant="outline"
                    className="border-red-500 text-red-500"
                  >
                    <XCircle className="mr-2" size={16} />
                    Reject
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {listings.length === 0 && !loading && (
          <Card className="bg-[#0F1829] border-[#1A2332]">
            <CardContent className="p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl text-[#E8EAED] mb-2">All Caught Up!</h3>
              <p className="text-[#8B92A7]">No pending listings to review</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
