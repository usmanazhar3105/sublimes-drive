// Central export file for all data hooks
// Import all hooks from a single location: import { useListings, useCommunities } from '../hooks';

// Export hooks from src/src/hooks (most hooks are here)
export * from '../src/hooks/useListings';
export * from '../src/hooks/useCommunities';
export * from '../src/hooks/useNotifications';
export * from '../src/hooks/useRole';
export * from '../src/hooks/useGarages';
export * from '../src/hooks/useEvents';
export * from '../src/hooks/useOffers'; // Promotional offers (vendor deals)
export * from '../src/hooks/useMarketplaceOffers'; // Marketplace offers (buying/selling cars)
export * from '../src/hooks/useMarketplaceListings'; // Marketplace listings (admin + user)
export * from '../src/hooks/useWallet';
export * from '../src/hooks/useProfile';
export * from '../src/hooks/useAnalytics';
export * from '../src/hooks/useRoles';
export * from '../src/hooks/useReferrals';
export * from '../src/hooks/useVendor';
export * from '../src/hooks/useTranslations';
export * from '../src/hooks/useMessaging';
export * from '../src/hooks/useImageUpload';
export * from '../src/hooks/useSocialInteractions';
export * from '../src/hooks/useDailyChallenges';
export * from '../src/hooks/usePayments';
export * from '../src/hooks/usePosts';
export * from '../src/hooks/useBidRepair';
export * from '../src/hooks/useReviews';

// Export hooks from src/hooks (hooks that only exist here)
export * from './useContentModeration';
export * from './useReferral';

