import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { TrendingUp, Hash } from 'lucide-react';

export function TrendingTopics() {
  const [activeTab, setActiveTab] = useState('today');

  const trendingData = {
    today: [
      { tag: '#LamborghiniUAE', posts: 24, engagement: 1200 },
      { tag: '#DubaiCars', posts: 18, engagement: 890 },
      { tag: '#SupercarMeetup', posts: 15, engagement: 650 },
      { tag: '#CarPhotography', posts: 12, engagement: 420 },
      { tag: '#ModifiedCars', posts: 8, engagement: 280 }
    ],
    week: [
      { tag: '#FerrariClub', posts: 156, engagement: 8900 },
      { tag: '#AbuDhabiCars', posts: 134, engagement: 7200 },
      { tag: '#CarReview', posts: 98, engagement: 5400 },
      { tag: '#LuxuryCars', posts: 87, engagement: 4800 },
      { tag: '#DriftingUAE', posts: 76, engagement: 3600 }
    ],
    month: [
      { tag: '#CarShow2024', posts: 892, engagement: 45000 },
      { tag: '#UAEMotors', posts: 567, engagement: 32000 },
      { tag: '#CarCommunity', posts: 445, engagement: 28000 },
      { tag: '#SupercarSunday', posts: 334, engagement: 19000 },
      { tag: '#CarDeals', posts: 298, engagement: 16000 }
    ]
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
          
          {Object.entries(trendingData).map(([period, topics]) => (
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
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}