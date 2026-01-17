import { useState, useEffect } from 'react';
import { Heart, Filter, Search, Car, Home, Users, Star, MapPin, Calendar, Eye, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { supabase } from '../utils/supabase/client';

interface SavedPageProps {
  onNavigate?: (page: string) => void;
}

type SavedState = {
  posts: any[];
  cars: any[];
  garages: any[];
  meetups: any[];
};

export function SavedPage({ onNavigate }: SavedPageProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [savedItems, setSavedItems] = useState<SavedState>({ posts: [], cars: [], garages: [], meetups: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: auth } = await supabase.auth.getUser();
        const uid = auth.user?.id;
        if (!uid) {
          setSavedItems({ posts: [], cars: [], garages: [], meetups: [] });
          setLoading(false);
          return;
        }

        const postsSaved = await supabase
          .from('post_saves')
          .select('post_id, created_at')
          .eq('user_id', uid);

        let posts: any[] = [];
        if (!postsSaved.error && postsSaved.data && postsSaved.data.length) {
          const ids = postsSaved.data.map((r: any) => r.post_id);
          const { data: postsData } = await supabase
            .from('posts')
            .select('*')
            .in('id', ids);
          posts = (postsData || []).map((p: any) => ({
            id: p.id,
            type: 'post',
            title: p.title || p.content?.title || 'Post',
            author: p.author_name || p.user_name || 'User',
            avatar: p.author_avatar || p.avatar_url || '',
            image: Array.isArray(p.images) && p.images.length ? p.images[0] : p.image_url || '',
            likes: p.like_count || 0,
            comments: p.comment_count || 0,
            savedDate: postsSaved.data.find((r: any) => r.post_id === p.id)?.created_at || p.created_at
          }));
        }

        const listingsSaved = await supabase
          .from('listing_saves')
          .select('listing_id, created_at')
          .eq('user_id', uid);

        let cars: any[] = [];
        if (!listingsSaved.error && listingsSaved.data && listingsSaved.data.length) {
          const lids = listingsSaved.data.map((r: any) => r.listing_id);
          const { data: listings } = await supabase
            .from('marketplace_listings')
            .select('*')
            .in('id', lids);
          cars = (listings || []).map((l: any) => ({
            id: l.id,
            type: 'car',
            make: l.make || l.brand || '',
            model: l.model || '',
            year: l.year || l.manufacture_year || null,
            price: l.price || l.amount || 0,
            location: l.location || l.city || '',
            image: Array.isArray(l.images) && l.images.length ? l.images[0] : l.thumbnail_url || '',
            savedDate: listingsSaved.data.find((r: any) => r.listing_id === l.id)?.created_at || l.created_at
          }));
        }

        // Garages saves (multiple table name fallbacks)
        let garages: any[] = [];
        try {
          const gs1 = await supabase.from('garage_saves').select('garage_id, created_at').eq('user_id', uid);
          const gsData = !gs1.error ? gs1.data : [];
          let garageIds: string[] = (gsData || []).map((r: any) => r.garage_id);
          if ((!garageIds || garageIds.length === 0) && gs1.error) {
            const gs2 = await supabase.from('favorite_garages').select('garage_id, created_at').eq('user_id', uid);
            if (!gs2.error) {
              garageIds = (gs2.data || []).map((r: any) => r.garage_id);
            }
          }
          if (garageIds && garageIds.length) {
            const { data: gdata } = await supabase
              .from('garages')
              .select('*')
              .in('id', garageIds);
            garages = (gdata || []).map((g: any) => ({
              id: g.id,
              type: 'garage',
              name: g.name || g.title || 'Garage',
              rating: g.rating || 0,
              location: g.location || g.city || '',
              specialties: g.specialties || [],
              image: Array.isArray(g.images) && g.images.length ? g.images[0] : g.thumbnail_url || '',
              savedDate: new Date(g.created_at || Date.now()).toISOString()
            }));
          }
        } catch {}

        // Events saves (multiple table name fallbacks)
        let meetups: any[] = [];
        try {
          const es1 = await supabase.from('event_saves').select('event_id, created_at').eq('user_id', uid);
          const eIds1 = !es1.error ? (es1.data || []).map((r: any) => r.event_id) : [];
          let eventIds: string[] = eIds1;
          if ((!eventIds || eventIds.length === 0) && es1.error) {
            const es2 = await supabase.from('saved_events').select('event_id, created_at').eq('user_id', uid);
            if (!es2.error) {
              eventIds = (es2.data || []).map((r: any) => r.event_id);
            }
          }
          if (eventIds && eventIds.length) {
            const { data: events } = await supabase
              .from('events')
              .select('*')
              .in('id', eventIds);
            meetups = (events || []).map((e: any) => ({
              id: e.id,
              type: 'meetup',
              title: e.title || 'Event',
              date: e.date || e.starts_at || e.created_at,
              location: e.location || e.city || '',
              attendees: e.attendees_count || 0,
              organizer: e.organizer_name || '',
              image: Array.isArray(e.images) && e.images.length ? e.images[0] : e.thumbnail_url || '',
              savedDate: new Date(e.created_at || Date.now()).toISOString()
            }));
          }
        } catch {}

        setSavedItems({ posts, cars, garages, meetups });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getAllSavedItems = () => {
    return [
      ...savedItems.posts,
      ...savedItems.cars,
      ...savedItems.garages,
      ...savedItems.meetups
    ].sort((a, b) => new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime());
  };

  const getFilteredItems = () => {
    let items = activeTab === 'all' ? getAllSavedItems() : savedItems[activeTab as keyof typeof savedItems] || [];
    
    if (searchQuery) {
      items = items.filter(item => 
        (item.title || item.name || `${item.make} ${item.model}`)
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    return items;
  };

  const renderSavedItem = (item: any) => {
    switch (item.type) {
      case 'post':
        return (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={item.avatar} />
                  <AvatarFallback>{item.author[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{item.author}</span>
                    <Badge variant="secondary" className="text-xs">Post</Badge>
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <ImageWithFallback 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {item.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {item.comments}
                      </span>
                    </div>
                    <span>Saved {new Date(item.savedDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'car':
        return (
          <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-0">
              <ImageWithFallback 
                src={item.image} 
                alt={`${item.make} ${item.model}`}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{item.make} {item.model}</h3>
                  <Badge variant="secondary" className="text-xs">Car</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{item.year}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-[var(--sublimes-gold)]">AED {item.price.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {item.location}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Saved {new Date(item.savedDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'garage':
        return (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <ImageWithFallback 
                  src={item.image} 
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{item.name}</h3>
                    <Badge variant="secondary" className="text-xs">Garage</Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{item.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{item.location}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.specialties.slice(0, 2).map((specialty: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {item.specialties.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{item.specialties.length - 2} more
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Saved {new Date(item.savedDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'meetup':
        return (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <ImageWithFallback 
                  src={item.image} 
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{item.title}</h3>
                    <Badge variant="secondary" className="text-xs">Meetup</Badge>
                  </div>
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {item.location}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {item.attendees} attending
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Saved {new Date(item.savedDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const totalSaved = getAllSavedItems().length;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Heart className="h-6 w-6 text-red-500" />
                Saved Items
              </h1>
              <p className="text-sm text-muted-foreground">{totalSaved} items saved</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Search and Filter */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search saved items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="type">Type</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({totalSaved})</TabsTrigger>
            <TabsTrigger value="posts">Posts ({savedItems.posts.length})</TabsTrigger>
            <TabsTrigger value="cars">Cars ({savedItems.cars.length})</TabsTrigger>
            <TabsTrigger value="garages">Garages ({savedItems.garages.length})</TabsTrigger>
            <TabsTrigger value="meetups">Events ({savedItems.meetups.length})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="space-y-4">
              {getFilteredItems().length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No saved items</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery ? 'No items match your search.' : 'Start saving posts, cars, garages, and events to see them here!'}
                    </p>
                    {!searchQuery && (
                      <Button onClick={() => onNavigate?.('home')}>
                        Browse Content
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                getFilteredItems().map(renderSavedItem)
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}