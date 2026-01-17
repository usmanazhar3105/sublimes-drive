/**
 * EventsPage - Wired with Supabase Hooks
 * 
 * Uses: useEvents, useRole, useAnalytics
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Calendar,
  MapPin,
  Users,
  Clock,
  Plus,
  Search,
  Car,
  Trophy,
  Camera,
  Zap,
  ChevronRight,
  Star,
  Loader2,
  X,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';

// Import Supabase hooks
import { useEvents, useRole, useAnalytics } from '../hooks';

interface EventsPageProps {
  onNavigate?: (page: string) => void;
}

export function EventsPage({ onNavigate }: EventsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');

  // 🔥 SUPABASE HOOKS
  const { 
    events, 
    loading, 
    error, 
    createEvent, 
    rsvpToEvent, 
    cancelRSVP,
    getUserRSVPs,
    refetch 
  } = useEvents({
    upcoming: selectedTimeframe === 'upcoming',
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
  });

  const { profile, isAdmin } = useRole();
  const analytics = useAnalytics();

  const [userRSVPs, setUserRSVPs] = useState<Set<string>>(new Set());

  // Track page view
  useEffect(() => {
    analytics.trackPageView('/events');
  }, []);

  // Load user RSVPs
  useEffect(() => {
    const loadUserRSVPs = async () => {
      const { data } = await getUserRSVPs();
      if (data) {
        setUserRSVPs(new Set(data.map(rsvp => rsvp.event_id)));
      }
    };
    
    if (profile) {
      loadUserRSVPs();
    }
  }, [profile]);

  const handleRSVP = async (eventId: string, status: 'going' | 'maybe' | 'declined') => {
    if (!profile) {
      toast.error('Please login to RSVP');
      onNavigate?.('login');
      return;
    }

    const { error } = await rsvpToEvent(eventId, status);
    
    if (!error) {
      setUserRSVPs(prev => new Set([...prev, eventId]));
      toast.success(status === 'going' ? 'RSVP confirmed!' : 'RSVP updated');
      analytics.trackEventRSVP(eventId, status);
    } else {
      toast.error('Failed to RSVP');
    }
  };

  const handleCancelRSVP = async (eventId: string) => {
    const { error } = await cancelRSVP(eventId);
    
    if (!error) {
      setUserRSVPs(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
      toast.success('RSVP cancelled');
    } else {
      toast.error('Failed to cancel RSVP');
    }
  };

  const categories = [
    { value: 'all', label: 'All Events', icon: Calendar },
    { value: 'meetup', label: 'Meetups', icon: Users },
    { value: 'racing', label: 'Racing', icon: Zap },
    { value: 'photography', label: 'Photography', icon: Camera },
    { value: 'adventure', label: 'Adventure', icon: Car },
    { value: 'competition', label: 'Competitions', icon: Trophy },
  ];

  const filteredEvents = events.filter(event => {
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category);
    const Icon = cat?.icon || Calendar;
    return <Icon size={16} />;
  };

  return (
    <div className="min-h-screen bg-[#0B1426]">
      {/* Header */}
      <div className="bg-[#0F1829] border-b border-[#1A2332]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl text-[#E8EAED] mb-2">Events</h1>
              <p className="text-sm text-[#8B92A7]">
                {loading ? 'Loading...' : `${filteredEvents.length} events found`}
              </p>
            </div>
            
            {isAdmin && (
              <Button
                onClick={() => onNavigate?.('create-event')}
                className="bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426] gap-2"
              >
                <Plus size={20} />
                Create Event
              </Button>
            )}
          </div>

          {/* Search & Filters */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B92A7]" size={20} />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1A2332] border-[#2A3342] text-[#E8EAED]"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48 bg-[#1A2332] border-[#2A3342] text-[#E8EAED]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A2332] border-[#2A3342]">
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value} className="text-[#E8EAED]">
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-40 bg-[#1A2332] border-[#2A3342] text-[#E8EAED]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A2332] border-[#2A3342]">
                <SelectItem value="upcoming" className="text-[#E8EAED]">Upcoming</SelectItem>
                <SelectItem value="past" className="text-[#E8EAED]">Past</SelectItem>
                <SelectItem value="all" className="text-[#E8EAED]">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mb-4" />
            <p className="text-[#8B92A7]">Loading events...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="bg-red-500/10 border-red-500">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <X className="text-red-400 mt-1" size={20} />
                <div>
                  <h3 className="text-red-400 font-semibold mb-1">Error Loading Events</h3>
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
        )}

        {/* Empty State */}
        {!loading && !error && filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl text-[#E8EAED] mb-2">No events found</h3>
            <p className="text-[#8B92A7] mb-6">
              {searchQuery 
                ? "Try adjusting your search or filters" 
                : "No events scheduled at the moment"}
            </p>
            {isAdmin && (
              <Button
                onClick={() => onNavigate?.('create-event')}
                className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C19B2E]"
              >
                Create First Event
              </Button>
            )}
          </div>
        )}

        {/* Events Grid */}
        {!loading && !error && filteredEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const hasRSVP = userRSVPs.has(event.id);
              const spotsLeft = (event.max_participants || 0) - (event.current_participants || 0);
              const isAlmostFull = spotsLeft <= 5;

              return (
                <Card 
                  key={event.id}
                  className="bg-[#0F1829] border-[#1A2332] hover:border-[#D4AF37]/30 transition-all overflow-hidden group"
                >
                  {/* Event Image */}
                  <div className="relative h-48 bg-[#1A2332] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1426] to-transparent z-10" />
                    
                    {/* Category Badge */}
                    <Badge className="absolute top-3 left-3 z-20 bg-[#D4AF37]/90 text-[#0B1426] border-0">
                      <span className="mr-1">{getCategoryIcon(event.category || 'meetup')}</span>
                      {event.category || 'Event'}
                    </Badge>

                    {/* RSVP Status */}
                    {hasRSVP && (
                      <Badge className="absolute top-3 right-3 z-20 bg-green-500 text-white border-0">
                        <CheckCircle size={14} className="mr-1" />
                        Going
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-lg text-[#E8EAED] mb-2 group-hover:text-[#D4AF37] transition-colors">
                      {event.title}
                    </h3>
                    
                    <p className="text-sm text-[#8B92A7] mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    {/* Event Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-[#8B92A7]">
                        <Calendar size={16} className="text-[#D4AF37]" />
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-[#8B92A7]">
                        <MapPin size={16} className="text-[#D4AF37]" />
                        {event.location}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-[#8B92A7]">
                        <Users size={16} className="text-[#D4AF37]" />
                        {event.current_participants || 0} / {event.max_participants || 0} attending
                      </div>
                    </div>

                    {/* Spots Left Warning */}
                    {isAlmostFull && spotsLeft > 0 && (
                      <div className="mb-4 p-2 bg-orange-500/10 border border-orange-500/20 rounded">
                        <p className="text-xs text-orange-400">
                          ⚠️ Only {spotsLeft} spots left!
                        </p>
                      </div>
                    )}

                    {/* Full Event */}
                    {spotsLeft <= 0 && (
                      <div className="mb-4 p-2 bg-red-500/10 border border-red-500/20 rounded">
                        <p className="text-xs text-red-400">
                          Event is full
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {!hasRSVP && spotsLeft > 0 && (
                        <Button
                          onClick={() => handleRSVP(event.id, 'going')}
                          className="flex-1 bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426]"
                        >
                          <CheckCircle size={16} className="mr-2" />
                          RSVP
                        </Button>
                      )}

                      {hasRSVP && (
                        <Button
                          onClick={() => handleCancelRSVP(event.id)}
                          variant="outline"
                          className="flex-1 border-red-400 text-red-400 hover:bg-red-400/10"
                        >
                          <XCircle size={16} className="mr-2" />
                          Cancel
                        </Button>
                      )}

                      <Button
                        onClick={() => {
                          analytics.trackEvent('event_viewed', { event_id: event.id });
                          onNavigate?.(`event-detail-${event.id}`);
                        }}
                        variant="outline"
                        className="border-[#2A3342] text-[#E8EAED] hover:bg-[#1A2332]"
                      >
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
