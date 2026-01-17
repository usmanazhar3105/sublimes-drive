import { useState, useEffect } from 'react';
import { MapPin, Users, Clock, Search, Filter, Plus, Eye, EyeOff, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { PostCard } from './PostCard';
import { CreateMeetupModal } from './CreateMeetupModal';
import { toast } from 'sonner';
import { useEvents } from '../hooks/useEvents';

// Fallback sample data (only used if database is empty)
const sampleMeetups = [
  {
    postId: 'meetup_001',
    user: {
      name: '3rddesire',
      username: '3rddesire',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      role: 'car-owner' as const,
      verified: true,
      isUrgent: false
    },
    content: {
      text: 'Hi there, I am present in xyz area any one there 📍\n\nLocation: xyz area\nCoordinates: 25.1200, 55.3966\n\n#meetup #dubai #carowners',
      timestamp: '12d ago'
    },
    engagement: {
      likes: 1,
      comments: 0,
      shares: 2,
      views: 45
    },
    participants: {
      current: 1,
      max: 10
    },
    isLiked: false,
    isSaved: false,
    expired: true
  },
  {
    postId: 'meetup_002',
    user: {
      name: 'CarFreak UAE',
      username: 'carfreak_uae',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      role: 'admin' as const,
      verified: true,
      isUrgent: false
    },
    content: {
      title: 'BMW Weekend Drive to Hatta! 🏔️',
      text: 'Looking for fellow BMW enthusiasts for a weekend drive to Hatta! Anyone interested? 🚗💨\n\n📅 This Saturday, 7:00 AM\n📍 Meeting Point: Dubai Marina\n🎯 Destination: Hatta Dam & Mountains\n⛽ Fuel up beforehand!\n\nBring your cameras for some epic shots! Who\'s in? Comment below 👇\n\n#BMW #Hatta #WeekendDrive #DubaiMarina #CarMeet',
      images: ['https://images.unsplash.com/photo-1551522435-a13afa10f487?w=600&h=400&fit=crop'],
      timestamp: '2h ago'
    },
    engagement: {
      likes: 45,
      comments: 18,
      shares: 8,
      views: 289
    },
    participants: {
      current: 15,
      max: 25
    },
    isLiked: true,
    isSaved: false,
    featured: true
  },
  {
    postId: 'meetup_003',
    user: {
      name: 'Speed Demon',
      username: 'speeddemon',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
      role: 'car-owner' as const,
      verified: true,
      isUrgent: true
    },
    content: {
      title: 'Track Day - URGENT: 2 Spots Left! ⚠️',
      text: '🏁 Track day at Dubai Autodrome tomorrow! Still have 2 spots available. Message me ASAP!\n\n🗓️ Tomorrow (Saturday)\n⏰ 6:00 AM - 6:00 PM\n📍 Dubai Autodrome\n💰 AED 450 per person\n\nIncludes:\n✅ Full day track access\n✅ Safety briefing\n✅ Professional instructor\n✅ Lunch & refreshments\n\nRequirements:\n• Valid UAE driving license\n• Helmet (rental available)\n• Car in good condition\n\nDM me now! First come, first served! 🏃‍♂️💨\n\n#TrackDay #DubaiAutodrome #Racing #URGENT',
      timestamp: '4h ago'
    },
    engagement: {
      likes: 78,
      comments: 23,
      shares: 15,
      views: 567
    },
    participants: {
      current: 2,
      max: 2
    },
    isLiked: false,
    isSaved: true,
    expired: false
  },
  {
    postId: 'meetup_004',
    user: {
      name: 'Elena Rodriguez',
      username: 'elena_carphoto',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face',
      role: 'editor' as const,
      verified: true,
      isUrgent: false
    },
    content: {
      title: 'Golden Hour Car Photography Meetup 📸',
      text: 'Calling all car photography enthusiasts! Join me for a golden hour shoot session ✨\n\n📅 This Sunday\n⏰ 5:30 PM (1 hour before sunset)\n📍 JBR Beach parking\n📷 Bring your cameras/phones\n\nPerfect for:\n• Portfolio shots\n• Instagram content\n• Learning new techniques\n• Meeting fellow photographers\n\nI\'ll share some pro tips and we can help each other get amazing shots! All skill levels welcome 🙌\n\nWho\'s joining? React with 📸 if you\'re in!\n\n#CarPhotography #GoldenHour #JBR #Photography #Meetup #Dubai',
      images: [
        'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&h=400&fit=crop'
      ],
      timestamp: '6h ago'
    },
    engagement: {
      likes: 134,
      comments: 42,
      shares: 28,
      views: 891
    },
    participants: {
      current: 8,
      max: 15
    },
    isLiked: true,
    isSaved: true,
    expired: false
  }
];

export function InstantMeetupPage() {
  const [hideMap, setHideMap] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [isCreateMeetupOpen, setIsCreateMeetupOpen] = useState(false);
  const [userJoinedMeetups, setUserJoinedMeetups] = useState<Set<string>>(new Set());
  
  // 🔥 REAL DATA FROM DATABASE (not mock)
  const { events, loading, error, createEvent, joinEvent, refetch } = useEvents({ 
    type: 'meetup',
    upcoming: activeTab === 'active'
  });
  
  // Use real events from database, fallback to sample if empty
  const [meetups, setMeetups] = useState(sampleMeetups);
  
  useEffect(() => {
    if (events && events.length > 0) {
      setMeetups(events as any); // Transform format if needed
    }
  }, [events]);

  const handlePostInteraction = (type: 'like' | 'comment' | 'share' | 'save' | 'report', postId: string) => {
    console.log(`${type} action on meetup ${postId}`);
    
    if (type === 'like') {
      setMeetups(prev => prev.map(meetup => 
        meetup.postId === postId 
          ? { 
              ...meetup, 
              isLiked: !meetup.isLiked,
              engagement: {
                ...meetup.engagement,
                likes: meetup.isLiked ? meetup.engagement.likes - 1 : meetup.engagement.likes + 1
              }
            }
          : meetup
      ));
    }
  };

  const handleJoinMeetup = (meetupId: string) => {
    const meetup = meetups.find(m => m.postId === meetupId);
    if (!meetup) return;

    if (userJoinedMeetups.has(meetupId)) {
      // User is already joined, leave meetup
      setUserJoinedMeetups(prev => {
        const newSet = new Set(prev);
        newSet.delete(meetupId);
        return newSet;
      });
      
      // Decrease participant count
      setMeetups(prev => prev.map(meetup => 
        meetup.postId === meetupId 
          ? { 
              ...meetup, 
              participants: {
                ...meetup.participants,
                current: meetup.participants.current - 1
              }
            }
          : meetup
      ));

      toast.success("Left the meetup", {
        description: "You can join again anytime!"
      });
    } else {
      // Check if there are spots available
      if (meetup.participants.current < meetup.participants.max) {
        // Join meetup
        setUserJoinedMeetups(prev => new Set([...prev, meetupId]));
        
        // Increase participant count
        setMeetups(prev => prev.map(meetup => 
          meetup.postId === meetupId 
            ? { 
                ...meetup, 
                participants: {
                  ...meetup.participants,
                  current: meetup.participants.current + 1
                }
              }
            : meetup
        ));

        toast.success("Joined the meetup!", {
          description: `You're now one of ${meetup.participants.current + 1} participants. See you there!`
        });
      } else {
        toast.error("Meetup is full", {
          description: "No spots remaining for this meetup."
        });
      }
    }
  };

  const handleCreateMeetup = (meetupData: any) => {
    console.log('Creating meetup:', meetupData);
    // Add the new meetup to the list
    const newMeetup = {
      postId: `meetup_${Date.now()}`,
      user: {
        name: 'Current User',
        username: 'current_user',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
        role: 'car-owner' as const,
        verified: true,
        isUrgent: false
      },
      content: {
        title: meetupData.title,
        text: meetupData.description,
        timestamp: 'Just now'
      },
      engagement: {
        likes: 0,
        comments: 0,
        shares: 0,
        views: 1
      },
      participants: {
        current: 1,
        max: 10
      },
      isLiked: false,
      isSaved: false,
      expired: false
    };
    
    setMeetups(prev => [newMeetup, ...prev]);
  };

  const filteredMeetups = meetups.filter(meetup => {
    if (activeTab === 'active') return !meetup.expired;
    if (activeTab === 'promoted') return meetup.featured;
    return true; // 'all'
  });

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Instant Meetup
              </h1>
              <p className="text-sm text-muted-foreground">
                Connect with nearby car enthusiasts
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHideMap(!hideMap)}
                className="flex items-center gap-2"
              >
                {hideMap ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {hideMap ? 'Show Map' : 'Hide Map'}
              </Button>
              <Button 
                size="sm" 
                className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80"
                onClick={() => setIsCreateMeetupOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Meetup
              </Button>
            </div>
          </div>

          {/* Mobile Create Button */}
          <div className="md:hidden mb-3">
            <Button 
              size="sm" 
              className="w-full bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80"
              onClick={() => setIsCreateMeetupOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Meetup
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search meetups..."
                className="pl-10 bg-background border-border"
              />
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                <TabsTrigger value="active" className="text-xs sm:text-sm">Active</TabsTrigger>
                <TabsTrigger value="promoted" className="text-xs sm:text-sm">Promoted</TabsTrigger>
                <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Meetups List */}
        <div className={`${hideMap ? 'w-full' : 'w-full lg:w-1/2'} flex flex-col`}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredMeetups.map((meetup) => (
              <div key={meetup.postId} className={`${meetup.expired ? 'opacity-60' : ''}`}>
                <PostCard 
                  {...meetup} 
                  onInteraction={handlePostInteraction}
                />
                {/* Additional meetup-specific info */}
                <div className="mt-2 mb-4 px-4">
                  {/* Participant count display */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{meetup.participants.current} going • {meetup.participants.max - meetup.participants.current} spots left</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    {meetup.featured && (
                      <Badge className="text-xs bg-[var(--sublimes-gold)] text-black">
                        🌟 Featured Meetup
                      </Badge>
                    )}
                    {meetup.expired && (
                      <Badge variant="destructive" className="text-xs">
                        ⏰ Expired
                      </Badge>
                    )}
                    <div className="flex-1"></div>
                    {!meetup.expired && (
                      <Button 
                        size="sm" 
                        className={`${
                          userJoinedMeetups.has(meetup.postId)
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80'
                        } ${meetup.participants.current >= meetup.participants.max && !userJoinedMeetups.has(meetup.postId) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => handleJoinMeetup(meetup.postId)}
                        disabled={meetup.participants.current >= meetup.participants.max && !userJoinedMeetups.has(meetup.postId)}
                      >
                        <Users className="h-3 w-3 mr-1" />
                        {meetup.participants.current >= meetup.participants.max && !userJoinedMeetups.has(meetup.postId)
                          ? 'Meetup Full'
                          : userJoinedMeetups.has(meetup.postId)
                            ? 'Joined'
                            : 'Join Meetup'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredMeetups.length === 0 && (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No meetups found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or create a new meetup</p>
              </div>
            )}
          </div>
        </div>

        {/* Map Section */}
        {!hideMap && (
          <div className="hidden lg:block lg:w-1/2 border-l border-border relative">
            <div className="absolute inset-4 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-16 w-16 text-[var(--sublimes-gold)] mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Interactive Map</h3>
                <p className="text-muted-foreground mb-4">See nearby car owners and meetup locations</p>
                
                {/* Nearby Car Owners */}
                <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-4 max-w-sm mx-auto">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-[var(--sublimes-gold)]" />
                      <span className="font-semibold">Nearby Car Owners</span>
                    </div>
                    <Badge variant="secondary">
                      0 verified owners nearby
                    </Badge>
                  </div>
                  <div className="text-center py-4">
                    <p className="text-muted-foreground text-sm">Enable location to see nearby enthusiasts</p>
                    <Button size="sm" className="mt-2 bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80">
                      Enable Location
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Meetup Modal */}
      <CreateMeetupModal
        isOpen={isCreateMeetupOpen}
        onClose={() => setIsCreateMeetupOpen(false)}
        onCreate={handleCreateMeetup}
      />
    </div>
  );
}