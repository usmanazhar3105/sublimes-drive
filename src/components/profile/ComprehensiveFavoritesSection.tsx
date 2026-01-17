/**
 * Comprehensive Favorites Section for Profile Page
 * Shows all favorited content: Offers, Posts, Events, Meetups, Listings, Garages
 */

import { useState, useEffect } from 'react';
import { 
  Heart, ShoppingBag, MessageSquare, Calendar, Users, 
  MapPin, Wrench, Tag, Car, Package, Loader2, Trash2,
  ExternalLink, Eye, Star
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';

interface FavoriteOffer {
  id: string;
  title: string;
  description: string;
  discount_percent: number;
  valid_from: string;
  valid_until: string;
  created_at: string;
}

interface FavoritePost {
  id: string;
  content: string;
  created_at: string;
  community_id?: string;
  user_id: string;
  profiles?: {
    username: string;
    avatar_url: string;
  };
}

interface FavoriteEvent {
  id: string;
  title: string;
  description: string;
  start_time: string;
  address: string;
  status: string;
  created_at: string;
}

interface FavoriteMeetup {
  id: string;
  title: string;
  description: string;
  scheduled_at: string;
  address: string;
  created_at: string;
}

interface FavoriteListing {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  status: string;
  created_at: string;
}

interface FavoriteGarage {
  id: string;
  name: string;
  description: string;
  address: string;
  rating: number;
  created_at: string;
}

interface ComprehensiveFavoritesSectionProps {
  userId: string;
  isOwnProfile: boolean;
}

export function ComprehensiveFavoritesSection({ userId, isOwnProfile }: ComprehensiveFavoritesSectionProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  
  // State for each favorite type
  const [favoriteOffers, setFavoriteOffers] = useState<FavoriteOffer[]>([]);
  const [favoritePosts, setFavoritePosts] = useState<FavoritePost[]>([]);
  const [favoriteEvents, setFavoriteEvents] = useState<FavoriteEvent[]>([]);
  const [favoriteMeetups, setFavoriteMeetups] = useState<FavoriteMeetup[]>([]);
  const [favoriteListings, setFavoriteListings] = useState<FavoriteListing[]>([]);
  const [favoriteGarages, setFavoriteGarages] = useState<FavoriteGarage[]>([]);

  useEffect(() => {
    if (isOwnProfile) {
      loadAllFavorites();
    } else {
      setLoading(false);
    }
  }, [userId, isOwnProfile]);

  const loadAllFavorites = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadFavoriteOffers(),
        loadFavoritePosts(),
        loadFavoriteEvents(),
        loadFavoriteMeetups(),
        loadFavoriteListings(),
        loadFavoriteGarages(),
      ]);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavoriteOffers = async () => {
    try {
      console.log('🔍 Loading favorite offers for user:', userId);
      
      // Step 1: Get favorite item IDs for offers (using polymorphic design)
      const { data: favoriteIds, error: favError } = await supabase
        .from('user_favorites')
        .select('item_id')
        .eq('user_id', userId)
        .eq('item_type', 'offer');

      console.log('📊 Favorite offer IDs:', { favoriteIds, favError });

      if (favError) {
        console.error('❌ Error fetching favorite offer IDs:', favError);
        throw favError;
      }

      if (!favoriteIds || favoriteIds.length === 0) {
        console.log('ℹ️ No favorite offers found');
        setFavoriteOffers([]);
        return;
      }

      // Step 2: Fetch the actual offers using the IDs
      const offerIds = favoriteIds.map(f => f.item_id);
      const { data: offersData, error: offersError } = await supabase
        .from('offers')
        .select('id, title, description, discount_percent, original_price, discounted_price, valid_from, valid_until, created_at')
        .in('id', offerIds);

      console.log('📊 Offers data:', { offersData, offersError });

      if (offersError) {
        console.error('❌ Error fetching offers:', offersError);
        throw offersError;
      }
      
      // Map to expected format
      const offers = offersData?.map(offer => ({
        id: offer.id,
        title: offer.title || 'Untitled Offer',
        description: offer.description || 'No description',
        discount_percent: offer.discount_percent || 0,
        valid_from: offer.valid_from || offer.created_at,
        valid_until: offer.valid_until || offer.created_at,
        created_at: offer.created_at
      })) || [];
      
      console.log('✅ Loaded favorite offers:', offers.length);
      setFavoriteOffers(offers as any);
    } catch (error: any) {
      console.error('Error loading favorite offers:', error);
      setFavoriteOffers([]);
    }
  };

  const loadFavoritePosts = async () => {
    try {
      console.log('🔍 Loading favorite posts for user:', userId);
      
      // Step 1: Get favorite item IDs for posts (using polymorphic design)
      const { data: favoriteIds, error: favError } = await supabase
        .from('user_favorites')
        .select('item_id')
        .eq('user_id', userId)
        .eq('item_type', 'post');

      if (favError) {
        console.error('❌ Error fetching favorite post IDs:', favError);
        throw favError;
      }

      if (!favoriteIds || favoriteIds.length === 0) {
        console.log('ℹ️ No favorite posts found');
        setFavoritePosts([]);
        return;
      }

      // Step 2: Fetch the actual posts using the IDs
      const postIds = favoriteIds.map(f => f.item_id);
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles (username, avatar_url)
        `)
        .in('id', postIds);

      if (postsError) {
        console.error('❌ Error fetching posts:', postsError);
        throw postsError;
      }
      
      console.log('✅ Loaded favorite posts:', postsData?.length || 0);
      setFavoritePosts(postsData as any || []);
    } catch (error: any) {
      console.error('Error loading favorite posts:', error);
      setFavoritePosts([]);
    }
  };

  const loadFavoriteEvents = async () => {
    try {
      console.log('🔍 Loading favorite events for user:', userId);
      
      // Step 1: Get favorite item IDs for events (using polymorphic design)
      const { data: favoriteIds, error: favError } = await supabase
        .from('user_favorites')
        .select('item_id')
        .eq('user_id', userId)
        .eq('item_type', 'event');

      if (favError) {
        console.error('❌ Error fetching favorite event IDs:', favError);
        throw favError;
      }

      if (!favoriteIds || favoriteIds.length === 0) {
        console.log('ℹ️ No favorite events found');
        setFavoriteEvents([]);
        return;
      }

      // Step 2: Fetch the actual events using the IDs
      const eventIds = favoriteIds.map(f => f.item_id);
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('id, title, description, start_datetime, venue_address, event_type, status, created_at')
        .in('id', eventIds);

      if (eventsError) {
        console.error('❌ Error fetching events:', eventsError);
        throw eventsError;
      }
      
      // Map to expected format
      const events = eventsData?.map(event => ({
        id: event.id,
        title: event.title || event.event_type || 'Event',
        description: event.description || '',
        start_time: event.start_datetime || event.created_at,
        address: event.venue_address || '',
        status: event.status || 'draft',
        created_at: event.created_at
      })) || [];
      
      console.log('✅ Loaded favorite events:', events.length);
      setFavoriteEvents(events as any);
    } catch (error: any) {
      console.error('Error loading favorite events:', error);
      setFavoriteEvents([]);
    }
  };

  const loadFavoriteMeetups = async () => {
    // Meetups are not supported in user_favorites yet
    // Skip loading meetups until the meetup_id column is added to user_favorites
    setFavoriteMeetups([]);
  };

  const loadFavoriteListings = async () => {
    try {
      console.log('🔍 Loading favorite listings for user:', userId);
      
      // Step 1: Get favorite item IDs for listings (using polymorphic design)
      // Support both 'listing' and 'marketplace_listing' types
      const { data: favoriteIds, error: favError } = await supabase
        .from('user_favorites')
        .select('item_id')
        .eq('user_id', userId)
        .in('item_type', ['listing', 'marketplace_listing']);

      if (favError) {
        console.error('❌ Error fetching favorite listing IDs:', favError);
        throw favError;
      }

      if (!favoriteIds || favoriteIds.length === 0) {
        console.log('ℹ️ No favorite listings found');
        setFavoriteListings([]);
        return;
      }

      // Step 2: Fetch the actual listings using the IDs
      const listingIds = favoriteIds.map(f => f.item_id);
      const { data: listingsData, error: listingsError } = await supabase
        .from('marketplace_listings')
        .select('id, title, description, price, currency, listing_type, car_brand, car_model, location, status, images, thumbnail_url, created_at')
        .in('id', listingIds)
        .eq('status', 'active');

      if (listingsError) {
        console.error('❌ Error fetching listings:', listingsError);
        throw listingsError;
      }
      
      console.log('✅ Loaded favorite listings:', listingsData?.length || 0);
      setFavoriteListings(listingsData as any || []);
    } catch (error: any) {
      console.error('Error loading favorite listings:', error);
      setFavoriteListings([]);
    }
  };

  const loadFavoriteGarages = async () => {
    try {
      console.log('🔍 Loading favorite garages for user:', userId);
      
      // Step 1: Get favorite item IDs for garages (using polymorphic design)
      const { data: favoriteIds, error: favError } = await supabase
        .from('user_favorites')
        .select('item_id')
        .eq('user_id', userId)
        .eq('item_type', 'garage');

      if (favError) {
        console.error('❌ Error fetching favorite garage IDs:', favError);
        throw favError;
      }

      if (!favoriteIds || favoriteIds.length === 0) {
        console.log('ℹ️ No favorite garages found');
        setFavoriteGarages([]);
        return;
      }

      // Step 2: Fetch the actual garages using the IDs
      const garageIds = favoriteIds.map(f => f.item_id);
      const { data: garagesData, error: garagesError } = await supabase
        .from('garages')
        .select('id, name, description, address, rating, created_at')
        .in('id', garageIds);

      if (garagesError) {
        console.error('❌ Error fetching garages:', garagesError);
        throw garagesError;
      }
      
      console.log('✅ Loaded favorite garages:', garagesData?.length || 0);
      setFavoriteGarages(garagesData as any || []);
    } catch (error: any) {
      console.error('Error loading favorite garages:', error);
      setFavoriteGarages([]);
    }
  };

  const handleRemoveFavorite = async (itemType: string, itemId: string) => {
    if (!confirm('Remove this item from favorites?')) return;

    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('item_type', itemType)
        .eq('item_id', itemId);

      if (error) throw error;

      toast.success('Removed from favorites');
      loadAllFavorites();
    } catch (error: any) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove from favorites');
    }
  };

  const getTotalCount = () => {
    return (
      favoriteOffers.length +
      favoritePosts.length +
      favoriteEvents.length +
      favoriteMeetups.length +
      favoriteListings.length +
      favoriteGarages.length
    );
  };

  if (!isOwnProfile) {
    return (
      <div className="text-center py-8 text-gray-400">
        Favorites are private
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-[#D4AF37]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl text-[#E8EAED] mb-1">My Favorites</h3>
        <p className="text-sm text-gray-400">
          {getTotalCount()} items saved across all categories
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-[#0B1426] border-gray-800 flex-wrap h-auto gap-2 p-2">
          <TabsTrigger value="all" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]">
            <Heart className="w-4 h-4 mr-2" />
            All ({getTotalCount()})
          </TabsTrigger>
          <TabsTrigger value="offers" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]">
            <Tag className="w-4 h-4 mr-2" />
            Offers ({favoriteOffers.length})
          </TabsTrigger>
          <TabsTrigger value="posts" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]">
            <MessageSquare className="w-4 h-4 mr-2" />
            Posts ({favoritePosts.length})
          </TabsTrigger>
          <TabsTrigger value="events" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]">
            <Calendar className="w-4 h-4 mr-2" />
            Events ({favoriteEvents.length})
          </TabsTrigger>
          <TabsTrigger value="meetups" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]">
            <Users className="w-4 h-4 mr-2" />
            Meetups ({favoriteMeetups.length})
          </TabsTrigger>
          <TabsTrigger value="listings" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Listings ({favoriteListings.length})
          </TabsTrigger>
          <TabsTrigger value="garages" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]">
            <Wrench className="w-4 h-4 mr-2" />
            Garages ({favoriteGarages.length})
          </TabsTrigger>
        </TabsList>

        {/* All Tab */}
        <TabsContent value="all" className="space-y-6 mt-6">
          {getTotalCount() === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg text-[#E8EAED] mb-2">No favorites yet</h3>
              <p className="text-sm text-gray-400">Start saving items you love!</p>
            </div>
          ) : (
            <>
              {/* Offers Section */}
              {favoriteOffers.length > 0 && (
                <div>
                  <h4 className="text-md text-[#E8EAED] mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#D4AF37]" />
                    Offers ({favoriteOffers.length})
                  </h4>
                  <div className="grid gap-3">
                    {favoriteOffers.slice(0, 3).map((offer) => (
                      <Card key={offer.id} className="bg-[#0B1426] border-gray-800">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h5 className="text-[#E8EAED] mb-1 truncate">{offer.title}</h5>
                              <p className="text-sm text-gray-400 line-clamp-1">{offer.description}</p>
                              <div className="flex items-center gap-3 mt-2">
                                {offer.discount_percent && (
                                  <Badge variant="secondary" className="bg-green-900/20 text-green-400">
                                    {offer.discount_percent}% OFF
                                  </Badge>
                                )}
                                {offer.valid_until && (
                                  <span className="text-xs text-gray-500">
                                    Valid until {new Date(offer.valid_until).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFavorite('offer', offer.id)}
                              className="text-red-400 hover:text-red-300 ml-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {favoriteOffers.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab('offers')}
                      className="w-full mt-2 text-[#D4AF37]"
                    >
                      View all {favoriteOffers.length} offers
                    </Button>
                  )}
                </div>
              )}

              {/* Posts Section */}
              {favoritePosts.length > 0 && (
                <div>
                  <Separator className="bg-gray-800 my-4" />
                  <h4 className="text-md text-[#E8EAED] mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#D4AF37]" />
                    Community Posts ({favoritePosts.length})
                  </h4>
                  <div className="grid gap-3">
                    {favoritePosts.slice(0, 3).map((post) => (
                      <Card key={post.id} className="bg-[#0B1426] border-gray-800">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-[#E8EAED] line-clamp-2 mb-2">{post.content}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                {post.profiles?.username && (
                                  <span>by @{post.profiles.username}</span>
                                )}
                                <span>•</span>
                                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFavorite('post', post.id)}
                              className="text-red-400 hover:text-red-300 ml-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {favoritePosts.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab('posts')}
                      className="w-full mt-2 text-[#D4AF37]"
                    >
                      View all {favoritePosts.length} posts
                    </Button>
                  )}
                </div>
              )}

              {/* Events Section */}
              {favoriteEvents.length > 0 && (
                <div>
                  <Separator className="bg-gray-800 my-4" />
                  <h4 className="text-md text-[#E8EAED] mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#D4AF37]" />
                    Events ({favoriteEvents.length})
                  </h4>
                  <div className="grid gap-3">
                    {favoriteEvents.slice(0, 3).map((event) => (
                      <Card key={event.id} className="bg-[#0B1426] border-gray-800">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h5 className="text-[#E8EAED] mb-1 truncate">{event.title}</h5>
                              <p className="text-sm text-gray-400 line-clamp-1">{event.description}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                <span>📅 {new Date(event.start_time).toLocaleDateString()}</span>
                                <span>📍 {event.address || 'TBA'}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFavorite('event', event.id)}
                              className="text-red-400 hover:text-red-300 ml-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {favoriteEvents.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab('events')}
                      className="w-full mt-2 text-[#D4AF37]"
                    >
                      View all {favoriteEvents.length} events
                    </Button>
                  )}
                </div>
              )}

              {/* Meetups Section */}
              {favoriteMeetups.length > 0 && (
                <div>
                  <Separator className="bg-gray-800 my-4" />
                  <h4 className="text-md text-[#E8EAED] mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#D4AF37]" />
                    Instant Meetups ({favoriteMeetups.length})
                  </h4>
                  <div className="grid gap-3">
                    {favoriteMeetups.slice(0, 3).map((meetup) => (
                      <Card key={meetup.id} className="bg-[#0B1426] border-gray-800">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h5 className="text-[#E8EAED] mb-1 truncate">{meetup.title}</h5>
                              <p className="text-sm text-gray-400 line-clamp-1">{meetup.description}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                <span>🕐 {new Date(meetup.scheduled_at).toLocaleString()}</span>
                                <span>📍 {meetup.address || 'TBA'}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFavorite('meetup', meetup.id)}
                              className="text-red-400 hover:text-red-300 ml-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {favoriteMeetups.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab('meetups')}
                      className="w-full mt-2 text-[#D4AF37]"
                    >
                      View all {favoriteMeetups.length} meetups
                    </Button>
                  )}
                </div>
              )}

              {/* Listings Section */}
              {favoriteListings.length > 0 && (
                <div>
                  <Separator className="bg-gray-800 my-4" />
                  <h4 className="text-md text-[#E8EAED] mb-3 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
                    Marketplace Listings ({favoriteListings.length})
                  </h4>
                  <div className="grid gap-3">
                    {favoriteListings.slice(0, 3).map((listing) => (
                      <Card key={listing.id} className="bg-[#0B1426] border-gray-800">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Car className="w-4 h-4 text-[#D4AF37]" />
                                <h5 className="text-[#E8EAED] truncate">{listing.title}</h5>
                              </div>
                              <p className="text-sm text-gray-400 line-clamp-1">{listing.description}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-[#D4AF37]">
                                  AED {listing.price?.toLocaleString()}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {listing.condition}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFavorite('listing', listing.id)}
                              className="text-red-400 hover:text-red-300 ml-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {favoriteListings.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab('listings')}
                      className="w-full mt-2 text-[#D4AF37]"
                    >
                      View all {favoriteListings.length} listings
                    </Button>
                  )}
                </div>
              )}

              {/* Garages Section */}
              {favoriteGarages.length > 0 && (
                <div>
                  <Separator className="bg-gray-800 my-4" />
                  <h4 className="text-md text-[#E8EAED] mb-3 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-[#D4AF37]" />
                    Garages ({favoriteGarages.length})
                  </h4>
                  <div className="grid gap-3">
                    {favoriteGarages.slice(0, 3).map((garage) => (
                      <Card key={garage.id} className="bg-[#0B1426] border-gray-800">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h5 className="text-[#E8EAED] mb-1 truncate">{garage.name}</h5>
                              <p className="text-sm text-gray-400 line-clamp-1">{garage.description}</p>
                              <div className="flex items-center gap-3 mt-2">
                                {garage.rating && (
                                  <div className="flex items-center gap-1 text-xs text-[#D4AF37]">
                                    <Star className="w-3 h-3 fill-current" />
                                    <span>{garage.rating.toFixed(1)}</span>
                                  </div>
                                )}
                                <span className="text-xs text-gray-500">📍 {garage.address || 'Location not set'}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFavorite('garage', garage.id)}
                              className="text-red-400 hover:text-red-300 ml-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {favoriteGarages.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab('garages')}
                      className="w-full mt-2 text-[#D4AF37]"
                    >
                      View all {favoriteGarages.length} garages
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Individual Category Tabs */}
        <TabsContent value="offers" className="mt-6">
          {favoriteOffers.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg text-[#E8EAED] mb-2">No favorite offers</h3>
              <p className="text-sm text-gray-400">Save offers to access them quickly</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {favoriteOffers.map((offer) => (
                <Card key={offer.id} className="bg-[#151B2E] border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg text-[#E8EAED] mb-2">{offer.title}</h4>
                        <p className="text-sm text-gray-400 mb-3">{offer.description}</p>
                        <div className="flex items-center gap-4 flex-wrap">
                          <Badge variant="secondary" className="bg-green-900/30 text-green-400">
                            {offer.discount_percentage}% OFF
                          </Badge>
                          {offer.vendor_name && (
                            <span className="text-xs text-gray-500">by {offer.vendor_name}</span>
                          )}
                          <span className="text-xs text-gray-500">
                            Valid: {new Date(offer.valid_from).toLocaleDateString()} - {new Date(offer.valid_until).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFavorite('offer', offer.id)}
                        className="text-red-400 hover:text-red-300 ml-4"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="posts" className="mt-6">
          {favoritePosts.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg text-[#E8EAED] mb-2">No favorite posts</h3>
              <p className="text-sm text-gray-400">Save posts to read them later</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {favoritePosts.map((post) => (
                <Card key={post.id} className="bg-[#151B2E] border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-[#E8EAED] mb-3">{post.content}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          {post.profiles?.username && (
                            <span>by @{post.profiles.username}</span>
                          )}
                          {post.communities?.name && (
                            <>
                              <span>•</span>
                              <span>in {post.communities.name}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFavorite('post', post.id)}
                        className="text-red-400 hover:text-red-300 ml-4"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          {favoriteEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg text-[#E8EAED] mb-2">No favorite events</h3>
              <p className="text-sm text-gray-400">Save events you want to attend</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {favoriteEvents.map((event) => (
                <Card key={event.id} className="bg-[#151B2E] border-gray-800">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="secondary" className="text-xs">{event.event_type}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFavorite('event', event.id)}
                        className="text-red-400 hover:text-red-300 -mr-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <h4 className="text-[#E8EAED] mb-2">{event.title}</h4>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-3">{event.description}</p>
                    <div className="space-y-1 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(event.event_date).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="meetups" className="mt-6">
          {favoriteMeetups.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg text-[#E8EAED] mb-2">No favorite meetups</h3>
              <p className="text-sm text-gray-400">Save instant meetups to join them later</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {favoriteMeetups.map((meetup) => (
                <Card key={meetup.id} className="bg-[#151B2E] border-gray-800">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="secondary" className="text-xs bg-blue-900/30 text-blue-400">
                        Instant Meetup
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFavorite('meetup', meetup.id)}
                        className="text-red-400 hover:text-red-300 -mr-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <h4 className="text-[#E8EAED] mb-2">{meetup.title}</h4>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-3">{meetup.description}</p>
                    <div className="space-y-1 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(meetup.meetup_time).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        <span>{meetup.location}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="listings" className="mt-6">
          {favoriteListings.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg text-[#E8EAED] mb-2">No favorite listings</h3>
              <p className="text-sm text-gray-400">Save cars and parts you're interested in</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {favoriteListings.map((listing) => (
                <Card key={listing.id} className="bg-[#151B2E] border-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {listing.listing_type === 'car' ? '🚗 Car' : '📦 Parts'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFavorite('listing', listing.id)}
                        className="text-red-400 hover:text-red-300 -mr-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <h4 className="text-[#E8EAED] mb-1 truncate">{listing.title}</h4>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-3">{listing.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg text-[#D4AF37]">
                        AED {listing.price?.toLocaleString()}
                      </span>
                      <Button size="sm" variant="outline" className="text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="garages" className="mt-6">
          {favoriteGarages.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg text-[#E8EAED] mb-2">No favorite garages</h3>
              <p className="text-sm text-gray-400">Save garages for quick access</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {favoriteGarages.map((garage) => (
                <Card key={garage.id} className="bg-[#151B2E] border-gray-800">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      {garage.rating && (
                        <div className="flex items-center gap-1 text-[#D4AF37]">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm">{garage.rating.toFixed(1)}</span>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFavorite('garage', garage.id)}
                        className="text-red-400 hover:text-red-300 -mr-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <h4 className="text-[#E8EAED] mb-2">{garage.name}</h4>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-3">{garage.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{garage.location}</span>
                      </div>
                      {garage.specialties && garage.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {garage.specialties.slice(0, 3).map((specialty, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
