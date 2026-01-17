import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Search, 
  Download, 
  Zap,
  TrendingUp,
  Eye,
  Edit,
  MoreVertical,
  Users,
  Building,
  ShoppingCart,
  Tag,
  Calendar,
  DollarSign,
  BarChart3,
  RefreshCw,
  PlayCircle,
  PauseCircle,
  StopCircle,
  RotateCcw,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { toast } from 'sonner';

interface BoostTransaction {
  id: string;
  user_id: string;
  listing_id?: string;
  boost_id: string;
  payment_ref: string;
  amount_cents: number;
  status: 'active' | 'expired' | 'cancelled' | 'refunded';
  start_at: string;
  end_at: string;
  applies_to: 'marketplace' | 'garage' | 'offers' | 'both';
  created_at: string;
  updated_at: string;
  // Extended fields
  user_name?: string;
  user_email?: string;
  listing_title?: string;
  boost_package_name?: string;
  analytics?: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
  };
}

interface BoostStats {
  totalBoosts: number;
  activeBoosts: number;
  expiredBoosts: number;
  totalRevenue: number;
  marketplaceBoosts: number;
  garageBoosts: number;
  offersBoosts: number;
}

export function AdminBoostManagementHub() {
  const [boostTransactions, setBoostTransactions] = useState<BoostTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('marketplace');
  const [stats, setStats] = useState<BoostStats>({
    totalBoosts: 0,
    activeBoosts: 0,
    expiredBoosts: 0,
    totalRevenue: 0,
    marketplaceBoosts: 0,
    garageBoosts: 0,
    offersBoosts: 0
  });

  // Mock data - replace with actual Supabase calls
  useEffect(() => {
    const mockBoostTransactions: BoostTransaction[] = [
      {
        id: '1',
        user_id: 'user-1',
        listing_id: 'listing-1',
        boost_id: 'boost-package-1',
        payment_ref: 'stripe_pi_123456789',
        amount_cents: 990,
        status: 'active',
        start_at: '2024-01-15T10:00:00Z',
        end_at: '2024-01-16T10:00:00Z',
        applies_to: 'marketplace',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        user_name: 'Ahmed Al-Rashid',
        user_email: 'ahmed@example.com',
        listing_title: '2023 BMW X5 - Premium Package',
        boost_package_name: 'Boost 24h',
        analytics: {
          impressions: 1247,
          clicks: 89,
          conversions: 3,
          ctr: 7.14
        }
      },
      {
        id: '2',
        user_id: 'user-2',
        listing_id: 'listing-2',
        boost_id: 'boost-package-2',
        payment_ref: 'stripe_pi_987654321',
        amount_cents: 2490,
        status: 'expired',
        start_at: '2024-01-10T08:00:00Z',
        end_at: '2024-01-13T08:00:00Z',
        applies_to: 'marketplace',
        created_at: '2024-01-10T08:00:00Z',
        updated_at: '2024-01-13T08:00:00Z',
        user_name: 'Sarah Johnson',
        user_email: 'sarah@example.com',
        listing_title: '2022 Mercedes C-Class - Low Mileage',
        boost_package_name: 'Boost 72h',
        analytics: {
          impressions: 892,
          clicks: 45,
          conversions: 1,
          ctr: 5.04
        }
      },
      {
        id: '3',
        user_id: 'user-3',
        listing_id: 'listing-3',
        boost_id: 'boost-package-3',
        payment_ref: 'stripe_pi_456789123',
        amount_cents: 4990,
        status: 'active',
        start_at: '2024-01-14T12:00:00Z',
        end_at: '2024-01-21T12:00:00Z',
        applies_to: 'garage',
        created_at: '2024-01-14T12:00:00Z',
        updated_at: '2024-01-14T12:00:00Z',
        user_name: 'Mohammed Hassan',
        user_email: 'mohammed@example.com',
        listing_title: 'Premium Auto Services - Garage',
        boost_package_name: 'Boost 168h',
        analytics: {
          impressions: 567,
          clicks: 23,
          conversions: 2,
          ctr: 4.06
        }
      },
      {
        id: '4',
        user_id: 'user-4',
        listing_id: 'listing-4',
        boost_id: 'boost-package-1',
        payment_ref: 'stripe_pi_789123456',
        amount_cents: 990,
        status: 'cancelled',
        start_at: '2024-01-12T14:00:00Z',
        end_at: '2024-01-13T14:00:00Z',
        applies_to: 'offers',
        created_at: '2024-01-12T14:00:00Z',
        updated_at: '2024-01-12T16:00:00Z',
        user_name: 'Fatima Al-Zahra',
        user_email: 'fatima@example.com',
        listing_title: 'Special Car Detailing Offer',
        boost_package_name: 'Boost 24h',
        analytics: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          ctr: 0
        }
      }
    ];

    setBoostTransactions(mockBoostTransactions);
    
    // Calculate stats
    const totalBoosts = mockBoostTransactions.length;
    const activeBoosts = mockBoostTransactions.filter(bt => bt.status === 'active').length;
    const expiredBoosts = mockBoostTransactions.filter(bt => bt.status === 'expired').length;
    const totalRevenue = mockBoostTransactions.reduce((sum, bt) => sum + bt.amount_cents, 0);
    const marketplaceBoosts = mockBoostTransactions.filter(bt => bt.applies_to === 'marketplace').length;
    const garageBoosts = mockBoostTransactions.filter(bt => bt.applies_to === 'garage').length;
    const offersBoosts = mockBoostTransactions.filter(bt => bt.applies_to === 'offers').length;

    setStats({
      totalBoosts,
      activeBoosts,
      expiredBoosts,
      totalRevenue,
      marketplaceBoosts,
      garageBoosts,
      offersBoosts
    });
    
    setLoading(false);
  }, []);

  const filteredBoosts = boostTransactions.filter(boost => {
    const matchesSearch = boost.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         boost.listing_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         boost.boost_package_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || boost.status === statusFilter;
    const matchesModule = moduleFilter === 'all' || boost.applies_to === moduleFilter;
    return matchesSearch && matchesStatus && matchesModule;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>;
      case 'expired':
        return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">Expired</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Cancelled</Badge>;
      case 'refunded':
        return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">Refunded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <PlayCircle className="h-4 w-4 text-green-500" />;
      case 'expired':
        return <StopCircle className="h-4 w-4 text-gray-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'refunded':
        return <RotateCcw className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getModuleIcon = (appliesTo: string) => {
    switch (appliesTo) {
      case 'marketplace':
        return <ShoppingCart className="h-4 w-4 text-blue-500" />;
      case 'garage':
        return <Building className="h-4 w-4 text-purple-500" />;
      case 'offers':
        return <Tag className="h-4 w-4 text-green-500" />;
      case 'both':
        return <Zap className="h-4 w-4 text-[var(--sublimes-gold)]" />;
      default:
        return <Zap className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatPrice = (priceCents: number) => {
    return `AED ${(priceCents / 100).toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBoostAction = (boostId: string, action: string) => {
    // Implement boost actions
    toast.success(`Boost ${action} successfully`);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-[var(--sublimes-gold)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)]">Boost Management Hub</h1>
          <p className="text-gray-400">Centralized boost management across all modules</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline" 
            size="sm"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-[var(--sublimes-gold)]" />
              <div>
                <p className="text-2xl font-bold text-[var(--sublimes-light-text)]">{stats.totalBoosts}</p>
                <p className="text-sm text-gray-400">Total Boosts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <PlayCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-[var(--sublimes-light-text)]">{stats.activeBoosts}</p>
                <p className="text-sm text-gray-400">Active Boosts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-[var(--sublimes-light-text)]">{formatPrice(stats.totalRevenue)}</p>
                <p className="text-sm text-gray-400">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-[var(--sublimes-light-text)]">
                  {boostTransactions.reduce((sum, bt) => sum + (bt.analytics?.impressions || 0), 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">Total Impressions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-[var(--sublimes-light-text)]">{stats.marketplaceBoosts}</p>
                <p className="text-sm text-gray-400">Marketplace Boosts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-[var(--sublimes-light-text)]">{stats.garageBoosts}</p>
                <p className="text-sm text-gray-400">Garage Boosts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Tag className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-[var(--sublimes-light-text)]">{stats.offersBoosts}</p>
                <p className="text-sm text-gray-400">Offers Boosts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search boosts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                <SelectItem value="marketplace">Marketplace</SelectItem>
                <SelectItem value="garage">Garage</SelectItem>
                <SelectItem value="offers">Offers</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Boosts Table */}
      <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Boost Transactions ({filteredBoosts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredBoosts.map((boost) => (
              <div 
                key={boost.id}
                className="flex items-center justify-between p-4 border border-[var(--sublimes-border)] rounded-lg hover:bg-[var(--sublimes-card-bg)]/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(boost.status)}
                    <h3 className="font-semibold text-[var(--sublimes-light-text)]">{boost.listing_title}</h3>
                    {getStatusBadge(boost.status)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{boost.user_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatPrice(boost.amount_cents)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getModuleIcon(boost.applies_to)}
                      <span className="capitalize">{boost.applies_to}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(boost.start_at)} - {formatDate(boost.end_at)}</span>
                    </div>
                  </div>

                  {/* Analytics */}
                  {boost.analytics && (
                    <div className="grid grid-cols-4 gap-4 p-3 bg-[var(--sublimes-dark-bg)]/50 rounded-lg">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Eye className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-gray-400">Impressions</span>
                        </div>
                        <p className="text-lg font-semibold text-[var(--sublimes-light-text)]">
                          {boost.analytics.impressions.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-400">Clicks</span>
                        </div>
                        <p className="text-lg font-semibold text-[var(--sublimes-light-text)]">
                          {boost.analytics.clicks.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Users className="h-4 w-4 text-purple-500" />
                          <span className="text-sm text-gray-400">Conversions</span>
                        </div>
                        <p className="text-lg font-semibold text-[var(--sublimes-light-text)]">
                          {boost.analytics.conversions.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <BarChart3 className="h-4 w-4 text-[var(--sublimes-gold)]" />
                          <span className="text-sm text-gray-400">CTR</span>
                        </div>
                        <p className="text-lg font-semibold text-[var(--sublimes-light-text)]">
                          {boost.analytics.ctr.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {boost.status === 'active' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBoostAction(boost.id, 'pause')}
                    >
                      <PauseCircle className="mr-1 h-4 w-4" />
                      Pause
                    </Button>
                  )}
                  
                  {boost.status === 'expired' && (
                    <Button
                      size="sm"
                      onClick={() => handleBoostAction(boost.id, 'renew')}
                      className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/90"
                    >
                      <RotateCcw className="mr-1 h-4 w-4" />
                      Renew
                    </Button>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        View Analytics
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Boost
                      </DropdownMenuItem>
                      {boost.status === 'active' && (
                        <DropdownMenuItem className="text-red-500">
                          <StopCircle className="mr-2 h-4 w-4" />
                          Cancel Boost
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
