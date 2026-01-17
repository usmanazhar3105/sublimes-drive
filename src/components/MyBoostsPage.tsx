import { useState } from 'react';
import { TrendingUp, Target, Clock, CheckCircle, Zap, Eye, MessageCircle, DollarSign, Star, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface MyBoostsPageProps {
  onNavigate?: (page: string) => void;
}

const boosts = [
  {
    id: 'BOOST-001',
    type: 'listing',
    title: 'NIO ES8 2023 - Premium Package',
    description: 'Boost your marketplace listing visibility',
    status: 'active',
    startDate: '2024-01-15',
    endDate: '2024-01-22',
    budget: 150,
    spent: 89,
    impressions: 12500,
    clicks: 340,
    messages: 23,
    views: 1240,
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&h=200&fit=crop',
    targetAudience: 'Chinese EV Enthusiasts',
    boostLevel: 'Premium'
  },
  {
    id: 'BOOST-002',
    type: 'post',
    title: 'Track Day Experience at Dubai Autodrome',
    description: 'Boost your community post reach',
    status: 'completed',
    startDate: '2024-01-10',
    endDate: '2024-01-17',
    budget: 75,
    spent: 75,
    impressions: 8900,
    clicks: 234,
    likes: 156,
    comments: 45,
    shares: 28,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    targetAudience: 'Track Day Enthusiasts',
    boostLevel: 'Standard'
  },
  {
    id: 'BOOST-003',
    type: 'garage',
    title: 'Elite Auto Service - Grand Opening',
    description: 'Promote your garage services',
    status: 'scheduled',
    startDate: '2024-01-25',
    endDate: '2024-02-01',
    budget: 200,
    spent: 0,
    targetAudience: 'Car Owners in Dubai',
    boostLevel: 'Premium',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop'
  },
  {
    id: 'BOOST-004',
    type: 'profile',
    title: 'Ahmed Hassan - Profile Visibility',
    description: 'Increase your profile visibility and followers',
    status: 'paused',
    startDate: '2024-01-12',
    endDate: '2024-01-19',
    budget: 100,
    spent: 45,
    impressions: 5600,
    profileViews: 890,
    newFollowers: 67,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=200&fit=crop',
    targetAudience: 'UAE Car Community',
    boostLevel: 'Standard'
  }
];

export function MyBoostsPage({ onNavigate }: MyBoostsPageProps) {
  const [activeTab, setActiveTab] = useState('all');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'scheduled':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'paused':
        return <Target className="h-4 w-4 text-gray-500" />;
      default:
        return <Zap className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'scheduled':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'paused':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getBoostLevelColor = (level: string) => {
    switch (level) {
      case 'Premium':
        return 'bg-[var(--sublimes-gold)] text-black';
      case 'Standard':
        return 'bg-blue-500 text-white';
      case 'Basic':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const filteredBoosts = activeTab === 'all' 
    ? boosts 
    : boosts.filter(boost => boost.status === activeTab);

  const boostCounts = {
    all: boosts.length,
    active: boosts.filter(b => b.status === 'active').length,
    completed: boosts.filter(b => b.status === 'completed').length,
    scheduled: boosts.filter(b => b.status === 'scheduled').length
  };

  const totalSpent = boosts.reduce((sum, boost) => sum + boost.spent, 0);
  const totalBudget = boosts.reduce((sum, boost) => sum + boost.budget, 0);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-[var(--sublimes-gold)]" />
                My Boosts
              </h1>
              <p className="text-sm text-muted-foreground">Manage your promoted content and campaigns</p>
            </div>
            <Button className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80">
              Create New Boost
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Boost Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[var(--sublimes-gold)]">{boostCounts.all}</div>
              <div className="text-sm text-muted-foreground">Total Boosts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500">{boostCounts.active}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-500">AED {totalSpent.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Spent</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">
                {boosts.reduce((sum, boost) => sum + (boost.impressions || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Impressions</div>
            </CardContent>
          </Card>
        </div>

        {/* Budget Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Budget Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Total Budget</span>
                <span className="font-bold">AED {totalBudget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Total Spent</span>
                <span className="font-bold text-[var(--sublimes-gold)]">AED {totalSpent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Remaining</span>
                <span className="font-bold text-green-500">AED {(totalBudget - totalSpent).toLocaleString()}</span>
              </div>
              <Progress value={(totalSpent / totalBudget) * 100} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({boostCounts.all})</TabsTrigger>
            <TabsTrigger value="active">Active ({boostCounts.active})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({boostCounts.completed})</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled ({boostCounts.scheduled})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="space-y-4">
              {filteredBoosts.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No boosts found</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first boost to increase visibility and engagement!
                    </p>
                    <Button className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80">
                      Create Your First Boost
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredBoosts.map((boost) => (
                  <Card key={boost.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <ImageWithFallback 
                          src={boost.image} 
                          alt={boost.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{boost.title}</h3>
                                <Badge className={getBoostLevelColor(boost.boostLevel)}>
                                  {boost.boostLevel}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{boost.description}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Target: {boost.targetAudience}</span>
                                <span>Type: {boost.type.charAt(0).toUpperCase() + boost.type.slice(1)}</span>
                              </div>
                            </div>
                            
                            <Badge className={getStatusColor(boost.status)}>
                              {getStatusIcon(boost.status)}
                              <span className="ml-1 capitalize">{boost.status}</span>
                            </Badge>
                          </div>

                          {/* Budget Progress */}
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Budget Used</span>
                              <span>AED {boost.spent} / {boost.budget}</span>
                            </div>
                            <Progress 
                              value={boost.budget > 0 ? (boost.spent / boost.budget) * 100 : 0} 
                              className="h-2" 
                            />
                          </div>

                          {/* Performance Metrics */}
                          {boost.status !== 'scheduled' && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              {boost.impressions && (
                                <div className="text-center">
                                  <div className="text-lg font-bold text-blue-500">{boost.impressions.toLocaleString()}</div>
                                  <div className="text-xs text-muted-foreground">Impressions</div>
                                </div>
                              )}
                              {boost.clicks && (
                                <div className="text-center">
                                  <div className="text-lg font-bold text-green-500">{boost.clicks}</div>
                                  <div className="text-xs text-muted-foreground">Clicks</div>
                                </div>
                              )}
                              {boost.messages && (
                                <div className="text-center">
                                  <div className="text-lg font-bold text-purple-500">{boost.messages}</div>
                                  <div className="text-xs text-muted-foreground">Messages</div>
                                </div>
                              )}
                              {boost.views && (
                                <div className="text-center">
                                  <div className="text-lg font-bold text-orange-500">{boost.views}</div>
                                  <div className="text-xs text-muted-foreground">Views</div>
                                </div>
                              )}
                              {boost.likes && (
                                <div className="text-center">
                                  <div className="text-lg font-bold text-red-500">{boost.likes}</div>
                                  <div className="text-xs text-muted-foreground">Likes</div>
                                </div>
                              )}
                              {boost.newFollowers && (
                                <div className="text-center">
                                  <div className="text-lg font-bold text-[var(--sublimes-gold)]">{boost.newFollowers}</div>
                                  <div className="text-xs text-muted-foreground">New Followers</div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Date Range */}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Start: {new Date(boost.startDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              End: {new Date(boost.endDate).toLocaleDateString()}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            {boost.status === 'active' && (
                              <>
                                <Button variant="outline" size="sm">
                                  Pause Boost
                                </Button>
                                <Button variant="outline" size="sm">
                                  Edit Budget
                                </Button>
                              </>
                            )}
                            {boost.status === 'paused' && (
                              <Button variant="outline" size="sm">
                                Resume Boost
                              </Button>
                            )}
                            {boost.status === 'scheduled' && (
                              <>
                                <Button variant="outline" size="sm">
                                  Edit Campaign
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-500 border-red-500">
                                  Cancel
                                </Button>
                              </>
                            )}
                            {boost.status === 'completed' && (
                              <Button variant="outline" size="sm">
                                Create Similar
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}