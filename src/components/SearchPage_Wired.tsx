/**
 * SearchPage - Wired with Supabase Hooks
 * 
 * Uses: useListings, useCommunities, useEvents, useGarages, useAnalytics
 */

import { useState, useEffect } from 'react';
import { 
  Search, Filter, X, MapPin, Calendar, Users, Star, 
  Car, Wrench, Loader2, ChevronRight, Tag, TrendingUp 
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner';

// Import Supabase hooks
import { useListings, useCommunities, useEvents, useGarages, useAnalytics } from '../hooks';

interface SearchPageProps {
  onNavigate?: (page: string) => void;
  initialQuery?: string;
}

export function SearchPage({ onNavigate, initialQuery = '' }: SearchPageProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // 🔥 SUPABASE HOOKS - Search across all content
  const { listings, loading: listingsLoading } = useListings({ 
    search: debouncedQuery,
    limit: 20 
  });
  
  const { communities, posts, loading: communitiesLoading } = useCommunities({ 
    search: debouncedQuery 
  });
  
  const { events, loading: eventsLoading } = useEvents({ 
    search: debouncedQuery 
  });
  
  const { garages, loading: garagesLoading } = useGarages({ 
    search: debouncedQuery 
  });

  const analytics = useAnalytics();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      if (searchQuery.trim()) {
        analytics.trackSearch(searchQuery);
        // Save to recent searches
        setRecentSearches(prev => {
          const updated = [searchQuery, ...prev.filter(q => q !== searchQuery)];
          return updated.slice(0, 5);
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Track page view
  useEffect(() => {
    analytics.trackPageView('/search');
  }, []);

  const loading = listingsLoading || communitiesLoading || eventsLoading || garagesLoading;
  
  const totalResults = 
    listings.length + 
    communities.length + 
    posts.length + 
    events.length + 
    garages.length;

  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
  };

  const handleRecentSearchClick = (query: string) => {
    setSearchQuery(query);
    analytics.trackEvent('recent_search_clicked', { query });
  };

  return (
    <div className="min-h-screen bg-[#0B1426]">
      {/* Header */}
      <div className="bg-[#0F1829] border-b border-[#1A2332]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl text-[#E8EAED] mb-6">Search</h1>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B92A7]" size={20} />
            <Input
              placeholder="Search communities, listings, events, and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-12 h-12 bg-[#1A2332] border-[#2A3342] text-[#E8EAED] text-lg"
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <X size={20} />
              </Button>
            )}
          </div>

          {/* Results Count */}
          {debouncedQuery && (
            <p className="text-sm text-[#8B92A7] mt-3">
              {loading ? 'Searching...' : `${totalResults} results found`}
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* No Query - Show Recent Searches */}
        {!debouncedQuery && (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-[#0F1829] border-[#1A2332]">
              <CardContent className="p-6">
                <h3 className="text-lg text-[#E8EAED] mb-4">Recent Searches</h3>
                {recentSearches.length > 0 ? (
                  <div className="space-y-2">
                    {recentSearches.map((query, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-3 bg-[#1A2332] rounded-lg hover:bg-[#1A2332]/70 transition-colors cursor-pointer"
                        onClick={() => handleRecentSearchClick(query)}
                      >
                        <div className="flex items-center gap-3">
                          <Search size={16} className="text-[#8B92A7]" />
                          <span className="text-[#E8EAED]">{query}</span>
                        </div>
                        <ChevronRight size={16} className="text-[#8B92A7]" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Search className="mx-auto mb-3 text-[#8B92A7]" size={48} />
                    <p className="text-[#8B92A7]">No recent searches</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Popular Searches */}
            <Card className="bg-[#0F1829] border-[#1A2332] mt-6">
              <CardContent className="p-6">
                <h3 className="text-lg text-[#E8EAED] mb-4">Popular Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {['Supercars', 'Car Meet', 'Dubai', 'JDM', 'BMW', 'Detailing', 'Track Day', 'Garage'].map((term) => (
                    <Badge
                      key={term}
                      className="bg-[#1A2332] text-[#E8EAED] hover:bg-[#D4AF37] hover:text-[#0B1426] cursor-pointer border-0 transition-colors"
                      onClick={() => {
                        setSearchQuery(term);
                        analytics.trackEvent('popular_search_clicked', { term });
                      }}
                    >
                      {term}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search Results */}
        {debouncedQuery && (
          <>
            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mb-4" />
                <p className="text-[#8B92A7]">Searching...</p>
              </div>
            )}

            {/* Results Tabs */}
            {!loading && (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-[#1A2332] border border-[#2A3342] mb-6">
                  <TabsTrigger 
                    value="all" 
                    className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]"
                  >
                    All ({totalResults})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="listings" 
                    className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]"
                  >
                    Listings ({listings.length})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="communities" 
                    className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]"
                  >
                    Communities ({communities.length})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="events" 
                    className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]"
                  >
                    Events ({events.length})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="garages" 
                    className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]"
                  >
                    Garages ({garages.length})
                  </TabsTrigger>
                </TabsList>

                {/* All Results */}
                <TabsContent value="all">
                  {totalResults === 0 ? (
                    <div className="text-center py-16">
                      <Search className="mx-auto mb-4 text-[#8B92A7]" size={64} />
                      <h3 className="text-xl text-[#E8EAED] mb-2">No results found</h3>
                      <p className="text-[#8B92A7]">Try different keywords or check your spelling</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Listings Results */}
                      {listings.length > 0 && (
                        <div>
                          <h3 className="text-lg text-[#E8EAED] mb-4">Marketplace Listings</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {listings.slice(0, 6).map((listing) => (
                              <Card 
                                key={listing.id}
                                className="bg-[#0F1829] border-[#1A2332] hover:border-[#D4AF37]/30 transition-all cursor-pointer"
                                onClick={() => {
                                  analytics.trackEvent('search_result_clicked', { 
                                    type: 'listing', 
                                    id: listing.id 
                                  });
                                  onNavigate?.(`listing-${listing.id}`);
                                }}
                              >
                                <CardContent className="p-4">
                                  <h4 className="text-[#E8EAED] mb-2 line-clamp-1">{listing.title}</h4>
                                  <p className="text-sm text-[#8B92A7] mb-3 line-clamp-2">{listing.description}</p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[#D4AF37]">AED {listing.price?.toLocaleString()}</span>
                                    <Badge className="bg-[#D4AF37]/10 text-[#D4AF37] border-0">
                                      {listing.category}
                                    </Badge>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Communities Results */}
                      {communities.length > 0 && (
                        <div>
                          <h3 className="text-lg text-[#E8EAED] mb-4">Communities</h3>
                          <div className="space-y-3">
                            {communities.slice(0, 5).map((community) => (
                              <Card 
                                key={community.id}
                                className="bg-[#0F1829] border-[#1A2332] hover:border-[#D4AF37]/30 transition-all cursor-pointer"
                                onClick={() => {
                                  analytics.trackEvent('search_result_clicked', { 
                                    type: 'community', 
                                    id: community.id 
                                  });
                                  onNavigate?.(`community-${community.id}`);
                                }}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="w-12 h-12">
                                      <AvatarImage src={community.image_url} />
                                      <AvatarFallback className="bg-[#D4AF37] text-[#0B1426]">
                                        {community.name[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <h4 className="text-[#E8EAED] mb-1">{community.name}</h4>
                                      <p className="text-sm text-[#8B92A7] line-clamp-1">{community.description}</p>
                                    </div>
                                    <Badge className="bg-[#1A2332] text-[#E8EAED] border-0">
                                      <Users size={14} className="mr-1" />
                                      {community.member_count || 0}
                                    </Badge>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Events Results */}
                      {events.length > 0 && (
                        <div>
                          <h3 className="text-lg text-[#E8EAED] mb-4">Events</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {events.slice(0, 4).map((event) => (
                              <Card 
                                key={event.id}
                                className="bg-[#0F1829] border-[#1A2332] hover:border-[#D4AF37]/30 transition-all cursor-pointer"
                                onClick={() => {
                                  analytics.trackEvent('search_result_clicked', { 
                                    type: 'event', 
                                    id: event.id 
                                  });
                                  onNavigate?.(`event-${event.id}`);
                                }}
                              >
                                <CardContent className="p-4">
                                  <h4 className="text-[#E8EAED] mb-2 line-clamp-1">{event.title}</h4>
                                  <div className="flex items-center gap-4 text-sm text-[#8B92A7] mb-2">
                                    <div className="flex items-center gap-1">
                                      <Calendar size={14} />
                                      {new Date(event.date).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <MapPin size={14} />
                                      {event.location}
                                    </div>
                                  </div>
                                  <Badge className="bg-[#D4AF37]/10 text-[#D4AF37] border-0">
                                    {event.current_participants || 0} attending
                                  </Badge>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Garages Results */}
                      {garages.length > 0 && (
                        <div>
                          <h3 className="text-lg text-[#E8EAED] mb-4">Garages</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {garages.slice(0, 4).map((garage) => (
                              <Card 
                                key={garage.id}
                                className="bg-[#0F1829] border-[#1A2332] hover:border-[#D4AF37]/30 transition-all cursor-pointer"
                                onClick={() => {
                                  analytics.trackEvent('search_result_clicked', { 
                                    type: 'garage', 
                                    id: garage.id 
                                  });
                                  onNavigate?.(`garage-${garage.id}`);
                                }}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <h4 className="text-[#E8EAED] flex-1">{garage.name}</h4>
                                    {garage.is_verified && (
                                      <Badge className="bg-green-500/10 text-green-400 border-0">
                                        Verified
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-[#8B92A7] mb-2">
                                    <MapPin size={14} />
                                    {garage.location}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Star size={14} className="text-[#D4AF37]" />
                                    <span className="text-sm text-[#E8EAED]">
                                      {garage.rating || 0}
                                    </span>
                                    <span className="text-sm text-[#8B92A7]">
                                      ({garage.reviews_count || 0} reviews)
                                    </span>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* Individual tabs would show filtered results */}
                <TabsContent value="listings">
                  {/* Similar to above but only listings */}
                </TabsContent>

                <TabsContent value="communities">
                  {/* Only communities */}
                </TabsContent>

                <TabsContent value="events">
                  {/* Only events */}
                </TabsContent>

                <TabsContent value="garages">
                  {/* Only garages */}
                </TabsContent>
              </Tabs>
            )}
          </>
        )}
      </div>
    </div>
  );
}
