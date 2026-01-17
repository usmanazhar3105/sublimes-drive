import React from 'react';
import { useChallenges } from '@/hooks/useChallenges';
import { DailyChallengeCard } from './DailyChallengeCard';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Target } from 'lucide-react';

export function MyChallengesSection({ userId }: { userId: string }) {
  const { myProgress, loading } = useChallenges(userId);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Target className="w-5 h-5" />
        My Challenges
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myProgress.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No active challenges. Start one from the leaderboard!</p>
            </CardContent>
          </Card>
        )}
        {myProgress.map((progress) => (
          <DailyChallengeCard
            key={progress.id}
            challenge={progress.daily_challenges}
            progress={progress}
          />
        ))}
      </div>
    </div>
  );
}

