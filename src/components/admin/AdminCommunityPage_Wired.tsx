/**
 * AdminCommunityPage_Wired - Community Management
 * Uses: useCommunities, useAnalytics
 */

import { useEffect } from 'react';
import { MessageSquare, Users, TrendingUp, Flag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useCommunities, useAnalytics } from '../../src/hooks';

export function AdminCommunityPage_Wired() {
  const { communities, loading } = useCommunities();
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView('/admin/community');
  }, []);

  const stats = {
    totalPosts: communities.reduce((sum, c) => sum + (c.posts_count || 0), 0),
    totalMembers: communities.reduce((sum, c) => sum + (c.members_count || 0), 0),
    activeCommunities: communities.filter(c => c.is_active).length,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl text-[#E8EAED]" style={{ fontWeight: 600 }}>Community Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: MessageSquare, label: 'Total Posts', value: stats.totalPosts, color: 'text-blue-500' },
          { icon: Users, label: 'Total Members', value: stats.totalMembers, color: 'text-green-500' },
          { icon: TrendingUp, label: 'Active Communities', value: stats.activeCommunities, color: 'text-[#D4AF37]' },
          { icon: Flag, label: 'Reported', value: 12, color: 'text-red-500' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="bg-[#0F1829] border-[#1A2332]">
              <CardContent className="p-4">
                <Icon className={`${stat.color} mb-2`} size={24} />
                <p className="text-sm text-[#8B92A7] mb-1">{stat.label}</p>
                <p className="text-2xl text-[#E8EAED]" style={{ fontWeight: 600 }}>{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-[#0F1829] border-[#1A2332]">
        <CardHeader>
          <CardTitle className="text-xl text-[#E8EAED]">Communities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {communities.slice(0, 10).map((community) => (
              <div key={community.id} className="flex items-center justify-between p-4 bg-[#0B1426] rounded-lg">
                <div>
                  <p className="text-[#E8EAED]" style={{ fontWeight: 600 }}>{community.name}</p>
                  <p className="text-sm text-[#8B92A7]">{community.members_count} members • {community.posts_count} posts</p>
                </div>
                <Button size="sm" variant="outline">Manage</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
