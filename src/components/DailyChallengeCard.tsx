import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Trophy, CheckCircle, Lock, Play } from 'lucide-react';
import { useDailyChallenges } from '../hooks/useDailyChallenges';

interface DailyChallengeCardProps {
  compact?: boolean;
  showAll?: boolean;
  limit?: number;
}

export function DailyChallengeCard({ compact = false, showAll = false, limit = 3 }: DailyChallengeCardProps) {
  const { challenges, userProgress, startChallenge, claimReward, loading } = useDailyChallenges();

  const displayChallenges = showAll ? challenges : challenges.slice(0, limit);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getProgressForChallenge = (challengeId: string) => {
    return userProgress.find(p => p.challenge_id === challengeId);
  };

  if (loading) {
    return (
      <Card className={compact ? 'p-4' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Daily Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading challenges...</div>
        </CardContent>
      </Card>
    );
  }

  if (challenges.length === 0) {
    return (
      <Card className={compact ? 'p-4' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Daily Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">No challenges available today</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={compact ? 'p-4' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Daily Challenges
          <Badge variant="secondary" className="ml-auto">
            {userProgress.filter(p => p.status === 'completed' || p.status === 'claimed').length}/{challenges.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayChallenges.map((challenge) => {
          const progress = getProgressForChallenge(challenge.id);
          const isStarted = !!progress;
          const isCompleted = progress?.status === 'completed' || progress?.status === 'claimed';
          const isClaimed = progress?.status === 'claimed';
          const currentCount = progress?.current_count || 0;
          const targetCount = challenge.target_count;
          const progressPercent = isStarted ? Math.min((currentCount / targetCount) * 100, 100) : 0;

          return (
            <div key={challenge.id} className="border rounded-lg p-3 hover:border-primary transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{challenge.icon || '🎯'}</span>
                    <h4 className="font-semibold">{challenge.title}</h4>
                    <Badge className={getDifficultyColor(challenge.difficulty || 'easy')}>
                      {challenge.difficulty || 'easy'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{challenge.description}</p>
                </div>
              </div>

              {isStarted && (
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress: {currentCount}/{targetCount}</span>
                    <span>{progressPercent.toFixed(0)}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium text-yellow-500">{challenge.xp_reward} XP</span>
                </div>

                {!isStarted && (
                  <Button size="sm" onClick={() => startChallenge(challenge.id)} variant="outline">
                    <Play className="w-3 h-3 mr-1" />
                    Start
                  </Button>
                )}

                {isStarted && !isCompleted && (
                  <Badge variant="secondary">
                    <Lock className="w-3 h-3 mr-1" />
                    In Progress
                  </Badge>
                )}

                {isCompleted && !isClaimed && (
                  <Button size="sm" onClick={() => progress && claimReward(progress.id)} className="bg-yellow-500 hover:bg-yellow-600">
                    <Trophy className="w-3 h-3 mr-1" />
                    Claim {challenge.xp_reward} XP
                  </Button>
                )}

                {isClaimed && (
                  <Badge className="bg-green-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Claimed
                  </Badge>
                )}
              </div>
            </div>
          );
        })}

        {!showAll && challenges.length > limit && (
          <Button variant="ghost" className="w-full">
            View All {challenges.length} Challenges →
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

