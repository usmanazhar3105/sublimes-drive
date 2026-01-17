import { useState } from 'react';
import { 
  Calendar, 
  Users, 
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Trash2,
  Star,
  TrendingUp,
  Activity,
  Route,
  Settings,
  AlertTriangle,
  Copy
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { DateRangeFilter } from './DateRangeFilter';
import { toast } from 'sonner';
interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  organizer: string;
  category: 'meetup' | 'race' | 'show' | 'drive' | 'workshop';
  maxParticipants: number;
  currentParticipants: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  featured: boolean;
  price: number;
  images: string[];
  route?: {
    startPoint: string;
    endPoint: string;
    distance: number;
    estimatedDuration: string;
  };
  createdAt: Date;
  createdBy: string;
}

interface Route {
  id: string;
  name: string;
  description: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  waypoints: string[];
  rating: number;
  reviews: number;
  createdBy: string;
  isPublic: boolean;
  featured: boolean;
  createdAt: Date;
}

export function AdminEventsPageFixed() {
  const [selectedTab, setSelectedTab] = useState('events');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isCreateRouteOpen, setIsCreateRouteOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  // Mock data
  const events: Event[] = [
    {
      id: '1',
      title: 'UAE National Day Car Parade',
      description: 'Join us for a spectacular car parade celebrating UAE National Day. Classic and modern cars welcome!',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      time: '09:00 AM',
      location: 'Dubai Marina',
      organizer: 'UAE Car Club',
      category: 'show',
      maxParticipants: 100,
      currentParticipants: 67,
      status: 'upcoming',
      featured: true,
      price: 0,
      images: ['event1.jpg'],
      route: {
        startPoint: 'Dubai Marina',
        endPoint: 'Burj Khalifa',
        distance: 25,
        estimatedDuration: '2 hours'
      },
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      createdBy: 'admin'
    },
    {
      id: '2',
      title: 'BYD Owners Weekly Meetup',
      description: 'Weekly gathering for BYD owners to share experiences, tips, and upcoming modifications.',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      time: '07:00 PM',
      location: 'City Centre Deira',
      organizer: 'BYD UAE Community',
      category: 'meetup',
      maxParticipants: 50,
      currentParticipants: 23,
      status: 'upcoming',
      featured: false,
      price: 25,
      images: ['event2.jpg'],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      createdBy: 'user123'
    },
    {
      id: '3',
      title: 'Mountain Drive Adventure',
      description: 'Scenic drive through Hatta mountains with professional photographers and refreshments.',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      time: '06:00 AM',
      location: 'Hatta Dam',
      organizer: 'Adventure Drives UAE',
      category: 'drive',
      maxParticipants: 30,
      currentParticipants: 18,
      status: 'upcoming',
      featured: true,
      price: 150,
      images: ['event3.jpg'],
      route: {
        startPoint: 'Dubai Mall',
        endPoint: 'Hatta Dam',
        distance: 134,
        estimatedDuration: '6 hours'
      },
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      createdBy: 'organizer456'
    }
  ];

  const routes: Route[] = [
    {
      id: '1',
      name: 'Dubai to Abu Dhabi Coastal Route',
      description: 'Beautiful coastal drive with stunning sea views and multiple photo stops.',
      startLocation: 'Dubai Marina',
      endLocation: 'Corniche Abu Dhabi',
      distance: 162,
      difficulty: 'easy',
      estimatedTime: '2.5 hours',
      waypoints: ['Jebel Ali', 'Al Ruwais', 'Al Mirfa'],
      rating: 4.8,
      reviews: 234,
      createdBy: 'admin',
      isPublic: true,
      featured: true,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      name: 'Hatta Mountain Circuit',
      description: 'Challenging mountain route with winding roads and spectacular valley views.',
      startLocation: 'Dubai',
      endLocation: 'Hatta',
      distance: 134,
      difficulty: 'hard',
      estimatedTime: '4 hours',
      waypoints: ['Al Awir', 'Lahbab', 'Hatta Heritage Village'],
      rating: 4.6,
      reviews: 189,
      createdBy: 'user789',
      isPublic: true,
      featured: false,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
    }
  ];

  const stats = [
    { title: 'Total Events', value: events.length.toString(), change: '+12%', icon: Calendar, color: 'text-blue-500' },
    { title: 'Active Events', value: events.filter(e => e.status === 'upcoming').length.toString(), change: '+8%', icon: Activity, color: 'text-green-500' },
    { title: 'Total Participants', value: events.reduce((sum, e) => sum + e.currentParticipants, 0).toString(), change: '+25%', icon: Users, color: 'text-[var(--sublimes-gold)]' },
    { title: 'Popular Routes', value: routes.filter(r => r.featured).length.toString(), change: '+3', icon: Route, color: 'text-purple-500' },
  ];

  const tabs = [
    { id: 'events', label: 'Events Management', icon: Calendar },
    { id: 'routes', label: 'Routes Management', icon: Route },
    { id: 'analytics', label: 'Events Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Events Settings', icon: Settings }
  ];

  // Handlers
  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (selectAll: boolean) => {
    const allItems = selectedTab === 'events' ? events.map(e => e.id) : routes.map(r => r.id);
    if (selectAll) {
      setSelectedItems(allItems);
    } else {
      setSelectedItems([]);
    }
  };

  const handleExportData = (selectedIds: string[], dateRange: { from: string; to: string }) => {
    const dataToExport = selectedTab === 'events' 
      ? events.filter(e => selectedIds.includes(e.id))
      : routes.filter(r => selectedIds.includes(r.id));
    
    const headers = selectedTab === 'events' 
      ? ['ID', 'Title', 'Date', 'Location', 'Organizer', 'Category', 'Participants', 'Status', 'Price']
      : ['ID', 'Name', 'Start', 'End', 'Distance', 'Difficulty', 'Rating', 'Created By'];
    
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(item => {
        if (selectedTab === 'events') {
          const event = item as Event;
          return [
            event.id,
            `"${event.title}"`,
            event.date.toLocaleDateString(),
            event.location,
            event.organizer,
            event.category,
            `${event.currentParticipants}/${event.maxParticipants}`,
            event.status,
            event.price
          ].join(',');
        } else {
          const route = item as Route;
          return [
            route.id,
            `"${route.name}"`,
            route.startLocation,
            route.endLocation,
            route.distance,
            route.difficulty,
            route.rating,
            route.createdBy
          ].join(',');
        }
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedTab}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${dataToExport.length} ${selectedTab} successfully`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-500 bg-blue-500/10';
      case 'ongoing': return 'text-green-500 bg-green-500/10';
      case 'completed': return 'text-gray-500 bg-gray-500/10';
      case 'cancelled': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'meetup': return 'text-blue-500 bg-blue-500/10';
      case 'race': return 'text-red-500 bg-red-500/10';
      case 'show': return 'text-purple-500 bg-purple-500/10';
      case 'drive': return 'text-green-500 bg-green-500/10';
      case 'workshop': return 'text-orange-500 bg-orange-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500 bg-green-500/10';
      case 'medium': return 'text-orange-500 bg-orange-500/10';
      case 'hard': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  // Event action handlers
  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    const eventDetails = `EVENT DETAILS:\n\nTitle: ${event.title}\nDate: ${event.date.toLocaleDateString()}\nTime: ${event.time}\nLocation: ${event.location}\nOrganizer: ${event.organizer}\nCategory: ${event.category}\nParticipants: ${event.currentParticipants}/${event.maxParticipants}\nStatus: ${event.status}\nPrice: AED ${event.price}\n\nDescription: ${event.description}`;
    
    if (event.route) {
      const routeInfo = `\n\nROUTE INFO:\nStart: ${event.route.startPoint}\nEnd: ${event.route.endPoint}\nDistance: ${event.route.distance}km\nDuration: ${event.route.estimatedDuration}`;
      alert(eventDetails + routeInfo);
    } else {
      alert(eventDetails);
    }
    
    toast.info(`📅 Viewing event: ${event.title}`);
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    const newTitle = window.prompt(`Edit event title:`, event.title);
    const newDate = window.prompt(`Edit event date (YYYY-MM-DD):`, event.date.toISOString().split('T')[0]);
    
    if (newTitle && newDate) {
      toast.success(`✅ Event "${newTitle}" updated successfully!`);
      console.log(`Event ${event.id} edited by admin at ${new Date().toISOString()}`);
    }
  };

  const handleApproveEvent = (event: Event) => {
    const confirmation = window.confirm(`Approve event "${event.title}" by ${event.organizer}?\n\nThis will make the event visible to all users and allow registrations.`);
    if (confirmation) {
      toast.success(`✅ Event "${event.title}" approved successfully!`);
      console.log(`Event ${event.id} approved by admin at ${new Date().toISOString()}`);
    }
  };

  const handleRejectEvent = (event: Event) => {
    const reason = window.prompt(`Enter rejection reason for "${event.title}":\n\nCommon reasons:\n- Inappropriate content\n- Safety concerns\n- Incomplete information\n- Policy violation\n\nReason:`);
    
    if (reason) {
      toast.error(`❌ Event "${event.title}" rejected. Reason: ${reason}`);
      console.log(`Event ${event.id} rejected by admin. Reason: ${reason}. Time: ${new Date().toISOString()}`);
    }
  };

  const handleDeleteEvent = (event: Event) => {
    const confirmation = window.confirm(`Delete event "${event.title}"?\n\nThis action cannot be undone. All registered participants will be notified.`);
    if (confirmation) {
      toast.success(`🗑️ Event "${event.title}" deleted successfully!`);
      console.log(`Event ${event.id} deleted by admin at ${new Date().toISOString()}`);
    }
  };

  const handleToggleFeatured = (event: Event) => {
    toast.success(`${event.featured ? '⭐ Event removed from featured' : '⭐ Event marked as featured'}`);
    console.log(`Event ${event.id} featured status toggled at ${new Date().toISOString()}`);
  };

  const handleDuplicateEvent = (event: Event) => {
    toast.success(`📋 Event "${event.title}" duplicated successfully!`);
    console.log(`Event ${event.id} duplicated by admin at ${new Date().toISOString()}`);
  };

  const handleCancelEvent = (event: Event) => {
    const reason = window.prompt(`Enter cancellation reason for "${event.title}":`);
    if (reason) {
      toast.warning(`⏸️ Event "${event.title}" cancelled. Reason: ${reason}`);
      console.log(`Event ${event.id} cancelled. Reason: ${reason}. Time: ${new Date().toISOString()}`);
    }
  };

  // Route action handlers
  const handleViewRoute = (route: Route) => {
    setSelectedRoute(route);
    const routeDetails = `ROUTE DETAILS:\n\nName: ${route.name}\nFrom: ${route.startLocation}\nTo: ${route.endLocation}\nDistance: ${route.distance}km\nDifficulty: ${route.difficulty}\nEstimated Time: ${route.estimatedTime}\nRating: ${route.rating}/5 (${route.reviews} reviews)\nCreated by: ${route.createdBy}\nPublic: ${route.isPublic ? 'Yes' : 'No'}\n\nDescription: ${route.description}\n\nWaypoints: ${route.waypoints.join(', ')}`;
    
    alert(routeDetails);
    toast.info(`🗺️ Viewing route: ${route.name}`);
  };

  const handleEditRoute = (route: Route) => {
    setSelectedRoute(route);
    const newName = window.prompt(`Edit route name:`, route.name);
    const newDescription = window.prompt(`Edit route description:`, route.description);
    
    if (newName && newDescription) {
      toast.success(`✅ Route "${newName}" updated successfully!`);
      console.log(`Route ${route.id} edited by admin at ${new Date().toISOString()}`);
    }
  };

  const handleDeleteRoute = (route: Route) => {
    const confirmation = window.confirm(`Delete route "${route.name}"?\n\nThis action cannot be undone.`);
    if (confirmation) {
      toast.success(`🗑️ Route "${route.name}" deleted successfully!`);
      console.log(`Route ${route.id} deleted by admin at ${new Date().toISOString()}`);
    }
  };

  const handleToggleRouteVisibility = (route: Route) => {
    toast.success(`${route.isPublic ? '🔒 Route made private' : '🌐 Route made public'}`);
    console.log(`Route ${route.id} visibility toggled at ${new Date().toISOString()}`);
  };

  const handleFeaturedRoute = (route: Route) => {
    toast.success(`${route.featured ? '⭐ Route removed from featured' : '⭐ Route marked as featured'}`);
    console.log(`Route ${route.id} featured status toggled at ${new Date().toISOString()}`);
  };

  const renderEventsContent = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
        >
          <option value="All">All Categories</option>
          <option value="meetup">Meetup</option>
          <option value="race">Race</option>
          <option value="show">Show</option>
          <option value="drive">Drive</option>
          <option value="workshop">Workshop</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
        >
          <option value="All">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <Button onClick={() => setIsCreateEventOpen(true)} className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]">
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {events.map((event) => (
          <Card key={event.id} className={`${event.featured ? 'ring-2 ring-[var(--sublimes-gold)]' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedItems.includes(event.id)}
                    onCheckedChange={() => handleSelectItem(event.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-bold text-[var(--sublimes-light-text)]">{event.title}</h3>
                      <Badge className={getCategoryColor(event.category)}>
                        {event.category}
                      </Badge>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                      {event.featured && (
                        <Badge className="bg-[var(--sublimes-gold)] text-black">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                      <span>{event.date.toLocaleDateString()} • {event.time}</span>
                      <span>•</span>
                      <span>{event.location}</span>
                      <span>•</span>
                      <span>by {event.organizer}</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{event.description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-[var(--sublimes-light-text)]">
                        {event.currentParticipants}/{event.maxParticipants} participants
                      </span>
                      <span className="text-[var(--sublimes-gold)] font-medium">
                        {event.price > 0 ? `AED ${event.price}` : 'Free'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="relative group">
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                  <div className="absolute right-0 top-8 w-48 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg shadow-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      <button
                        onClick={() => handleViewEvent(event)}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-blue-500 hover:bg-blue-500/10 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-orange-500 hover:bg-orange-500/10 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit Event</span>
                      </button>
                      <button
                        onClick={() => handleApproveEvent(event)}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-green-500 hover:bg-green-500/10 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleRejectEvent(event)}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => handleDuplicateEvent(event)}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-purple-500 hover:bg-purple-500/10 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Duplicate</span>
                      </button>
                      <button
                        onClick={() => handleToggleFeatured(event)}
                        className={`w-full flex items-center space-x-2 px-4 py-2 transition-colors ${
                          event.featured 
                            ? 'text-yellow-500 hover:bg-yellow-500/10' 
                            : 'text-gray-500 hover:bg-gray-500/10'
                        }`}
                      >
                        <Star className="w-4 h-4" />
                        <span>{event.featured ? 'Remove Featured' : 'Mark Featured'}</span>
                      </button>
                      <button
                        onClick={() => handleCancelEvent(event)}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-orange-500 hover:bg-orange-500/10 transition-colors"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span>Cancel Event</span>
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event)}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {event.route && (
                <div className="bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg p-4 mt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Route className="w-4 h-4 text-[var(--sublimes-gold)]" />
                    <span className="font-medium text-[var(--sublimes-light-text)]">Route Information</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">From: </span>
                      <span className="text-[var(--sublimes-light-text)]">{event.route.startPoint}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">To: </span>
                      <span className="text-[var(--sublimes-light-text)]">{event.route.endPoint}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Distance: </span>
                      <span className="text-[var(--sublimes-light-text)]">{event.route.distance}km</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Duration: </span>
                      <span className="text-[var(--sublimes-light-text)]">{event.route.estimatedDuration}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderRoutesContent = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search routes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
          />
        </div>

        <Button onClick={() => setIsCreateRouteOpen(true)} className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]">
          <Plus className="w-4 h-4 mr-2" />
          Create Route
        </Button>
      </div>

      {/* Routes List */}
      <div className="space-y-4">
        {routes.map((route) => (
          <Card key={route.id} className={`${route.featured ? 'ring-2 ring-[var(--sublimes-gold)]' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedItems.includes(route.id)}
                    onCheckedChange={() => handleSelectItem(route.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-bold text-[var(--sublimes-light-text)]">{route.name}</h3>
                      <Badge className={getDifficultyColor(route.difficulty)}>
                        {route.difficulty}
                      </Badge>
                      {route.featured && (
                        <Badge className="bg-[var(--sublimes-gold)] text-black">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      <Badge variant={route.isPublic ? "default" : "secondary"}>
                        {route.isPublic ? 'Public' : 'Private'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-2">
                      <div>
                        <span className="text-gray-400">From: </span>
                        <span className="text-[var(--sublimes-light-text)]">{route.startLocation}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">To: </span>
                        <span className="text-[var(--sublimes-light-text)]">{route.endLocation}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Distance: </span>
                        <span className="text-[var(--sublimes-light-text)]">{route.distance}km</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Time: </span>
                        <span className="text-[var(--sublimes-light-text)]">{route.estimatedTime}</span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{route.description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-[var(--sublimes-light-text)]">{route.rating}</span>
                        <span className="text-gray-400">({route.reviews} reviews)</span>
                      </div>
                      <span className="text-gray-400">Created by {route.createdBy}</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative group">
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                  <div className="absolute right-0 top-8 w-48 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg shadow-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      <button
                        onClick={() => handleViewRoute(route)}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-blue-500 hover:bg-blue-500/10 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                      <button
                        onClick={() => handleEditRoute(route)}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-orange-500 hover:bg-orange-500/10 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit Route</span>
                      </button>
                      <button
                        onClick={() => handleToggleRouteVisibility(route)}
                        className={`w-full flex items-center space-x-2 px-4 py-2 transition-colors ${
                          route.isPublic 
                            ? 'text-orange-500 hover:bg-orange-500/10' 
                            : 'text-green-500 hover:bg-green-500/10'
                        }`}
                      >
                        {route.isPublic ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        <span>{route.isPublic ? 'Make Private' : 'Make Public'}</span>
                      </button>
                      <button
                        onClick={() => handleFeaturedRoute(route)}
                        className={`w-full flex items-center space-x-2 px-4 py-2 transition-colors ${
                          route.featured 
                            ? 'text-yellow-500 hover:bg-yellow-500/10' 
                            : 'text-gray-500 hover:bg-gray-500/10'
                        }`}
                      >
                        <Star className="w-4 h-4" />
                        <span>{route.featured ? 'Remove Featured' : 'Mark Featured'}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteRoute(route)}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAnalyticsContent = () => (
    <div className="space-y-6">
      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
              <Badge variant="secondary">Live</Badge>
            </div>
            <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">{events.length}</p>
            <p className="text-sm text-gray-400">Total Events</p>
            <div className="flex items-center space-x-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500">+12%</span>
              <span className="text-sm text-gray-400">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-500" />
              </div>
              <Badge variant="secondary">Live</Badge>
            </div>
            <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">
              {events.reduce((sum, e) => sum + e.currentParticipants, 0)}
            </p>
            <p className="text-sm text-gray-400">Total Participants</p>
            <div className="flex items-center space-x-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500">+25%</span>
              <span className="text-sm text-gray-400">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[var(--sublimes-gold)]/10 rounded-lg flex items-center justify-center">
                <Route className="w-6 h-6 text-[var(--sublimes-gold)]" />
              </div>
              <Badge variant="secondary">Live</Badge>
            </div>
            <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">{routes.length}</p>
            <p className="text-sm text-gray-400">Active Routes</p>
            <div className="flex items-center space-x-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500">+8%</span>
              <span className="text-sm text-gray-400">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-purple-500" />
              </div>
              <Badge variant="secondary">Live</Badge>
            </div>
            <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">
              {routes.reduce((sum, r) => sum + r.rating, 0) / routes.length || 0}
            </p>
            <p className="text-sm text-gray-400">Avg Route Rating</p>
            <div className="flex items-center space-x-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500">+0.3</span>
              <span className="text-sm text-gray-400">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Categories Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[var(--sublimes-light-text)]">Event Categories Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['meetup', 'race', 'show', 'drive', 'workshop'].map((category, index) => {
              const categoryEvents = events.filter(e => e.category === category);
              const percentage = (categoryEvents.length / events.length) * 100;
              const colors = ['bg-blue-500', 'bg-red-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500'];
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-[var(--sublimes-light-text)] capitalize">
                      {category}
                    </span>
                    <span className="text-sm text-gray-400">
                      {categoryEvents.length} events ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${colors[index]}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettingsContent = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-[var(--sublimes-light-text)]">Events Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium text-[var(--sublimes-light-text)] mb-4">Event Creation Rules</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--sublimes-light-text)]">Auto-approve community events</p>
                  <p className="text-sm text-gray-400">Automatically approve events from verified organizers</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--sublimes-light-text)]">Maximum participants per event</p>
                  <p className="text-sm text-gray-400">Default limit for new events</p>
                </div>
                <input
                  type="number"
                  defaultValue={200}
                  className="w-20 px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--sublimes-light-text)]">Advance booking period (days)</p>
                  <p className="text-sm text-gray-400">How far in advance events can be created</p>
                </div>
                <input
                  type="number"
                  defaultValue={90}
                  className="w-20 px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-[var(--sublimes-light-text)] mb-4">Route Management</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--sublimes-light-text)]">Allow user-created routes</p>
                  <p className="text-sm text-gray-400">Let users create and share their own routes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--sublimes-light-text)]">Require route approval</p>
                  <p className="text-sm text-gray-400">Admin approval required for new routes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 bg-[var(--sublimes-dark-bg)]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)]">Events & Routes Management</h1>
            <p className="text-gray-400 mt-1">Manage community events, meetups, and route planning</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={() => setIsCreateEventOpen(true)} className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
            <Button onClick={() => setIsCreateRouteOpen(true)} variant="outline">
              <Route className="w-4 h-4 mr-2" />
              Create Route
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs font-bold rounded">Live</div>
              </div>
              <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.title}</p>
              <div className="flex items-center space-x-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500">{stat.change}</span>
                <span className="text-sm text-gray-400">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Date Range Filter */}
      <DateRangeFilter
        selectedItems={selectedItems}
        onSelectItem={handleSelectItem}
        onSelectAll={handleSelectAll}
        allItems={selectedTab === 'events' ? events : routes}
        onExportData={handleExportData}
        isSelectAllChecked={(() => {
          const totalCount = selectedTab === 'events' ? events.length : routes.length;
          return selectedItems.length === totalCount && totalCount > 0;
        })()}
        title={selectedTab === 'events' ? 'Events' : 'Routes'}
      />

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="events">
          {renderEventsContent()}
        </TabsContent>

        <TabsContent value="routes">
          {renderRoutesContent()}
        </TabsContent>

        <TabsContent value="analytics">
          {renderAnalyticsContent()}
        </TabsContent>

        <TabsContent value="settings">
          {renderSettingsContent()}
        </TabsContent>
      </Tabs>

      {/* Create Event Modal */}
      <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-gold)]">Create New Event</DialogTitle>
            <DialogDescription>
              Create a new community event for car enthusiasts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                Event Title *
              </label>
              <Input placeholder="Enter event title" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                Description *
              </label>
              <Textarea placeholder="Describe your event" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                  Date *
                </label>
                <Input type="date" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                  Time *
                </label>
                <Input type="time" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                  Category *
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meetup">Meetup</SelectItem>
                    <SelectItem value="race">Race</SelectItem>
                    <SelectItem value="show">Car Show</SelectItem>
                    <SelectItem value="drive">Group Drive</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                  Max Participants
                </label>
                <Input type="number" placeholder="50" />
              </div>
            </div>
            <div className="flex items-center space-x-4 pt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsCreateEventOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/90"
                onClick={() => {
                  toast.success('Event created successfully!');
                  setIsCreateEventOpen(false);
                }}
              >
                Create Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Route Modal */}
      <Dialog open={isCreateRouteOpen} onOpenChange={setIsCreateRouteOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-gold)]">Create New Route</DialogTitle>
            <DialogDescription>
              Create a new driving route for the community.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                Route Name *
              </label>
              <Input placeholder="Enter route name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                Description *
              </label>
              <Textarea placeholder="Describe your route" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                  Start Location *
                </label>
                <Input placeholder="Dubai Marina" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                  End Location *
                </label>
                <Input placeholder="Abu Dhabi Corniche" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                  Distance (km)
                </label>
                <Input type="number" placeholder="150" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                  Difficulty
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                  Est. Time
                </label>
                <Input placeholder="2.5 hours" />
              </div>
            </div>
            <div className="flex items-center space-x-4 pt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsCreateRouteOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/90"
                onClick={() => {
                  toast.success('Route created successfully!');
                  setIsCreateRouteOpen(false);
                }}
              >
                Create Route
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}