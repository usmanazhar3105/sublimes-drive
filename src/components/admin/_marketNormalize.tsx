/**
 * Marketplace Data Normalization Helpers
 * Converts raw marketplace data into consistent TypeScript interfaces
 */

export interface AdminMarketItem {
  id: string;
  title: string;
  seller: string;
  category: string;
  price: number;
  location: string;
  status: 'pending' | 'under_review' | 'active' | 'rejected' | 'expired' | 'sold' | 'suspended';
  images: number;
  description?: string;
  views: number;
  boostPackage: string | null;
  submittedAt?: string;
  approvedAt?: string;
  inquiries?: number;
}

export interface MarketplaceNormalized {
  pending: AdminMarketItem[];
  approved: AdminMarketItem[];
}

/**
 * Normalize marketplace listings for admin view
 */
export function normalizeMarketplace(
  pendingListings: any[],
  approvedListings: any[]
): MarketplaceNormalized {
  const normalizeListing = (listing: any): AdminMarketItem => ({
    id: listing.id || Math.random().toString(36).substr(2, 9),
    title: listing.title || 'Untitled Listing',
    seller: listing.seller || listing.seller_name || 'Unknown Seller',
    category: listing.category || listing.listing_type || 'Uncategorized',
    price: typeof listing.price === 'number' ? listing.price : 0,
    location: listing.location || 'Unknown',
    status: listing.status || 'pending',
    images: Array.isArray(listing.images) 
      ? listing.images.length 
      : typeof listing.images === 'number' 
        ? listing.images 
        : 0,
    description: listing.description || '',
    views: typeof listing.views === 'number' 
      ? listing.views 
      : typeof listing.view_count === 'number' 
        ? listing.view_count 
        : 0,
    boostPackage: listing.boostPackage || listing.boost_package || null,
    submittedAt: listing.submittedAt || listing.created_at || 'Unknown',
    approvedAt: listing.approvedAt || listing.approved_at,
    inquiries: listing.inquiries || listing.inquiry_count || 0,
  });

  return {
    pending: pendingListings.map(normalizeListing),
    approved: approvedListings.map(normalizeListing),
  };
}

/**
 * Normalize marketplace transaction data
 */
export interface MarketplaceTransaction {
  id: string;
  listingId: string;
  userId: string;
  type: 'listing_fee' | 'boost' | 'commission' | 'refund';
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
  stripePaymentIntentId?: string;
  createdAt: string;
}

export function normalizeTransaction(transaction: any): MarketplaceTransaction {
  return {
    id: transaction.id || '',
    listingId: transaction.listing_id || transaction.listingId || '',
    userId: transaction.user_id || transaction.userId || '',
    type: transaction.transaction_type || transaction.type || 'listing_fee',
    amount: transaction.amount || 0,
    currency: transaction.currency || 'AED',
    status: transaction.status || 'pending',
    stripePaymentIntentId: transaction.stripe_payment_intent_id || transaction.stripePaymentIntentId,
    createdAt: transaction.created_at || transaction.createdAt || new Date().toISOString(),
  };
}

/**
 * Normalize marketplace analytics data
 */
export interface MarketplaceAnalytics {
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  soldListings: number;
  totalRevenue: number;
  totalViews: number;
  conversionRate: number;
}

export function normalizeAnalytics(data: any): MarketplaceAnalytics {
  return {
    totalListings: data.total_listings || data.totalListings || 0,
    activeListings: data.active_listings || data.activeListings || 0,
    pendingListings: data.pending_listings || data.pendingListings || 0,
    soldListings: data.sold_listings || data.soldListings || 0,
    totalRevenue: data.total_revenue || data.totalRevenue || 0,
    totalViews: data.total_views || data.totalViews || 0,
    conversionRate: data.conversion_rate || data.conversionRate || 0,
  };
}
