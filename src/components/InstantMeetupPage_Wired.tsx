/**
 * InstantMeetupPage_Wired - Database-connected Instant Meetup page
 * Uses: useEvents, useAnalytics
 */

import { useState, useEffect } from 'react';
import { MapPin, Users, Clock, Search, Filter, Plus, Eye, MessageCircle, Share2, Loader2, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { PostCard } from './PostCard';
import { CreateMeetupModal } from './CreateMeetupModal';
import { toast } from 'sonner';
import { useEvents, useAnalytics } from '../hooks';

interface InstantMeetupPageProps {
  onNavigate?: (page: string) => void;
}

export function InstantMeetupPage({ onNavigate }: InstantMeetupPageProps) {
  // State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('active');
  const [selectedLocation, setSelectedLocation] = useState('all');

  // Hooks
  const { events, loading, error, createEvent, joinEvent, refetch } = useEvents({
    type: 'meetup',
    status: selectedTab === 'active' ? 'upcoming' : 'past',
  });
  const analytics = useAnalytics();

  // Track page view
  useEffect(() => {
    analytics.trackPageView('/instant-meetup');
  }, []);

  // Filter events
  const filteredEvents = events.filter((event) => {
    const matchesSearch = searchQuery === '' || 
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocation = selectedLocation === 'all' || event.location?.includes(selectedLocation);
    
    return matchesSearch && matchesLocation;
  });

  // Handlers
  const handleCreateMeetup = async (meetupData: any) => {
    analytics.trackEvent('meetup_create_clicked');
    const { error } = await createEvent({
      ...meetupData,
      type: 'meetup',
    });

    if (!error) {
      toast.success('Meetup created successfully!');
      setShowCreateModal(false);
      refetch();
    } else {
      toast.error('Failed to create meetup');
      analytics.trackError('meetup_creation_failed', { error: error.message });
    }
  };

  const handleJoinMeetup = async (eventId: string) => {
    analytics.trackEvent('meetup_join_clicked', { event_id: eventId });
    const { error } = await joinEvent(eventId);

    if (!error) {
      toast.success('Joined meetup successfully!');
      refetch();
    } else {
      toast.error('Failed to join meetup');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1426] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mb-4" />
        <p className="text-[#8B92A7]">Loading meetups...</p>
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
                <h3 className="text-red-400 mb-1" style={{ fontWeight: 600 }}>Error Loading Meetups</h3>
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
      <div className="bg-[#0F1829] border-b border-[#1A2332] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl text-[#E8EAED]" style={{ fontWeight: 600 }}>
                Instant Meetup
              </h1>
              <p className="text-[#8B92A7] mt-1">
                Connect with nearby car enthusiasts in real-time
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A037]"
            >
              <Plus className="mr-2" size={20} />
              Create Meetup
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B92A7]" size={20} />
              <Input
                placeholder="Search meetups by location, title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
              />
            </div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-4 py-2 bg-[#0B1426] border border-[#1A2332] rounded-lg text-[#E8EAED]"
            >
              <option value="all">All Locations</option>
              <option value="Dubai">Dubai</option>
              <option value="Abu Dhabi">Abu Dhabi</option>
              <option value="Sharjah">Sharjah</option>
              <option value="Ajman">Ajman</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
          <TabsList className="bg-[#0F1829] border border-[#1A2332]">
            <TabsTrigger value="active">Active Meetups</TabsTrigger>
            <TabsTrigger value="past">Past Meetups</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {!loading && filteredEvents.length === 0 && (
              <div className="text-center py-16">
                <MapPin className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
                <h3 className="text-xl text-[#E8EAED] mb-2">No Active Meetups</h3>
                <p className="text-[#8B92A7] mb-6">
                  Be the first to create a meetup in your area!
                </p>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A037]"
                >
                  <Plus className="mr-2" size={20} />
                  Create First Meetup
                </Button>
              </div>
            )}

            {filteredEvents.length > 0 && (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <Card key={event.id} className="bg-[#0F1829] border-[#1A2332]">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={event.creator?.avatar} />
                            <AvatarFallback>{event.creator?.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-[#E8EAED]" style={{ fontWeight: 600 }}>
                              {event.creator?.name}
                            </p>
                            <p className="text-xs text-[#8B92A7]">
                              {new Date(event.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {event.featured && (
                          <Badge className="bg-[#D4AF37] text-[#0B1426]">Featured</Badge>
                        )}
                      </div>

                      <h3 className="text-lg text-[#E8EAED] mb-2" style={{ fontWeight: 600 }}>
                        {event.title}
                      </h3>
                      <p className="text-[#8B92A7] mb-4">{event.description}</p>

                      <div className="flex flex-wrap gap-3 mb-4">
                        <div className="flex items-center gap-2 text-[#8B92A7]">
                          <MapPin size={16} />
                          <span className="text-sm">{event.location || 'TBA'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#8B92A7]">
                          <Clock size={16} />
                          <span className="text-sm">
                            {event.event_date ? new Date(event.event_date).toLocaleString() : 'TBA'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[#8B92A7]">
                          <Users size={16} />
                          <span className="text-sm">
                            {event.attendees_count || 0}/{event.max_attendees || 'Unlimited'} participants
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-[#8B92A7]">
                          <span className="flex items-center gap-1">
                            <Eye size={16} />
                            {event.views || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle size={16} />
                            {event.comments_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Share2 size={16} />
                            {event.shares_count || 0}
                          </span>
                        </div>
                        <Button
                          onClick={() => handleJoinMeetup(event.id)}
                          size="sm"
                          className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A037]"
                        >
                          Join Meetup
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {!loading && filteredEvents.length === 0 && (
              <div className="text-center py-16">
                <Clock className="w-16 h-16 text-[#8B92A7] mx-auto mb-4" />
                <h3 className="text-xl text-[#E8EAED] mb-2">No Past Meetups</h3>
                <p className="text-[#8B92A7]">Check back later for past meetup history</p>
              </div>
            )}

            {filteredEvents.length > 0 && (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <Card key={event.id} className="bg-[#0F1829] border-[#1A2332] opacity-75">
                    <CardContent className="p-6">
                      <Badge className="mb-3 bg-[#1A2332] text-[#8B92A7]">Ended</Badge>
                      <h3 className="text-lg text-[#E8EAED] mb-2">{event.title}</h3>
                      <p className="text-[#8B92A7] text-sm">{event.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Meetup Modal */}
      {showCreateModal && (
        <CreateMeetupModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateMeetup}
        />
      )}
    </div>
  );
}
