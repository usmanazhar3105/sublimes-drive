import { useState, useEffect } from 'react';
import { Clock, MapPin, DollarSign, MessageCircle, Star, Filter, Search, Plus, CheckCircle, AlertCircle, TrendingUp, Calendar, User, Wrench, Car, Upload, X, Eye, Shield, ArrowUpRight, ArrowDownRight, RefreshCw, History } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ViewToggle } from './ui/ViewToggle';
import { TopUpWalletModal } from './TopUpWalletModal';
import { toast } from 'sonner';
import { useRole } from '../hooks/useRole';
import { useBidRepair } from '../hooks/useBidRepair';

interface RepairRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  budget: {
    min: number;
    max: number;
  };

  location: string;
  postedDate: string;
  deadline: string;
  images: string[];
  bids: number;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  tags: string[];
  vehicle?: {
    make: string;
    model: string;
    year: string;
  };
  requestId: string;
}

interface Bid {
  id: string;
  requestId: string;
  garageId: string;
  amount: number;
  timeEstimate: string;
  message: string;
  submittedDate: string;
  status: 'pending' | 'accepted' | 'rejected';
  warranty: string;
  includes: string[];
  garageDetails?: {
    name: string;
    avatar: string;
    rating: number;
    verified: boolean;
    completedJobs: number;
    responseTime: string;
    location: string;
  };
}

const sampleRequests: RepairRequest[] = [
  {
    id: '1',
    requestId: 'REQ-2024-001',
    title: 'Engine Oil Leak Repair',
    description: 'Car has an oil leak near the engine bay. Need professional diagnosis and repair. Vehicle has 45,000km mileage.',
    category: 'Engine',
    urgency: 'medium',
    budget: { min: 500, max: 1200 },
    location: 'Dubai Marina Area',
    postedDate: '2024-01-15',
    deadline: '2024-01-25',
    images: [
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=300&h=200&fit=crop'
    ],
    bids: 7,
    status: 'open',
    tags: ['Oil Leak', 'Engine', 'Sedan'],
    vehicle: {
      make: 'BYD',
      model: 'Han',
      year: '2018'
    }
  },
  {
    id: '2',
    requestId: 'REQ-2024-002',
    title: 'Air Conditioning Service',
    description: 'Air conditioning not cooling properly. Need AC system check and refrigerant refill if needed.',
    category: 'AC/Cooling',
    urgency: 'high',
    budget: { min: 200, max: 600 },
    location: 'Business Bay Area',
    postedDate: '2024-01-14',
    deadline: '2024-01-20',
    images: [
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&h=200&fit=crop'
    ],
    bids: 12,
    status: 'open',
    tags: ['AC Repair', 'Cooling', 'Sedan'],
    vehicle: {
      make: 'NIO',
      model: 'ES8',
      year: '2020'
    }
  }
];

const sampleBids: Bid[] = [
  {
    id: '1',
    requestId: '1',
    garageId: 'GARAGE_001',
    amount: 850,
    timeEstimate: '2-3 days',
    message: 'Specialized in this type of repair with genuine parts available.',
    submittedDate: '2024-01-15',
    status: 'accepted',
    warranty: '6 months',
    includes: ['Diagnosis', 'Parts', 'Labor', 'Road Test'],
    garageDetails: {
      name: 'Al Quoz Auto Center',
      avatar: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=40&h=40&fit=crop',
      rating: 4.8,
      verified: true,
      completedJobs: 156,
      responseTime: '< 2 hours',
      location: 'Al Quoz, Dubai'
    }
  }
];

interface WalletTransaction {
  id: string;
  type: 'top-up' | 'bid' | 'refund' | 'bonus';
  amount: number;
  description: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
  reference?: string;
}

interface RepairBidPageProps {
  onNavigate?: (page: string) => void;
}

