/**
 * AdminAnalyticsPage_Wired - Platform Analytics Dashboard
 * Uses: useAnalytics, useListings, useProfile
 */

import { useEffect } from 'react';
import { TrendingUp, Users, Eye, DollarSign, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useAnalytics, useListings, useProfile } from '../../src/hooks';

export function AdminAnalyticsPage_Wired() {
  const analytics = useAnalytics();
  const { listings } = useListings();

  useEffect(() => {
    analytics.trackPageView('/admin/analytics');
  }, []);

  const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);
  const avgViews = listings.length > 0 ? Math.round(totalViews / listings.length) : 0;

  const metrics = [
    {
      title: 'Total Page Views',
      value: '124.5K',
      change: '+12.5%',
      icon: Eye,
      color: 'text-blue-500',
    },
    {
      title: 'Active Users',
      value: '1,834',
      change: '+8.2%',
      icon: Users,
      color: 'text-green-500',
    },
    {
      title: 'Conversion Rate',
      value: '3.2%',
      change: '+0.8%',
      icon: TrendingUp,
      color: 'text-[#D4AF37]',
    },
    {
      title: 'Revenue',
      value: 'AED 45.2K',
      change: '+18.3%',
      icon: DollarSign,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl text-[#E8EAED]" style={{ fontWeight: 600 }}>
        Analytics Dashboard
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <Card key={idx} className="bg-[#0F1829] border-[#1A2332]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Icon className={metric.color} size={24} />
                  <span className="text-sm text-green-500">{metric.change}</span>
                </div>
                <p className="text-sm text-[#8B92A7] mb-1">{metric.title}</p>
                <p className="text-2xl text-[#E8EAED]" style={{ fontWeight: 600 }}>
                  {metric.value}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardHeader>
            <CardTitle className="text-lg text-[#E8EAED]">Traffic Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-[#8B92A7]">
              Chart would go here
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardHeader>
            <CardTitle className="text-lg text-[#E8EAED]">Top Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {listings.slice(0, 5).map((listing, idx) => (
                <div key={listing.id} className="flex items-center justify-between p-3 bg-[#0B1426] rounded-lg">
                  <div>
                    <p className="text-sm text-[#E8EAED]">{listing.title}</p>
                    <p className="text-xs text-[#8B92A7]">{listing.views || 0} views</p>
                  </div>
                  <Activity className="text-[#D4AF37]" size={16} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
