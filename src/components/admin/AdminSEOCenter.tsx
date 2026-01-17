import { useState } from 'react';
import { 
  Search, 
  BarChart3, 
  Globe, 
  TrendingUp,
  Eye,
  Users,
  Clock,
  ExternalLink,
  Edit3,
  Save,
  Plus,
  Settings,
  Download
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ViewToggle } from '../ui/ViewToggle';

export function AdminSEOCenter() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // Mock SEO data
  const seoMetrics = {
    organicTraffic: '45,230',
    searchRanking: '#3',
    clickThroughRate: '3.8%',
    avgSessionDuration: '4:32',
    bounceRate: '34.2%',
    topKeywords: ['Chinese cars UAE', 'BMW Dubai', 'Car community'],
    totalPages: 127,
    indexedPages: 115
  };

  // Mock page data
  const pages = [
    {
      id: 'homepage',
      title: 'Sublimes Drive - Chinese Car Community UAE',
      url: '/',
      metaDescription: 'Join the ultimate Chinese car community in the UAE. Connect with fellow enthusiasts, find garages, buy/sell cars.',
      keywords: 'Chinese cars UAE, car community, BMW, Mercedes',
      status: 'Optimized',
      traffic: '12,450',
      ranking: '#1',
      lastUpdated: '2024-01-20'
    },
    {
      id: 'marketplace',
      title: 'Car Marketplace - Buy & Sell Chinese Cars',
      url: '/marketplace',
      metaDescription: 'Browse premium Chinese cars for sale in Dubai, Abu Dhabi, Sharjah. Verified sellers, detailed listings.',
      keywords: 'buy cars UAE, Chinese cars sale, BMW Dubai',
      status: 'Needs Review',
      traffic: '8,920',
      ranking: '#5',
      lastUpdated: '2024-01-18'
    },
    {
      id: 'garage-hub',
      title: 'Garage Hub - Trusted Chinese Car Services',
      url: '/garage-hub',
      metaDescription: 'Find verified garages specializing in Chinese car maintenance and repair in the UAE.',
      keywords: 'car service UAE, Chinese car garage, BMW service',
      status: 'Optimized',
      traffic: '6,340',
      ranking: '#2',
      lastUpdated: '2024-01-19'
    }
  ];

  // Mock keywords
  const keywords = [
    { keyword: 'Chinese cars UAE', position: 3, volume: '2,400', difficulty: 'Medium', trend: 'up' },
    { keyword: 'BMW Dubai', position: 1, volume: '1,900', difficulty: 'High', trend: 'stable' },
    { keyword: 'Car community UAE', position: 7, volume: '890', difficulty: 'Low', trend: 'up' },
    { keyword: 'Mercedes service Dubai', position: 12, volume: '1,200', difficulty: 'High', trend: 'down' },
    { keyword: 'Chinese car garage', position: 4, volume: '680', difficulty: 'Medium', trend: 'up' }
  ];

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

  const PageCard = ({ page }: any) => {
    if (viewMode === 'list') {
      return (
        <div className="grid grid-cols-8 gap-4 p-4 border-b border-[var(--sublimes-border)]/30 items-center">
          <div className="col-span-2">
            <div className="font-medium text-[var(--sublimes-light-text)] truncate">{page.title}</div>
            <div className="text-sm text-gray-400">{page.url}</div>
          </div>
          <div className="col-span-2 text-sm text-gray-400 line-clamp-2">{page.metaDescription}</div>
          <div>
            <Badge 
              className={page.status === 'Optimized' 
                ? 'bg-green-500/10 text-green-500' 
                : 'bg-yellow-500/10 text-yellow-500'
              }
            >
              {page.status}
            </Badge>
          </div>
          <div className="text-sm text-[var(--sublimes-light-text)]">{page.traffic}</div>
          <div className="text-sm font-medium text-[var(--sublimes-gold)]">{page.ranking}</div>
          <div className="flex space-x-1">
            <Button size="sm" variant="outline" className="p-1 h-6 w-6">
              <Edit3 className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" className="p-1 h-6 w-6">
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-[var(--sublimes-light-text)] truncate">{page.title}</CardTitle>
            <Badge 
              className={page.status === 'Optimized' 
                ? 'bg-green-500/10 text-green-500' 
                : 'bg-yellow-500/10 text-yellow-500'
              }
            >
              {page.status}
            </Badge>
          </div>
          <div className="text-xs text-gray-400">{page.url}</div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-xs text-gray-400 line-clamp-2">{page.metaDescription}</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-gray-500">Traffic</div>
                <div className="text-sm font-medium text-[var(--sublimes-light-text)]">{page.traffic}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Ranking</div>
                <div className="text-sm font-medium text-[var(--sublimes-gold)]">{page.ranking}</div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Edit3 className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <ExternalLink className="h-4 w-4 mr-1" />
                View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* SEO Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Organic Traffic"
          value={seoMetrics.organicTraffic}
          subtitle="+23% vs last month"
          icon={Users}
          color="#10B981"
        />
        <StatCard
          title="Search Ranking"
          value={seoMetrics.searchRanking}
          subtitle="Average position"
          icon={TrendingUp}
          color="#D4AF37"
        />
        <StatCard
          title="Click-Through Rate"
          value={seoMetrics.clickThroughRate}
          subtitle="+0.8% improvement"
          icon={Eye}
          color="#3B82F6"
        />
        <StatCard
          title="Session Duration"
          value={seoMetrics.avgSessionDuration}
          subtitle="Above average"
          icon={Clock}
          color="#8B5CF6"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--sublimes-light-text)]">Top Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {seoMetrics.topKeywords.map((keyword, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-[var(--sublimes-light-text)]">{keyword}</span>
                  <Badge variant="outline">#{index + 1}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--sublimes-light-text)]">Site Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Total Pages</span>
                <span className="text-sm text-[var(--sublimes-light-text)]">{seoMetrics.totalPages}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Indexed Pages</span>
                <span className="text-sm text-green-500">{seoMetrics.indexedPages}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Bounce Rate</span>
                <span className="text-sm text-[var(--sublimes-light-text)]">{seoMetrics.bounceRate}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderPagesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Page SEO Management</h3>
          <p className="text-gray-400">Manage meta tags, descriptions, and keywords for each page</p>
        </div>
        <div className="flex items-center space-x-3">
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          <Button className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]">
            <Plus className="w-4 h-4 mr-2" />
            Add Page
          </Button>
        </div>
      </div>

      {viewMode === 'list' && (
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-0">
            <div className="grid grid-cols-8 gap-4 p-4 border-b border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)]">
              <div className="col-span-2 text-sm font-medium text-gray-400">Page</div>
              <div className="col-span-2 text-sm font-medium text-gray-400">Description</div>
              <div className="text-sm font-medium text-gray-400">Status</div>
              <div className="text-sm font-medium text-gray-400">Traffic</div>
              <div className="text-sm font-medium text-gray-400">Ranking</div>
              <div className="text-sm font-medium text-gray-400">Actions</div>
            </div>
            {pages.map((page) => (
              <PageCard key={page.id} page={page} />
            ))}
          </CardContent>
        </Card>
      )}

      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {pages.map((page) => (
            <PageCard key={page.id} page={page} />
          ))}
        </div>
      )}
    </div>
  );

  const renderKeywordsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Keyword Management</h3>
          <p className="text-gray-400">Track keyword rankings and search performance</p>
        </div>
        <Button className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]">
          <Plus className="w-4 h-4 mr-2" />
          Add Keyword
        </Button>
      </div>

      <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
        <CardContent className="p-0">
          <div className="grid grid-cols-6 gap-4 p-4 border-b border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)]">
            <div className="text-sm font-medium text-gray-400">Keyword</div>
            <div className="text-sm font-medium text-gray-400">Position</div>
            <div className="text-sm font-medium text-gray-400">Volume</div>
            <div className="text-sm font-medium text-gray-400">Difficulty</div>
            <div className="text-sm font-medium text-gray-400">Trend</div>
            <div className="text-sm font-medium text-gray-400">Actions</div>
          </div>
          {keywords.map((keyword, index) => (
            <div key={index} className="grid grid-cols-6 gap-4 p-4 border-b border-[var(--sublimes-border)]/30 items-center">
              <div className="text-sm font-medium text-[var(--sublimes-light-text)]">{keyword.keyword}</div>
              <div className="text-sm font-medium text-[var(--sublimes-gold)]">#{keyword.position}</div>
              <div className="text-sm text-[var(--sublimes-light-text)]">{keyword.volume}</div>
              <div>
                <Badge 
                  className={`text-xs ${
                    keyword.difficulty === 'Low' ? 'bg-green-500/10 text-green-500' :
                    keyword.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-red-500/10 text-red-500'
                  }`}
                >
                  {keyword.difficulty}
                </Badge>
              </div>
              <div>
                <TrendingUp 
                  className={`h-4 w-4 ${
                    keyword.trend === 'up' ? 'text-green-500' :
                    keyword.trend === 'down' ? 'text-red-500' :
                    'text-gray-400'
                  }`}
                />
              </div>
              <div className="flex space-x-1">
                <Button size="sm" variant="outline" className="p-1 h-6 w-6">
                  <Edit3 className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" className="p-1 h-6 w-6">
                  <BarChart3 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">SEO Analytics</h3>
          <p className="text-gray-400">Detailed SEO performance metrics and insights</p>
        </div>
        <Button className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--sublimes-light-text)]">Organic Traffic Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-[var(--sublimes-border)] rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">Traffic chart would be displayed here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--sublimes-light-text)]">Keyword Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-[var(--sublimes-border)] rounded-lg">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">Rankings chart would be displayed here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">SEO Settings</h3>
        <p className="text-gray-400">Configure global SEO settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--sublimes-light-text)]">Global Meta Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Default Meta Title</label>
              <Input 
                defaultValue="Sublimes Drive - Chinese Car Community UAE"
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Default Meta Description</label>
              <Textarea
                defaultValue="Join the ultimate Chinese car community in the UAE. Connect with fellow enthusiasts, find garages, buy/sell cars."
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Default Keywords</label>
              <Input 
                defaultValue="Chinese cars UAE, car community, BMW, Mercedes"
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              />
            </div>
            <Button className="w-full bg-green-500 text-white">
              Save Meta Settings
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--sublimes-light-text)]">Analytics Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Google Analytics ID</label>
              <Input 
                placeholder="GA-XXXXXXXXX-X"
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Google Search Console</label>
              <Input 
                placeholder="Verification code"
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Bing Webmaster Tools</label>
              <Input 
                placeholder="Verification code"
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              />
            </div>
            <Button className="w-full bg-green-500 text-white">
              Save Analytics Settings
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
        <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)] mb-2">SEO & Analytics Center</h1>
        <p className="text-gray-400">Manage SEO settings, analytics, and search optimization</p>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[var(--sublimes-gold)] data-[state=active]:text-[var(--sublimes-dark-bg)]">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="pages" className="data-[state=active]:bg-[var(--sublimes-gold)] data-[state=active]:text-[var(--sublimes-dark-bg)]">
            <Globe className="h-4 w-4 mr-2" />
            Pages
          </TabsTrigger>
          <TabsTrigger value="keywords" className="data-[state=active]:bg-[var(--sublimes-gold)] data-[state=active]:text-[var(--sublimes-dark-bg)]">
            <Search className="h-4 w-4 mr-2" />
            Keywords
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-[var(--sublimes-gold)] data-[state=active]:text-[var(--sublimes-dark-bg)]">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-[var(--sublimes-gold)] data-[state=active]:text-[var(--sublimes-dark-bg)]">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">{renderOverviewTab()}</TabsContent>
        <TabsContent value="pages">{renderPagesTab()}</TabsContent>
        <TabsContent value="keywords">{renderKeywordsTab()}</TabsContent>
        <TabsContent value="analytics">{renderAnalyticsTab()}</TabsContent>
        <TabsContent value="settings">{renderSettingsTab()}</TabsContent>
      </Tabs>
    </div>
  );
}