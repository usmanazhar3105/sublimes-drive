/**
 * TrendingTopics_Wired - Database-connected Trending Topics
 * Fetches real hashtag usage from community_posts table
 */

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { TrendingUp, Hash, Loader2 } from 'lucide-react';
import { supabase } from '../utils/supabase/client';

interface TrendingTopic {
  tag: string;
  posts: number;
  engagement: number;
}

interface TrendingData {
  today: TrendingTopic[];
  week: TrendingTopic[];
  month: TrendingTopic[];
}

export function TrendingTopics() {
  const [activeTab, setActiveTab] = useState('today');
  const [trendingData, setTrendingData] = useState<TrendingData>({
    today: [],
    week: [],
    month: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingTopics();
  }, []);

  const fetchTrendingTopics = async () => {
    try {
      setLoading(true);

      // Calculate date ranges
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Fetch all posts with hashtags
      const { data: posts, error } = await supabase
        .from('community_posts')
        .select('content, created_at, like_count, comment_count')
        .not('content', 'is', null);

      if (error) {
        console.error('Error fetching trending topics:', error);
        return;
      }

      // Extract hashtags from posts
      const hashtagRegex = /#(\w+)/g;
      const hashtagStats: { [key: string]: { posts: Set<string>, engagement: number } } = {};

      posts?.forEach((post) => {
        const content = post.content || '';
        const matches = content.match(hashtagRegex);
        
        if (matches) {
          const postEngagement = (post.like_count || 0) + (post.comment_count || 0);
          
          matches.forEach((match) => {
            const tag = match.toLowerCase();
            if (!hashtagStats[tag]) {
              hashtagStats[tag] = { posts: new Set(), engagement: 0 };
            }
            hashtagStats[tag].posts.add(post.content + post.created_at);
            hashtagStats[tag].engagement += postEngagement;
          });
        }
      });

      // Filter and sort by time period
      const getTrendingForPeriod = (startDate: Date) => {
        const periodHashtags: { [key: string]: { posts: number, engagement: number } } = {};
        
        posts?.forEach((post) => {
          const postDate = new Date(post.created_at);
          if (postDate >= startDate) {
            const content = post.content || '';
            const matches = content.match(hashtagRegex);
            
            if (matches) {
              const postEngagement = (post.like_count || 0) + (post.comment_count || 0);
              
              matches.forEach((match) => {
                const tag = match.toLowerCase();
                if (!periodHashtags[tag]) {
                  periodHashtags[tag] = { posts: 0, engagement: 0 };
                }
                periodHashtags[tag].posts += 1;
                periodHashtags[tag].engagement += postEngagement;
              });
            }
          }
        });

        // Convert to array and sort by engagement
        return Object.entries(periodHashtags)
          .map(([tag, stats]) => ({
            tag,
            posts: stats.posts,
            engagement: stats.engagement
          }))
          .sort((a, b) => b.engagement - a.engagement)
          .slice(0, 5);
      };

      setTrendingData({
        today: getTrendingForPeriod(todayStart),
        week: getTrendingForPeriod(weekStart),
        month: getTrendingForPeriod(monthStart)
      });

    } catch (err) {
      console.error('Unexpected error fetching trending topics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-card-foreground">
          <TrendingUp className="mr-2 h-5 w-5 text-[var(--sublimes-gold)]" />
          Trending Topics
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="today" className="text-xs">Today</TabsTrigger>
            <TabsTrigger value="week" className="text-xs">Week</TabsTrigger>
            <TabsTrigger value="month" className="text-xs">Month</TabsTrigger>
          </TabsList>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-[var(--sublimes-gold)] animate-spin" />
            </div>
          ) : (
            Object.entries(trendingData).map(([period, topics]) => (
              <TabsContent key={period} value={period} className="mt-0">
                {topics.length > 0 ? (
                  <div className="space-y-3">
                    {topics.map((topic, index) => (
                      <div key={topic.tag} className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-lg cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-muted-foreground w-4">#{index + 1}</span>
                          <div>
                            <div className="flex items-center space-x-1">
                              <Hash className="h-3 w-3 text-[var(--sublimes-gold)]" />
                              <span className="font-medium text-card-foreground">{topic.tag.slice(1)}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {topic.posts} posts • {topic.engagement.toLocaleString()} engagements
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No trends yet!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start a conversation to get a topic trending.
                    </p>
                  </div>
                )}
              </TabsContent>
            ))
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
