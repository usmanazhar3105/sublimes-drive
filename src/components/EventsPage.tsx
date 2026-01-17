import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Calendar,
  MapPin,
  Users,
  Clock,
  Plus,
  Filter,
  Search,
  Car,
  Trophy,
  Camera,
  Zap,
  ChevronRight,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

interface EventsPageProps {
  onNavigate?: (page: string) => void;
}

export function EventsPage({ onNavigate }: EventsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTimeframe, setSelectedTimeframe] = useState('Upcoming');
  const [userRSVPs, setUserRSVPs] = useState<Set<string>>(new Set()); // Track which events user has RSVP'd to

  const [events, setEvents] = useState([
    {
      id: '1',
      title: 'All Chinese Brands Grand Meetup',
      description: 'The biggest gathering of Chinese car brands in the UAE. Food trucks, music, and awards for best car.',
      date: '2025-12-12',
      time: '9:00 PM',
      location: 'Dubai Festival City',
      category: 'meetup',
      maxParticipants: 200,
      currentParticipants: 110,
      spotsLeft: 90,
      image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=200&fit=crop',
      isSponsored: false,
      organizer: 'Sublimes Drive',
      carBrands: ['All Chinese Brands'],
      features: ['Car Display', 'Food Trucks', 'Music', 'Awards Ceremony']
    },
    {
      id: '2',
      title: 'Geely Coolray Owners Track Day',
      description: 'Experience the thrill of the track at Dubai Autodrome. Special package for club members.',
      date: '2025-12-05',
      time: '1:00 PM',
      location: 'Dubai Autodrome',
      category: 'racing',
      maxParticipants: 15,
      currentParticipants: 13,
      spotsLeft: 2,
      image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&h=200&fit=crop',
      isSponsored: true,
      organizer: 'Geely Club UAE',
      carBrands: ['Geely'],
      features: ['Professional Track', 'Safety Briefing', 'Club Package', 'Track Time']
    },
    {
      id: '3',
      title: 'Hatta Mountains Photography Run',
      description: 'A scenic drive to Hatta for all car enthusiasts. We will stop at key photo spots. All brands welcome.',
      date: '2025-11-22',
      time: '10:00 AM',
      location: 'Hatta Dam',
      category: 'photography',
      maxParticipants: 30,
      currentParticipants: 22,
      spotsLeft: 8,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop',
      isSponsored: false,
      organizer: 'PhotoCars UAE',
      carBrands: ['All'],
      features: ['Scenic Drive', 'Photo Stops', 'All Brands Welcome', 'Professional Guide']
    },
    {
      id: '4',
      title: 'Desert Adventure Rally',
      description: 'Adventure rally through Dubai desert with navigation challenges and prizes for winners.',
      date: '2025-12-15',
      time: '07:00 AM',
      location: 'Al Qudra Desert',
      category: 'adventure',
      maxParticipants: 40,
      currentParticipants: 28,
      spotsLeft: 12,
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=200&fit=crop',
      isSponsored: true,
      organizer: 'Dubai Adventure Club',
      carBrands: ['All'],
      features: ['Navigation Challenge', 'Desert Drive', 'Prizes', 'Professional Guide']
    }
  ]);

  const categories = ['All Events', 'Meetups', 'Adventures', 'Photography', 'Racing'];
  const timeframes = ['Upcoming', 'This Week', 'Past Events', 'All Time'];

  const filteredEvents = events.filter(event => {
    const categoryMap: { [key: string]: string } = {
      'All Events': 'All',
      'Meetups': 'meetup',
      'Adventures': 'adventure', 
      'Photography': 'photography',
      'Racing': 'racing'
    };
    
    const mappedCategory = categoryMap[selectedCategory] || selectedCategory;
    const matchesCategory = mappedCategory === 'All' || event.category === mappedCategory;
    // Add timeframe filtering logic here
    return matchesCategory;
  });

  const getParticipationRate = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'racing': return 'bg-red-500/10 text-red-500';
      case 'meetup': return 'bg-blue-500/10 text-blue-500';
      case 'adventure': return 'bg-green-500/10 text-green-500';
      case 'photography': return 'bg-purple-500/10 text-purple-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const handleRSVP = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    if (userRSVPs.has(eventId)) {
      // User is already RSVP'd, remove RSVP
      setUserRSVPs(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
      
      // Decrease participant count
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { 
              ...event, 
              currentParticipants: event.currentParticipants - 1,
              spotsLeft: event.spotsLeft + 1
            }
          : event
      ));

      toast.success(`RSVP cancelled for ${event.title}`, {
        description: "You can RSVP again anytime!"
      });
    } else {
      // Check if there are spots available
      if (event.spotsLeft > 0) {
        // Add RSVP
        setUserRSVPs(prev => new Set([...prev, eventId]));
        
        // Increase participant count
        setEvents(prev => prev.map(event => 
          event.id === eventId 
            ? { 
                ...event, 
                currentParticipants: event.currentParticipants + 1,
                spotsLeft: event.spotsLeft - 1
              }
            : event
        ));

        toast.success(`RSVP confirmed for ${event.title}!`, {
          description: `You're now one of ${event.currentParticipants + 1} attendees. See you there!`
        });
      } else {
        toast.error("Event is full", {
          description: "No spots remaining for this event."
        });
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Car Events & Meetups</h1>
          <p className="text-muted-foreground">Discover and join automotive events in the UAE</p>
        </div>
        <Button 
          className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80"
          onClick={() => alert('Create Event feature coming soon!')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-xl font-bold">{events.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Attendees</p>
                <p className="text-xl font-bold">{events.reduce((sum, event) => sum + event.currentParticipants, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-[var(--sublimes-gold)]" />
              <div>
                <p className="text-sm text-muted-foreground">Racing Events</p>
                <p className="text-xl font-bold">{events.filter(e => e.category === 'racing').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Car className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Car Meetups</p>
                <p className="text-xl font-bold">{events.filter(e => e.category === 'meetup').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Search events..."
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value)}
          className="px-3 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
        >
          {timeframes.map(timeframe => (
            <option key={timeframe} value={timeframe}>{timeframe}</option>
          ))}
        </select>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="bg-card border-border overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img 
                src={event.image} 
                alt={event.title}
                className="w-full h-48 object-cover"
              />
              {event.isSponsored && (
                <Badge className="absolute top-3 left-3 bg-[var(--sublimes-gold)] text-black">
                  <Zap className="w-3 h-3 mr-1" />
                  Sponsored
                </Badge>
              )}
              <Badge className={`absolute top-3 right-3 ${getCategoryColor(event.category)}`}>
                {event.category}
              </Badge>
            </div>

            <CardHeader>
              <CardTitle className="text-lg">{event.title}</CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Event Details */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{event.currentParticipants} going • {event.spotsLeft} spots left</span>
                </div>
              </div>

              {/* Participation Progress */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Participation</span>
                  <span>{getParticipationRate(event.currentParticipants, event.maxParticipants)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[var(--sublimes-gold)] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getParticipationRate(event.currentParticipants, event.maxParticipants)}%` }}
                  ></div>
                </div>
              </div>

              {/* Car Brands */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Suitable for:</p>
                <div className="flex flex-wrap gap-1">
                  {event.carBrands.map((brand, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {brand}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">What's included:</p>
                <div className="flex flex-wrap gap-1">
                  {event.features.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {event.features.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{event.features.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* RSVP Actions */}
              <div className="flex flex-col space-y-2 pt-2">
                <Button 
                  className={`w-full ${
                    userRSVPs.has(event.id)
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80'
                  } ${event.spotsLeft === 0 && !userRSVPs.has(event.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => handleRSVP(event.id)}
                  disabled={event.spotsLeft === 0 && !userRSVPs.has(event.id)}
                >
                  {event.spotsLeft === 0 && !userRSVPs.has(event.id) 
                    ? 'Event Full' 
                    : userRSVPs.has(event.id) 
                      ? '✓ RSVP Confirmed' 
                      : 'RSVP to Event'}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => alert(`Viewing details for: ${event.title}`)}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No events found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your filters or check back later for new events</p>
          <Button 
            variant="outline"
            onClick={() => alert('Create Event feature coming soon!')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create the First Event
          </Button>
        </div>
      )}
    </div>
  );
}