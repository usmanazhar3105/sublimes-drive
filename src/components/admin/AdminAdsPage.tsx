import { useState } from 'react';
import { 
  Monitor, 
  Eye, 
  DollarSign, 
  TrendingUp, 
  Plus,
  Edit3,
  Trash2,
  Play,
  Pause,
  BarChart3,
  Target,
  Users,
  Calendar,
  Settings,
  Download,
  Upload
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ViewToggle } from '../ui/ViewToggle';

export function AdminAdsPage() {
  const [selectedTab, setSelectedTab] = useState('campaigns');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreating, setIsCreating] = useState(false);

  // Mock campaigns data
  const campaigns = [
    {
      id: 'ADS-001',
      name: 'Premium Listings Boost',
      type: 'Banner Ad',
      status: 'Active',
      budget: 'AED 2,500',
      spent: 'AED 1,847',
      impressions: '45,230',
      clicks: '2,185',
      ctr: '4.83%',
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      targetAudience: 'Car Sellers',
      placement: 'Homepage Banner'
    },
    {
      id: 'ADS-002',
      name: 'Garage Services Promo',
      type: 'Sponsored Post',
      status: 'Active',
      budget: 'AED 1,800',
      spent: 'AED 956',
      impressions: '28,450',
      clicks: '1,324',
      ctr: '4.65%',
      startDate: '2024-01-20',
      endDate: '2024-02-20',
      targetAudience: 'Car Owners',
      placement: 'Garage Hub'
    },
    {
      id: 'ADS-003',
      name: 'Chinese Car Parts Deals',
      type: 'Native Ad',
      status: 'Paused',
      budget: 'AED 3,200',
      spent: 'AED 2,890',
      impressions: '67,820',
      clicks: '3,456',
      ctr: '5.09%',
      startDate: '2024-01-10',
      endDate: '2024-02-10',
      targetAudience: 'Chinese Car Owners',
      placement: 'Marketplace Feed'
    },
    {
      id: 'ADS-004',
      name: 'Track Day Event Promotion',
      type: 'Video Ad',
      status: 'Scheduled',
      budget: 'AED 1,500',
      spent: 'AED 0',
      impressions: '0',
      clicks: '0',
      ctr: '0%',
      startDate: '2024-02-01',
      endDate: '2024-02-28',
      targetAudience: 'Performance Enthusiasts',
      placement: 'Video Feed'
    }
  ];

  // Mock ad placements
  const adPlacements = [
    { id: 'homepage-banner', name: 'Homepage Top Banner', size: '1200x200', price: 'AED 150/day', availability: 'Available' },
    { id: 'sidebar-square', name: 'Sidebar Square Ad', size: '300x300', price: 'AED 80/day', availability: 'Occupied' },
    { id: 'feed-native', name: 'Native Feed Ad', size: 'Variable', price: 'AED 0.50/click', availability: 'Available' },
    { id: 'garage-banner', name: 'Garage Hub Banner', size: '800x120', price: 'AED 100/day', availability: 'Available' },
    { id: 'marketplace-strip', name: 'Marketplace Strip Ad', size: '1000x100', price: 'AED 120/day', availability: 'Occupied' }
  ];

  // Mock revenue data
  const revenueStats = {
    totalRevenue: 'AED 24,850',
    monthlyGrowth: '+18.3%',
    activeCampaigns: 12,
    totalImpressions: '234,567',
    totalClicks: '12,845',
    averageCTR: '5.48%',
    topPerformer: 'Chinese Car Parts Deals'
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color }: any) => (
    <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg`} style={{ backgroundColor: `${color}20` }}>
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
          <Badge className="bg-[var(--sublimes-gold)]/10 text-[var(--sublimes-gold)] border-[var(--sublimes-gold)]/30">
            Live
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="text-2xl font-bold text-[var(--sublimes-light-text)]">{value}</div>
          <div className="text-sm text-gray-400">{title}</div>
          <div className="text-xs font-medium" style={{ color }}>{subtitle}</div>
        </div>
      </CardContent>
    </Card>
  );

  const CampaignCard = ({ campaign }: any) => {
    if (viewMode === 'list') {
      return (
        <div className="grid grid-cols-10 gap-4 p-4 border-b border-[var(--sublimes-border)]/30 items-center">
          <div className="col-span-2">
            <div className="font-medium text-[var(--sublimes-light-text)]">{campaign.name}</div>
            <div className="text-sm text-gray-400">{campaign.type}</div>
          </div>
          <div>
            <Badge 
              className={`${
                campaign.status === 'Active' ? 'bg-green-500/10 text-green-500' :
                campaign.status === 'Paused' ? 'bg-yellow-500/10 text-yellow-500' :
                'bg-blue-500/10 text-blue-500'
              }`}
            >
              {campaign.status}
            </Badge>
          </div>
          <div className="text-sm text-[var(--sublimes-light-text)]">{campaign.budget}</div>
          <div className="text-sm text-[var(--sublimes-gold)]">{campaign.spent}</div>
          <div className="text-sm text-[var(--sublimes-light-text)]">{campaign.impressions}</div>
          <div className="text-sm text-[var(--sublimes-light-text)]">{campaign.clicks}</div>
          <div className="text-sm font-medium text-green-500">{campaign.ctr}</div>
          <div className="text-sm text-gray-400">{campaign.placement}</div>
          <div className="flex space-x-1">
            <Button size="sm" variant="outline" className="p-1 h-6 w-6">
              <Eye className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" className="p-1 h-6 w-6">
              <Edit3 className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" className="p-1 h-6 w-6">
              {campaign.status === 'Active' ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-[var(--sublimes-light-text)]">{campaign.name}</CardTitle>
            <Badge 
              className={`${
                campaign.status === 'Active' ? 'bg-green-500/10 text-green-500' :
                campaign.status === 'Paused' ? 'bg-yellow-500/10 text-yellow-500' :
                'bg-blue-500/10 text-blue-500'
              }`}
            >
              {campaign.status}
            </Badge>
          </div>
          <div className="text-sm text-gray-400">{campaign.type} • {campaign.placement}</div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400">Budget</div>
                <div className="font-medium text-[var(--sublimes-light-text)]">{campaign.budget}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Spent</div>
                <div className="font-medium text-[var(--sublimes-gold)]">{campaign.spent}</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-400">Impressions</div>
                <div className="font-medium text-[var(--sublimes-light-text)]">{campaign.impressions}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Clicks</div>
                <div className="font-medium text-[var(--sublimes-light-text)]">{campaign.clicks}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">CTR</div>
                <div className="font-medium text-green-500">{campaign.ctr}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button size="sm" variant="outline">
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className={campaign.status === 'Active' ? 'text-yellow-500' : 'text-green-500'}
              >
                {campaign.status === 'Active' ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCampaignsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Ad Campaigns</h3>
          <p className="text-gray-400">Manage and monitor advertising campaigns</p>
        </div>
        <div className="flex items-center space-x-3">
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          <Button 
            className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={revenueStats.totalRevenue}
          subtitle={revenueStats.monthlyGrowth}
          icon={DollarSign}
          color="#10B981"
        />
        <StatCard
          title="Active Campaigns"
          value={revenueStats.activeCampaigns}
          subtitle="Running now"
          icon={Target}
          color="#D4AF37"
        />
        <StatCard
          title="Total Impressions"
          value={revenueStats.totalImpressions}
          subtitle="This month"
          icon={Eye}
          color="#3B82F6"
        />
        <StatCard
          title="Average CTR"
          value={revenueStats.averageCTR}
          subtitle="Above industry avg"
          icon={TrendingUp}
          color="#8B5CF6"
        />
      </div>

      {/* Campaigns List */}
      {viewMode === 'list' && (
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-0">
            <div className="grid grid-cols-10 gap-4 p-4 border-b border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)]">
              <div className="col-span-2 text-sm font-medium text-gray-400">Campaign</div>
              <div className="text-sm font-medium text-gray-400">Status</div>
              <div className="text-sm font-medium text-gray-400">Budget</div>
              <div className="text-sm font-medium text-gray-400">Spent</div>
              <div className="text-sm font-medium text-gray-400">Impressions</div>
              <div className="text-sm font-medium text-gray-400">Clicks</div>
              <div className="text-sm font-medium text-gray-400">CTR</div>
              <div className="text-sm font-medium text-gray-400">Placement</div>
              <div className="text-sm font-medium text-gray-400">Actions</div>
            </div>
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </CardContent>
        </Card>
      )}

      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  );

  const renderPlacementsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Ad Placements</h3>
          <p className="text-gray-400">Manage available advertising spaces</p>
        </div>
        <Button className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]">
          <Plus className="w-4 h-4 mr-2" />
          Add Placement
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {adPlacements.map((placement) => (
          <Card key={placement.id} className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[var(--sublimes-light-text)]">{placement.name}</CardTitle>
                <Badge 
                  className={placement.availability === 'Available' 
                    ? 'bg-green-500/10 text-green-500' 
                    : 'bg-red-500/10 text-red-500'
                  }
                >
                  {placement.availability}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Size:</span>
                  <span className="text-[var(--sublimes-light-text)]">{placement.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Price:</span>
                  <span className="text-[var(--sublimes-gold)]">{placement.price}</span>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Stats
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Analytics & Reporting</h3>
          <p className="text-gray-400">Track ad performance and revenue metrics</p>
        </div>
        <Button className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Click-Through Rate"
          value="5.48%"
          subtitle="+0.3% vs last month"
          icon={Target}
          color="#10B981"
        />
        <StatCard
          title="Cost Per Click"
          value="AED 0.78"
          subtitle="-12% vs last month"
          icon={DollarSign}
          color="#3B82F6"
        />
        <StatCard
          title="Conversion Rate"
          value="3.2%"
          subtitle="+0.8% vs last month"
          icon={TrendingUp}
          color="#8B5CF6"
        />
        <StatCard
          title="Top Advertiser"
          value="GarageHub+"
          subtitle="AED 8,450 spent"
          icon={Users}
          color="#D4AF37"
        />
      </div>

      <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
        <CardHeader>
          <CardTitle className="text-[var(--sublimes-light-text)]">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-[var(--sublimes-border)] rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-400">Analytics chart would be displayed here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Ad System Settings</h3>
        <p className="text-gray-400">Configure advertising system preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--sublimes-light-text)]">Revenue Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Revenue Share (%)</label>
              <Input 
                defaultValue="70"
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Minimum Bid (AED)</label>
              <Input 
                defaultValue="50"
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              />
            </div>
            <Button className="w-full bg-green-500 text-white">
              Save Revenue Settings
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--sublimes-light-text)]">Campaign Defaults</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Default Campaign Duration (days)</label>
              <Input 
                defaultValue="30"
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Auto-approval Threshold (AED)</label>
              <Input 
                defaultValue="1000"
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              />
            </div>
            <Button className="w-full bg-green-500 text-white">
              Save Campaign Defaults
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-[var(--sublimes-dark-bg)] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)] mb-2">Ads & Monetization</h1>
        <p className="text-gray-400">Manage advertising campaigns and monetization strategies</p>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <TabsTrigger value="campaigns" className="data-[state=active]:bg-[var(--sublimes-gold)] data-[state=active]:text-[var(--sublimes-dark-bg)]">
            <Target className="h-4 w-4 mr-2" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="placements" className="data-[state=active]:bg-[var(--sublimes-gold)] data-[state=active]:text-[var(--sublimes-dark-bg)]">
            <Monitor className="h-4 w-4 mr-2" />
            Placements
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-[var(--sublimes-gold)] data-[state=active]:text-[var(--sublimes-dark-bg)]">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-[var(--sublimes-gold)] data-[state=active]:text-[var(--sublimes-dark-bg)]">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">{renderCampaignsTab()}</TabsContent>
        <TabsContent value="placements">{renderPlacementsTab()}</TabsContent>
        <TabsContent value="analytics">{renderAnalyticsTab()}</TabsContent>
        <TabsContent value="settings">{renderSettingsTab()}</TabsContent>
      </Tabs>
    </div>
  );
}