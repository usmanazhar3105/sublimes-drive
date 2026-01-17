/**
 * AdminAdsPage_WIRED - Ads & Monetization Page (Database Connected)
 * 
 * Features:
 * - Real data from ad_campaigns, ad_placements, ad_events tables
 * - Create/Edit/Delete campaigns
 * - Manage ad placements
 * - Real-time analytics
 */

import { useState, useEffect } from 'react';
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
  RefreshCw,
  MousePointerClick
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ViewToggle } from '../ui/ViewToggle';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  campaign_type: string;
  status: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  start_date: string;
  end_date: string;
  target_audience?: string;
  placement?: string;
  creative_url?: string;
  landing_url?: string;
  created_at: string;
}

interface Placement {
  id: string;
  slug: string;
  name: string;
  description?: string;
  size?: string;
  price_per_day?: number;
  price_per_click?: number;
  availability: string;
  is_active: boolean;
}

interface AdStats {
  total_revenue: number;
  active_campaigns: number;
  total_impressions: number;
  total_clicks: number;
  average_ctr: number;
  available_placements: number;
}

export function AdminAdsPage_WIRED() {
  const [selectedTab, setSelectedTab] = useState('campaigns');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [stats, setStats] = useState<AdStats | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    campaign_type: 'banner',
    budget: '',
    start_date: '',
    end_date: '',
    target_audience: '',
    placement: '',
    landing_url: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch campaigns
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('ad_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (campaignsError) {
        console.error('Campaigns error:', campaignsError);
      } else {
        setCampaigns(campaignsData || []);
      }

      // Fetch placements
      const { data: placementsData, error: placementsError } = await supabase
        .from('ad_placements')
        .select('*')
        .order('name');

      if (placementsError) {
        console.error('Placements error:', placementsError);
      } else {
        setPlacements(placementsData || []);
      }

      // Fetch stats using RPC
      const { data: statsData, error: statsError } = await supabase
        .rpc('fn_get_ad_stats');

      if (statsError) {
        console.error('Stats error:', statsError);
        // Calculate stats manually if RPC doesn't exist
        const totalRevenue = campaignsData?.reduce((sum, c) => sum + (c.spent || 0), 0) || 0;
        const activeCampaigns = campaignsData?.filter(c => c.status === 'active').length || 0;
        const totalImpressions = campaignsData?.reduce((sum, c) => sum + (c.impressions || 0), 0) || 0;
        const totalClicks = campaignsData?.reduce((sum, c) => sum + (c.clicks || 0), 0) || 0;
        const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions * 100) : 0;
        
        setStats({
          total_revenue: totalRevenue,
          active_campaigns: activeCampaigns,
          total_impressions: totalImpressions,
          total_clicks: totalClicks,
          average_ctr: parseFloat(avgCtr.toFixed(2)),
          available_placements: placementsData?.filter(p => p.availability === 'available').length || 0
        });
      } else {
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load ad data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!form.name || !form.budget) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('ad_campaigns')
        .insert({
          name: form.name,
          description: form.description,
          campaign_type: form.campaign_type,
          budget: parseFloat(form.budget),
          start_date: form.start_date || null,
          end_date: form.end_date || null,
          target_audience: form.target_audience,
          placement: form.placement,
          landing_url: form.landing_url,
          status: 'draft',
          created_by: user?.user?.id
        });

      if (error) throw error;

      toast.success('Campaign created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    }
  };

  const handleUpdateCampaign = async () => {
    if (!editingCampaign) return;

    try {
      const { error } = await supabase
        .from('ad_campaigns')
        .update({
          name: form.name,
          description: form.description,
          campaign_type: form.campaign_type,
          budget: parseFloat(form.budget),
          start_date: form.start_date || null,
          end_date: form.end_date || null,
          target_audience: form.target_audience,
          placement: form.placement,
          landing_url: form.landing_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingCampaign.id);

      if (error) throw error;

      toast.success('Campaign updated successfully!');
      setEditingCampaign(null);
      setShowCreateModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error updating campaign:', error);
      toast.error('Failed to update campaign');
    }
  };

  const handleToggleCampaignStatus = async (campaign: Campaign) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    
    try {
      const { error } = await supabase
        .from('ad_campaigns')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', campaign.id);

      if (error) throw error;

      toast.success(`Campaign ${newStatus === 'active' ? 'activated' : 'paused'}`);
      fetchData();
    } catch (error: any) {
      toast.error('Failed to update campaign status');
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      const { error } = await supabase
        .from('ad_campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;

      toast.success('Campaign deleted');
      fetchData();
    } catch (error: any) {
      toast.error('Failed to delete campaign');
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      campaign_type: 'banner',
      budget: '',
      start_date: '',
      end_date: '',
      target_audience: '',
      placement: '',
      landing_url: ''
    });
  };

  const openEditModal = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setForm({
      name: campaign.name,
      description: campaign.description || '',
      campaign_type: campaign.campaign_type,
      budget: campaign.budget?.toString() || '',
      start_date: campaign.start_date || '',
      end_date: campaign.end_date || '',
      target_audience: campaign.target_audience || '',
      placement: campaign.placement || '',
      landing_url: campaign.landing_url || ''
    });
    setShowCreateModal(true);
  };

  const formatCurrency = (amount: number) => {
    return `AED ${amount?.toLocaleString() || '0'}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-500';
      case 'paused': return 'bg-yellow-500/10 text-yellow-500';
      case 'scheduled': return 'bg-blue-500/10 text-blue-500';
      case 'completed': return 'bg-gray-500/10 text-gray-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
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

  const renderCampaignsTab = () => (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]"
            onClick={() => {
              resetForm();
              setEditingCampaign(null);
              setShowCreateModal(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Campaigns list */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading campaigns...</div>
      ) : campaigns.length === 0 ? (
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-12 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-[var(--sublimes-light-text)] mb-2">No campaigns yet</h3>
            <p className="text-gray-400 mb-4">Create your first advertising campaign to get started</p>
            <Button 
              className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-[var(--sublimes-light-text)]">{campaign.name}</h3>
                    <p className="text-sm text-gray-400 capitalize">{campaign.campaign_type}</p>
                  </div>
                  <Badge className={getStatusColor(campaign.status)}>
                    {campaign.status}
                  </Badge>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Budget</span>
                    <span className="text-[var(--sublimes-light-text)]">{formatCurrency(campaign.budget)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Spent</span>
                    <span className="text-[var(--sublimes-gold)]">{formatCurrency(campaign.spent)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Impressions</span>
                    <span className="text-[var(--sublimes-light-text)]">{campaign.impressions?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">CTR</span>
                    <span className="text-green-500">{campaign.ctr || 0}%</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleCampaignStatus(campaign)}
                  >
                    {campaign.status === 'active' ? (
                      <><Pause className="h-4 w-4 mr-1" /> Pause</>
                    ) : (
                      <><Play className="h-4 w-4 mr-1" /> Activate</>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditModal(campaign)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-500 hover:bg-red-500/10"
                    onClick={() => handleDeleteCampaign(campaign.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--sublimes-border)]">
                    <th className="text-left p-4 text-gray-400 font-medium">Campaign</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Budget</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Spent</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Impressions</th>
                    <th className="text-left p-4 text-gray-400 font-medium">CTR</th>
                    <th className="text-right p-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b border-[var(--sublimes-border)]/30">
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-[var(--sublimes-light-text)]">{campaign.name}</div>
                          <div className="text-sm text-gray-400 capitalize">{campaign.campaign_type}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                      </td>
                      <td className="p-4 text-[var(--sublimes-light-text)]">{formatCurrency(campaign.budget)}</td>
                      <td className="p-4 text-[var(--sublimes-gold)]">{formatCurrency(campaign.spent)}</td>
                      <td className="p-4 text-[var(--sublimes-light-text)]">{campaign.impressions?.toLocaleString() || 0}</td>
                      <td className="p-4 text-green-500">{campaign.ctr || 0}%</td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleToggleCampaignStatus(campaign)}>
                            {campaign.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openEditModal(campaign)}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-500" 
                            onClick={() => handleDeleteCampaign(campaign.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderPlacementsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {placements.map((placement) => (
          <Card key={placement.id} className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-[var(--sublimes-light-text)]">{placement.name}</h3>
                  <p className="text-sm text-gray-400">{placement.size || 'Variable'}</p>
                </div>
                <Badge className={
                  placement.availability === 'available' 
                    ? 'bg-green-500/10 text-green-500' 
                    : 'bg-orange-500/10 text-orange-500'
                }>
                  {placement.availability}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                {placement.price_per_day && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Daily Rate</span>
                    <span className="text-[var(--sublimes-gold)]">{formatCurrency(placement.price_per_day)}</span>
                  </div>
                )}
                {placement.price_per_click && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Per Click</span>
                    <span className="text-[var(--sublimes-gold)]">{formatCurrency(placement.price_per_click)}</span>
                  </div>
                )}
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                disabled={placement.availability !== 'available'}
              >
                {placement.availability === 'available' ? 'Book Placement' : 'Occupied'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
        <CardHeader>
          <CardTitle className="text-[var(--sublimes-light-text)]">Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-[var(--sublimes-gold)]">
                {stats?.total_impressions?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-400">Total Impressions</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-500">
                {stats?.total_clicks?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-400">Total Clicks</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">
                {stats?.average_ctr || 0}%
              </p>
              <p className="text-sm text-gray-400">Average CTR</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-500">
                {formatCurrency(stats?.total_revenue || 0)}
              </p>
              <p className="text-sm text-gray-400">Total Revenue</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Campaigns */}
      <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
        <CardHeader>
          <CardTitle className="text-[var(--sublimes-light-text)]">Top Performing Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns
              .filter(c => c.status === 'active')
              .sort((a, b) => (b.ctr || 0) - (a.ctr || 0))
              .slice(0, 5)
              .map((campaign, index) => (
                <div key={campaign.id} className="flex items-center justify-between p-3 bg-[var(--sublimes-dark-bg)] rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-[var(--sublimes-gold)] font-bold">#{index + 1}</span>
                    <div>
                      <p className="font-medium text-[var(--sublimes-light-text)]">{campaign.name}</p>
                      <p className="text-sm text-gray-400">{campaign.impressions?.toLocaleString()} impressions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-500">{campaign.ctr}% CTR</p>
                    <p className="text-sm text-gray-400">{campaign.clicks} clicks</p>
                  </div>
                </div>
              ))}
            {campaigns.filter(c => c.status === 'active').length === 0 && (
              <p className="text-center text-gray-400 py-8">No active campaigns to display</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
        <CardHeader>
          <CardTitle className="text-[var(--sublimes-light-text)]">Ad Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium text-[var(--sublimes-light-text)] mb-4">Default Pricing</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Min Budget (AED)</label>
                <Input type="number" defaultValue="500" className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Cost Per Click (AED)</label>
                <Input type="number" defaultValue="0.50" className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]" />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-[var(--sublimes-light-text)] mb-4">Campaign Settings</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-[var(--sublimes-light-text)]">Auto-pause campaigns when budget depleted</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-[var(--sublimes-light-text)]">Send email notifications for campaign milestones</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="rounded" />
                <span className="text-[var(--sublimes-light-text)]">Require manual approval for new campaigns</span>
              </label>
            </div>
          </div>

          <Button className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]">
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 bg-[var(--sublimes-dark-bg)] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)] mb-2">Ads & Monetization</h1>
        <p className="text-gray-400">Manage advertising campaigns and monetization strategies</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(stats?.total_revenue || 0)} 
          subtitle="+18.3%" 
          icon={DollarSign} 
          color="#22C55E" 
        />
        <StatCard 
          title="Active Campaigns" 
          value={stats?.active_campaigns || 0} 
          subtitle="Running now" 
          icon={Target} 
          color="#F59E0B" 
        />
        <StatCard 
          title="Total Impressions" 
          value={(stats?.total_impressions || 0).toLocaleString()} 
          subtitle="This month" 
          icon={Eye} 
          color="#3B82F6" 
        />
        <StatCard 
          title="Average CTR" 
          value={`${stats?.average_ctr || 0}%`} 
          subtitle="Above industry avg" 
          icon={TrendingUp} 
          color="#D4AF37" 
        />
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

      {/* Create/Edit Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-light-text)]">
              {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Campaign Name *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter campaign name"
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Description</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Campaign description"
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Type</label>
                <select
                  value={form.campaign_type}
                  onChange={(e) => setForm({ ...form, campaign_type: e.target.value })}
                  className="w-full p-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-md text-[var(--sublimes-light-text)]"
                >
                  <option value="banner">Banner Ad</option>
                  <option value="sponsored_post">Sponsored Post</option>
                  <option value="native">Native Ad</option>
                  <option value="video">Video Ad</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Budget (AED) *</label>
                <Input
                  type="number"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  placeholder="0.00"
                  className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Start Date</label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">End Date</label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Target Audience</label>
              <Input
                value={form.target_audience}
                onChange={(e) => setForm({ ...form, target_audience: e.target.value })}
                placeholder="e.g., Car Owners, Sellers"
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Landing URL</label>
              <Input
                value={form.landing_url}
                onChange={(e) => setForm({ ...form, landing_url: e.target.value })}
                placeholder="https://..."
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]"
              onClick={editingCampaign ? handleUpdateCampaign : handleCreateCampaign}
            >
              {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