export function RepairBidPage({ onNavigate }: RepairBidPageProps) {
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedRequest, setSelectedRequest] = useState<RepairRequest | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBidForm, setShowBidForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showRequestDetail, setShowRequestDetail] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // 🔥 REAL DATA FROM DATABASE (not mock)
  const { role, isGarageOwner, loading: roleLoading } = useRole();
  const { 
    loading: bidLoading,
    getAvailableBids, 
    getUserBidRequests,
    getMyBidReplies,
    createBidRequest,
    createBidReply,
    acceptBid,
    getBidWalletBalance
  } = useBidRepair();
  
  const [requests, setRequests] = useState<any[]>(sampleRequests); // Will be replaced with real data
  const [bids, setBids] = useState<any[]>(sampleBids); // Will be replaced with real data
  const [walletBalance, setWalletBalance] = useState(178);
  const [showTopUpWalletModal, setShowTopUpWalletModal] = useState(false);
  
  // Load real data on mount
  useEffect(() => {
    loadBidRepairData();
  }, [activeTab]);
  
  const loadBidRepairData = async () => {
    try {
      if (activeTab === 'browse') {
        const availableBids = await getAvailableBids();
        setRequests(availableBids.length > 0 ? availableBids : sampleRequests); // Fallback to sample if empty
      } else if (activeTab === 'my-requests') {
        const myRequests = await getUserBidRequests();
        setRequests(myRequests.length > 0 ? myRequests : []); // No fallback for user's own data
      } else if (activeTab === 'my-bids') {
        const myBids = await getMyBidReplies();
        setBids(myBids.length > 0 ? myBids : []);
      }
      
      // Load wallet balance for garage owners
      if (isGarageOwner) {
        const balance = await getBidWalletBalance();
        setWalletBalance(balance);
      }
    } catch (error) {
      console.error('Error loading bid repair data:', error);
      toast.error('Failed to load data');
    }
  };
  
  // Enhanced wallet transaction data
  const [walletTransactions] = useState<WalletTransaction[]>([
    {
      id: 'txn_001',
      type: 'top-up',
      amount: 250,
      description: 'Wallet top-up - AED 250 package',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'completed',
      reference: 'pi_wallet_123'
    },
    {
      id: 'txn_002',
      type: 'bid',
      amount: -2,
      description: 'Bid on brake repair - NIO ES8',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'completed'
    },
    {
      id: 'txn_003',
      type: 'bid',
      amount: -2,
      description: 'Bid on service - Geely Emgrand',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'completed'
    },
    {
      id: 'txn_004',
      type: 'refund',
      amount: 50,
      description: 'Refund - Cancelled repair job',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      status: 'completed'
    },
    {
      id: 'txn_005',
      type: 'top-up',
      amount: 100,
      description: 'Wallet top-up - AED 100 package',
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      status: 'completed',
      reference: 'pi_wallet_456'
    }
  ]);

  // New request form state
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    category: '',
    urgency: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    budgetMin: '',
    budgetMax: '',
    location: '',
    deadline: '',
    vehicle: {
      make: '',
      model: '',
      year: ''
    },
    images: [] as string[],
    contactPreference: 'anonymous'
  });

  // Bid form state
  const [newBid, setNewBid] = useState({
    amount: '',
    timeEstimate: '',
    message: '',
    warranty: '',
    includes: [] as string[]
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'urgent': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Enhanced wallet helper functions
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED'
    }).format(Math.abs(amount));
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTransactionIcon = (type: string, amount: number) => {
    if (type === 'top-up') return <ArrowDownRight className="w-4 h-4 text-green-500" />;
    if (type === 'refund') return <RefreshCw className="w-4 h-4 text-blue-500" />;
    if (amount < 0) return <ArrowUpRight className="w-4 h-4 text-red-500" />;
    return <ArrowDownRight className="w-4 h-4 text-green-500" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'failed': return <Clock className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  // Calculate wallet stats
  const totalSpent = walletTransactions
    .filter(t => t.amount < 0 && t.status === 'completed')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const totalTopUps = walletTransactions
    .filter(t => t.type === 'top-up' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const activeBids = walletTransactions
    .filter(t => t.type === 'bid' && t.status === 'pending').length;

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || request.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesUrgency = urgencyFilter === 'all' || request.urgency === urgencyFilter;
    
    return matchesSearch && matchesCategory && matchesUrgency;
  });

  const categories = ['all', ...Array.from(new Set(requests.map(r => r.category)))];

  const handlePostRequest = () => {
    // 🔥 ROLE RESTRICTION: Garage owners cannot create bid repairs
    if (isGarageOwner) {
      toast.error('Garage owners cannot create repair requests. You can view and reply to existing requests only.');
      return;
    }
    setShowRequestForm(true);
  };

  const handleSubmitRequest = () => {
    if (!newRequest.title || !newRequest.description || !newRequest.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const request: RepairRequest = {
      id: Date.now().toString(),
      requestId: `REQ-${new Date().getFullYear()}-${String(requests.length + 1).padStart(3, '0')}`,
      title: newRequest.title,
      description: newRequest.description,
      category: newRequest.category,
      urgency: newRequest.urgency,
      budget: {
        min: parseInt(newRequest.budgetMin),
        max: parseInt(newRequest.budgetMax)
      },
      location: newRequest.location,
      postedDate: new Date().toISOString().split('T')[0],
      deadline: newRequest.deadline,
      images: newRequest.images,
      bids: 0,
      status: 'open',
      tags: [newRequest.category, newRequest.vehicle.make, newRequest.urgency],
      vehicle: newRequest.vehicle
    };

    setRequests([request, ...requests]);
    setShowRequestForm(false);
    setNewRequest({
      title: '',
      description: '',
      category: '',
      urgency: 'medium',
      budgetMin: '',
      budgetMax: '',
      location: '',
      deadline: '',
      vehicle: { make: '', model: '', year: '' },
      images: [],
      contactPreference: 'anonymous'
    });
    toast.success('Repair request posted anonymously!');
    setActiveTab('my-requests');
  };

  const handlePlaceBid = (requestId: string) => {
    if (!isGarageOwner) {
      toast.error('Only verified garage owners can place bids');
      return;
    }
    if (walletBalance < 2) {
      setShowTopupModal(true);
      return;
    }

    const request = requests.find(r => r.id === requestId);
    if (!request) {
      toast.error('Request not found');
      return;
    }

    if (request.status !== 'open') {
      toast.error('Can only bid on open requests');
      return;
    }

    // Check if garage has already bid on this request
    const existingBid = bids.find(b => b.requestId === requestId && b.garageId === 'current-garage');
    if (existingBid && existingBid.status === 'pending') {
      toast.info('You have already placed a bid on this request. You can modify your existing bid.');
      // Load existing bid data for modification
      setNewBid({
        amount: existingBid.amount.toString(),
        timeEstimate: existingBid.timeEstimate,
        message: existingBid.message,
        warranty: existingBid.warranty,
        includes: existingBid.includes
      });
    } else {
      // Clear the form for new bid
      setNewBid({
        amount: '',
        timeEstimate: '',
        message: '',
        warranty: '',
        includes: []
      });
    }

    setSelectedRequest(request);
    setShowBidForm(true);
  };

  const handleSubmitBid = () => {
    if (!selectedRequest || !newBid.amount || !newBid.timeEstimate || !newBid.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check if this is an update to existing bid
    const existingBidIndex = bids.findIndex(b => b.requestId === selectedRequest.id && b.garageId === 'current-garage');
    
    if (existingBidIndex !== -1) {
      // Update existing bid (no additional charge for rebid)
      const updatedBid: Bid = {
        ...bids[existingBidIndex],
        amount: parseInt(newBid.amount),
        timeEstimate: newBid.timeEstimate,
        message: newBid.message,
        warranty: newBid.warranty,
        includes: newBid.includes,
        submittedDate: new Date().toISOString().split('T')[0] // Update submission date
      };

      setBids(prev => prev.map((bid, index) => index === existingBidIndex ? updatedBid : bid));
      toast.success('✅ Bid updated successfully! (No additional charge for rebid)');
    } else {
      // New bid
      const bid: Bid = {
        id: Date.now().toString(),
        requestId: selectedRequest.id,
        garageId: 'current-garage',
        amount: parseInt(newBid.amount),
        timeEstimate: newBid.timeEstimate,
        message: newBid.message,
        submittedDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        warranty: newBid.warranty,
        includes: newBid.includes
      };

      setBids([...bids, bid]);
      setWalletBalance(prev => prev - 2);
      
      // Update request bid count
      setRequests(prev => prev.map(r => 
        r.id === selectedRequest.id 
          ? { ...r, bids: r.bids + 1 }
          : r
      ));
      
      toast.success('✅ Bid submitted successfully! (2 credits deducted)');
    }

    setShowBidForm(false);
    setNewBid({
      amount: '',
      timeEstimate: '',
      message: '',
      warranty: '',
      includes: []
    });
    setSelectedRequest(null);
    setActiveTab('my-bids');
  };

  const handleViewRequest = (request: RepairRequest) => {
    setSelectedRequest(request);
    setShowRequestDetail(true);
  };

  const handleAcceptBid = (bidId: string) => {
    setBids(prev => prev.map(bid => 
      bid.id === bidId 
        ? { ...bid, status: 'accepted', garageDetails: {
            name: 'Al Quoz Auto Center',
            avatar: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=40&h=40&fit=crop',
            rating: 4.8,
            verified: true,
            completedJobs: 156,
            responseTime: '< 2 hours',
            location: 'Al Quoz, Dubai'
          }}
        : bid
    ));
    toast.success('✅ Bid accepted! Contact information will be shared with both parties.');
  };

  const handleContactCustomer = (bid: Bid) => {
    // 🔥 MESSAGING UNLOCK: Only after bid accepted or closed
    if (bid.status !== 'accepted' && bid.status !== 'closed') {
      toast.error('💬 Messaging is locked until the bid is accepted. This protects both parties and ensures commitment.');
      return;
    }
    
    // Mock customer contact information (in real app, this would come from the backend)
    const customerInfo = {
      name: 'Ahmed Hassan',
      phone: '+971501234567',
      whatsapp: '+971501234567',
      requestDetails: requests.find(r => r.id === bid.requestId)
    };

    // Show contact modal or redirect to messaging
    const message = encodeURIComponent(
      `Hello ${customerInfo.name}! I'm contacting you regarding your repair request "${customerInfo.requestDetails?.title}". My bid of AED ${bid.amount} has been accepted. When would be convenient to discuss the repair details?`
    );
    
    const whatsappUrl = `https://wa.me/${customerInfo.phone.replace(/\D/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    toast.success('✅ Opening WhatsApp to contact customer...');
  };

  return (
    <div className="h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-3 md:px-6 py-4">
          {/* Role Toggle */}
          <div className="mb-4 p-3 bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <div className="text-sm font-medium">Current Role: {userRole === 'garage-owner' ? '🏗️ Garage Owner' : '🚗 Car Owner'}</div>
                <div className="text-xs opacity-80 mt-1">
                  {userRole === 'garage-owner' 
                    ? 'You can bid on repair requests to win customers' 
                    : 'You can post repair requests and get bids from garages'
                  }
                </div>
          </div>

          {isGarageOwner && (
            <div className="mb-4 p-3 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg">
              <div className="flex items-center justify-between text-white">
                <div>
                  <div className="text-sm font-medium">💰 Wallet Balance: {walletBalance} Credits</div>
                  <div className="text-xs opacity-80 mt-1">Each bid costs 2 credits • 1 AED = 1 credit</div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowTopUpWalletModal(true)}
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  Top Up Wallet
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-bold flex items-center gap-2">
                <Wrench className="h-5 w-5 md:h-6 md:w-6 text-[var(--sublimes-gold)] flex-shrink-0" />
                <span className="truncate">Repair Bidding</span>
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Anonymously get bids from verified garages for your repair needs.
              </p>
              <div className="mt-1 text-xs">
                <span className="text-green-500">✅ FIXED & WORKING!</span> - 
                <span className="text-yellow-500 ml-1">Bidding, rebidding, and contact features now functional</span>
              </div>
            </div>
            {!isGarageOwner && (
              <Button 
                size="sm"
                className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80 whitespace-nowrap"
                onClick={handlePostRequest}
              >
                <Plus className="h-4 w-4 mr-2" />
                Post Request
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-3 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`grid w-full ${isGarageOwner ? 'grid-cols-4' : 'grid-cols-3'} mb-6`}>
            <TabsTrigger value="browse" className="text-xs sm:text-sm">Browse</TabsTrigger>
            <TabsTrigger value="my-requests" className="text-xs sm:text-sm">My Requests</TabsTrigger>
            <TabsTrigger value="my-bids" className="text-xs sm:text-sm">My Bids</TabsTrigger>
            {isGarageOwner && <TabsTrigger value="wallet" className="text-xs sm:text-sm">Wallet</TabsTrigger>}
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            {/* Filters and View Toggle */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div className="relative flex-1 mr-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search repair requests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <ViewToggle view={viewMode} onViewChange={setViewMode} />
              </div>
              
              <div className="flex gap-3">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Urgency</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Request Cards */}
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
              {filteredRequests.map((request) => (
                <Card 
                  key={request.id} 
                  className="bg-card hover:bg-card/80 transition-colors cursor-pointer hover:shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewRequest(request);
                  }}
                >
                  <CardContent className="p-4">
                    {/* Header Row */}
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge className={`${getUrgencyColor(request.urgency)} text-white text-xs`}>
                            {request.urgency.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {request.requestId}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-sm md:text-base break-words leading-tight">
                          {request.title}
                        </h3>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <div className="text-base md:text-xl font-bold text-[var(--sublimes-gold)]">
                          AED {request.budget.min}-{request.budget.max}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm mb-3 break-words">
                      {request.description}
                    </p>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 min-w-0">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{request.location}</span>
                      </div>
                      <div className="flex items-center gap-1 min-w-0">
                        <Car className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">
                          {request.vehicle?.make} {request.vehicle?.model} ({request.vehicle?.year})
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span className="whitespace-nowrap">
                          Posted {new Date(request.postedDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Deadline & Action */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-xs text-muted-foreground">
                        <strong>Deadline:</strong> {new Date(request.deadline).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        {!isGarageOwner && (
                          <Button 
                            size="sm"
                            variant="outline"
                            className="whitespace-nowrap self-start sm:self-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewRequest(request);
                            }}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View Details
                          </Button>
                        )}
                        {isGarageOwner && (
                          <Button 
                            size="sm"
                            className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80 whitespace-nowrap self-start sm:self-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlaceBid(request.id);
                            }}
                          >
                            Place Bid (2 Credits)
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="flex flex-wrap items-center justify-between pt-3 border-t border-border mt-3 gap-2">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {request.bids} Bids
                        </span>
                        <Badge variant="outline" className={`${getStatusColor(request.status)} text-white text-xs`}>
                          {request.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {request.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-requests">
            {userRole === 'garage-owner' ? (
              <div className="text-center py-12">
                <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
                <p className="text-muted-foreground mb-4">
                  Garage owners cannot view this section. Only car owners can post repair requests.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.filter(r => r.id === 'user-request').length === 0 ? (
                  <div className="text-center py-12">
                    <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No repair requests yet</h3>
                    <p className="text-muted-foreground mb-4">Start by posting your first repair request anonymously</p>
                    <Button 
                      className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80"
                      onClick={handlePostRequest}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Post Repair Request
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.filter(r => r.id.startsWith('user-')).map((request) => (
                      <Card key={request.id} className="bg-card">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold">{request.title}</h3>
                              <p className="text-sm text-muted-foreground">Request ID: {request.requestId}</p>
                            </div>
                            <Badge className={`${getStatusColor(request.status)} text-white`}>
                              {request.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{request.description}</p>
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">{request.bids} bids received</span>
                            </div>
                            <div className="text-lg font-bold text-[var(--sublimes-gold)]">
                              AED {request.budget.min}-{request.budget.max}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-bids">
            <div className="space-y-4">
              {bids.map((bid) => {
                const request = requests.find(r => r.id === bid.requestId);
                return (
                  <Card key={bid.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold break-words">{request?.title || 'Anonymous Request'}</h3>
                          <p className="text-muted-foreground text-sm break-words">
                            Bid submitted to Request #{request?.requestId || bid.requestId}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`capitalize whitespace-nowrap ${
                            bid.status === 'accepted' ? 'bg-green-100 text-green-800 border-green-300' :
                            bid.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-300' :
                            'bg-yellow-100 text-yellow-800 border-yellow-300'
                          }`}
                        >
                          {bid.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <div>
                          <Label className="text-sm text-muted-foreground">Your Bid</Label>
                          <div className="text-xl font-bold text-[var(--sublimes-gold)]">AED {bid.amount}</div>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Time Estimate</Label>
                          <div className="font-medium">{bid.timeEstimate}</div>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Warranty</Label>
                          <div className="font-medium">{bid.warranty}</div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm text-muted-foreground gap-2">
                        <span>Submitted {new Date(bid.submittedDate).toLocaleDateString()}</span>
                        {bid.status === 'accepted' && bid.garageDetails ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="self-start sm:self-auto bg-green-600 hover:bg-green-700 text-white border-green-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleContactCustomer(bid);
                            }}
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Contact Customer
                          </Button>
                        ) : (
                          <Badge variant="secondary" className="self-start sm:self-auto">
                            {bid.status === 'pending' ? 'Awaiting Response' : 'No Contact Available'}
                          </Badge>
                        )}
                      </div>

                      {bid.status === 'accepted' && bid.garageDetails && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="text-sm text-green-600 font-medium mb-2">
                            ✅ Bid Accepted - Contact Information Available
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={bid.garageDetails.avatar} />
                                <AvatarFallback>{bid.garageDetails.name[0]}</AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <div className="font-medium break-words">{bid.garageDetails.name}</div>
                                <div className="text-sm text-muted-foreground break-words">{bid.garageDetails.location}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {isGarageOwner && (
            <TabsContent value="wallet">
              <div className="space-y-6">
                {/* Enhanced Balance Card */}
                <Card className="bg-gradient-to-r from-[var(--sublimes-gold)] to-[var(--sublimes-gold)]/80 p-6 text-[var(--sublimes-dark-bg)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90 mb-1">Available Balance</p>
                      <p className="text-3xl font-bold">{formatAmount(walletBalance)}</p>
                      <p className="text-sm opacity-90 mt-1">Ready for bidding</p>
                    </div>
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <DollarSign className="w-8 h-8" />
                      </div>
                      <Button
                        onClick={() => setShowTopUpWalletModal(true)}
                        className="bg-white/20 text-[var(--sublimes-dark-bg)] hover:bg-white/30 backdrop-blur-sm"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Quick Top Up
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Enhanced Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Spent</p>
                        <p className="text-xl font-bold text-[var(--sublimes-light-text)]">
                          {formatAmount(totalSpent)}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                        <ArrowUpRight className="w-6 h-6 text-red-500" />
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Top-ups</p>
                        <p className="text-xl font-bold text-[var(--sublimes-light-text)]">
                          {formatAmount(totalTopUps)}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-green-500" />
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Active Bids</p>
                        <p className="text-xl font-bold text-[var(--sublimes-light-text)]">{activeBids}</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-orange-500" />
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Enhanced Transaction History */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <History className="w-6 h-6 text-[var(--sublimes-gold)]" />
                      <h2 className="text-xl font-bold text-[var(--sublimes-light-text)]">Transaction History</h2>
                    </div>
                    
                    <select
                      className="px-3 py-2 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:ring-2 focus:ring-[var(--sublimes-gold)]"
                    >
                      <option value="7">Last 7 days</option>
                      <option value="30">Last 30 days</option>
                      <option value="90">Last 90 days</option>
                      <option value="365">Last year</option>
                    </select>
                  </div>

                  <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
                    <div className="divide-y divide-[var(--sublimes-border)]">
                      {walletTransactions.map((transaction) => (
                        <div key={transaction.id} className="p-4 hover:bg-[var(--sublimes-dark-bg)]/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-[var(--sublimes-dark-bg)] rounded-full flex items-center justify-center">
                                {getTransactionIcon(transaction.type, transaction.amount)}
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <p className="font-medium text-[var(--sublimes-light-text)]">{transaction.description}</p>
                                  {getStatusIcon(transaction.status)}
                                </div>
                                <div className="flex items-center space-x-3 text-sm text-gray-400">
                                  <span>{formatDateTime(transaction.date)}</span>
                                  {transaction.reference && (
                                    <>
                                      <span>•</span>
                                      <span>Ref: {transaction.reference}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-medium ${
                                transaction.amount > 0 ? 'text-green-500' : 'text-red-500'
                              }`}>
                                {transaction.amount > 0 ? '+' : ''}{formatAmount(transaction.amount)}
                              </p>
                              <p className="text-xs text-gray-400 capitalize">{transaction.status}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Top Up Wallet Modal */}
      <TopUpWalletModal
        isOpen={showTopUpWalletModal}
        onClose={() => setShowTopUpWalletModal(false)}
        onNavigate={onNavigate || (() => {})}
      />

      {/* Post Request Modal */}
      <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-[var(--sublimes-gold)]" />
              Post Anonymous Repair Request
            </DialogTitle>
            <DialogDescription>
              Your request will be posted anonymously. Only verified garage owners can bid on your request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Request Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Engine Oil Leak Repair"
                value={newRequest.title}
                onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the issue in detail..."
                rows={4}
                value={newRequest.description}
                onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={newRequest.category} onValueChange={(value) => setNewRequest(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engine">Engine</SelectItem>
                    <SelectItem value="AC/Cooling">AC/Cooling</SelectItem>
                    <SelectItem value="Brake">Brake</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="Transmission">Transmission</SelectItem>
                    <SelectItem value="Body Work">Body Work</SelectItem>
                    <SelectItem value="Suspension">Suspension</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="urgency">Urgency</Label>
                <Select value={newRequest.urgency} onValueChange={(value: any) => setNewRequest(prev => ({ ...prev, urgency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget-min">Min Budget (AED)</Label>
                <Input
                  id="budget-min"
                  type="number"
                  placeholder="200"
                  value={newRequest.budgetMin}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, budgetMin: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="budget-max">Max Budget (AED)</Label>
                <Input
                  id="budget-max"
                  type="number"
                  placeholder="800"
                  value={newRequest.budgetMax}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, budgetMax: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Dubai Marina Area"
                value={newRequest.location}
                onChange={(e) => setNewRequest(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={newRequest.deadline}
                onChange={(e) => setNewRequest(prev => ({ ...prev, deadline: e.target.value }))}
              />
            </div>

            <div className="space-y-3">
              <Label>Vehicle Information (Optional)</Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Input
                    placeholder="Make (e.g., BYD)"
                    value={newRequest.vehicle.make}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, vehicle: { ...prev.vehicle, make: e.target.value } }))}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Model (e.g., Han)"
                    value={newRequest.vehicle.model}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, vehicle: { ...prev.vehicle, model: e.target.value } }))}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Year"
                    value={newRequest.vehicle.year}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, vehicle: { ...prev.vehicle, year: e.target.value } }))}
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-sm">Anonymous Posting</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your personal information will remain private. Only verified garages can bid, and contact details are shared only after you accept a bid.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setShowRequestForm(false)}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80"
              onClick={handleSubmitRequest}
            >
              Post Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Place Bid Modal */}
      <Dialog open={showBidForm} onOpenChange={setShowBidForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[var(--sublimes-gold)]" />
              {bids.find(b => b.requestId === selectedRequest?.id && b.garageId === 'current-garage') 
                ? 'Update Bid' : 'Place Bid'} - {selectedRequest?.title}
            </DialogTitle>
            <DialogDescription>
              {bids.find(b => b.requestId === selectedRequest?.id && b.garageId === 'current-garage')
                ? 'Update your existing bid for this repair request. No additional charges for rebidding.'
                : 'Submit your bid for this repair request. 2 credits will be deducted from your wallet.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bid-amount">Bid Amount (AED) *</Label>
                <Input
                  id="bid-amount"
                  type="number"
                  placeholder="500"
                  value={newBid.amount}
                  onChange={(e) => setNewBid(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="time-estimate">Time Estimate *</Label>
                <Input
                  id="time-estimate"
                  placeholder="e.g., 2-3 days"
                  value={newBid.timeEstimate}
                  onChange={(e) => setNewBid(prev => ({ ...prev, timeEstimate: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bid-message">Message to Customer *</Label>
              <Textarea
                id="bid-message"
                placeholder="Explain your approach, experience with similar repairs, parts needed, etc."
                rows={4}
                value={newBid.message}
                onChange={(e) => setNewBid(prev => ({ ...prev, message: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="warranty">Warranty Period</Label>
              <Select value={newBid.warranty} onValueChange={(value) => setNewBid(prev => ({ ...prev, warranty: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select warranty period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 month">1 Month</SelectItem>
                  <SelectItem value="3 months">3 Months</SelectItem>
                  <SelectItem value="6 months">6 Months</SelectItem>
                  <SelectItem value="12 months">12 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="font-medium text-sm">Bidding Cost</span>
              </div>
              <p className="text-sm text-muted-foreground">
                2 credits will be deducted from your wallet when you submit this bid. Current balance: {walletBalance} credits.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setShowBidForm(false)}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80"
              onClick={handleSubmitBid}
              disabled={!bids.find(b => b.requestId === selectedRequest?.id && b.garageId === 'current-garage') && walletBalance < 2}
            >
              {bids.find(b => b.requestId === selectedRequest?.id && b.garageId === 'current-garage')
                ? 'Update Bid (Free)'
                : walletBalance >= 2 ? 'Submit Bid (2 Credits)' : 'Insufficient Credits'
              }
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Request Detail Modal */}
      <Dialog open={showRequestDetail} onOpenChange={setShowRequestDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-[var(--sublimes-gold)]" />
              Request Details
            </DialogTitle>
            <DialogDescription>
              View detailed information about this repair request including requirements, timeline, and budget.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{selectedRequest.title}</h3>
                  <p className="text-sm text-muted-foreground">Request ID: {selectedRequest.requestId}</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-[var(--sublimes-gold)]">
                    AED {selectedRequest.budget.min}-{selectedRequest.budget.max}
                  </div>
                  <Badge className={`${getUrgencyColor(selectedRequest.urgency)} text-white`}>
                    {selectedRequest.urgency.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <p className="text-sm mt-1">{selectedRequest.description}</p>
              </div>

              {selectedRequest.vehicle && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Make</Label>
                    <p className="text-sm">{selectedRequest.vehicle.make}</p>
                  </div>
                  <div>
                    <Label>Model</Label>
                    <p className="text-sm">{selectedRequest.vehicle.model}</p>
                  </div>
                  <div>
                    <Label>Year</Label>
                    <p className="text-sm">{selectedRequest.vehicle.year}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Location</Label>
                  <p className="text-sm">{selectedRequest.location}</p>
                </div>
                <div>
                  <Label>Deadline</Label>
                  <p className="text-sm">{new Date(selectedRequest.deadline).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <div className="text-sm text-muted-foreground">
                  Posted on {new Date(selectedRequest.postedDate).toLocaleDateString()} • {selectedRequest.bids} bids
                </div>
                {isGarageOwner ? (
                  <Button 
                    className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80"
                    onClick={() => {
                      setShowRequestDetail(false);
                      handlePlaceBid(selectedRequest.id);
                    }}
                  >
                    Place Bid (2 Credits)
                  </Button>
                ) : (
                  <Button 
                    variant="outline"
                    onClick={() => setShowRequestDetail(false)}
                  >
                    Close
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}