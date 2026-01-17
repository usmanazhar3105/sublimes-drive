import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Trophy, Target, CheckCircle, Clock } from 'lucide-react';
import { useDailyChallenges } from '../hooks/useDailyChallenges';
import { toast } from 'sonner';

export function DailyChallengesWidget() {
  const { challenges, userProgress, loading, startChallenge, claimReward } = useDailyChallenges();

  if (loading) {
    return (
      <Card className="bg-[#0F1829] border-[#1A2332]">
        <CardContent className="p-6">
          <div className="text-center text-[#8B92A7]">Loading challenges...</div>
        </CardContent>
      </Card>
    );
  }

  if (challenges.length === 0) {
    return (
      <Card className="bg-[#0F1829] border-[#1A2332]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#E8EAED]">
            <Trophy className="w-5 h-5 text-[#D4AF37]" />
            Daily Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-[#8B92A7] py-4">
            No challenges available today. Check back tomorrow!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#0F1829] border-[#1A2332]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#E8EAED]">
          <Trophy className="w-5 h-5 text-[#D4AF37]" />
          Daily Challenges
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {challenges.map((challenge) => {
          const progress = userProgress[challenge.id];
          const progressPercent = progress
            ? Math.min(100, (progress.progress / challenge.target_count) * 100)
            : 0;

          return (
            <div
              key={challenge.id}
              className="p-4 bg-[#1A2332] rounded-lg border border-[#2A3441]"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  {challenge.icon ? (
                    <span className="text-2xl">{challenge.icon}</span>
                  ) : (
                    <Target className="w-5 h-5 text-[#D4AF37] mt-1" />
                  )}
                  <div className="flex-1">
                    <h4 className="text-[#E8EAED] font-medium mb-1">{challenge.title}</h4>
                    {challenge.description && (
                      <p className="text-sm text-[#8B92A7]">{challenge.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {challenge.xp_reward > 0 && (
                    <Badge variant="secondary" className="bg-[#D4AF37]/20 text-[#D4AF37]">
                      +{challenge.xp_reward} XP
                    </Badge>
                  )}
                  {challenge.coin_reward && challenge.coin_reward > 0 && (
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                      +{challenge.coin_reward} Coins
                    </Badge>
                  )}
                </div>
              </div>

              {progress ? (
                <>
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-[#8B92A7]">
                        Progress: {progress.progress} / {challenge.target_count}
                      </span>
                      <span className="text-[#8B92A7]">{Math.round(progressPercent)}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>

                  {progress.completed ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Completed!</span>
                      </div>
                      {!progress.claimed ? (
                        <Button
                          size="sm"
                          onClick={() => claimReward(challenge.id)}
                          className="bg-[#D4AF37] text-black hover:bg-[#C19B2E]"
                        >
                          Claim Reward
                        </Button>
                      ) : (
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                          Claimed
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[#8B92A7] text-sm">
                      <Clock className="w-4 h-4" />
                      <span>Keep going! {challenge.target_count - progress.progress} more to complete</span>
                    </div>
                  )}
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() => startChallenge(challenge.id)}
                  className="w-full bg-[#D4AF37] text-black hover:bg-[#C19B2E]"
                >
                  Start Challenge
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}


