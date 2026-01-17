import { useState } from 'react';
import { Trophy, Target, CheckCircle, Lock, Gift, TrendingUp, Zap, Star, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useDailyChallenges } from '../hooks';
import { toast } from 'sonner';
// import { motion } from 'framer-motion';
// TODO: Install framer-motion

export function DailyChallengesPage() {
  const {
    activeChallenges,
    completedChallenges,
    claimedChallenges,
    claimReward,
    loading,
    error,
  } = useDailyChallenges();

  const [claimingId, setClaimingId] = useState<string | null>(null);

  const handleClaimReward = async (challengeId: string) => {
    setClaimingId(challengeId);
    const { error } = await claimReward(challengeId);
    if (!error) {
      // Confetti effect could be added here
      toast.success('🎉 Reward claimed successfully!');
    }
    setClaimingId(null);
  };

  const getChallengeIcon = (type: string) => {
    const icons = {
      post: Target,
      comment: Trophy,
      like: Star,
      share: TrendingUp,
      listing: Zap,
      garage_visit: Target,
      event_attend: Gift,
    };
    return icons[type as keyof typeof icons] || Target;
  };

  const ChallengeCard = ({ challenge, status }: { challenge: any; status: 'active' | 'completed' | 'claimed' }) => {
    const Icon = getChallengeIcon(challenge.challenge_type);
    const isCompleted = status === 'completed';
    const isClaimed = status === 'claimed';
    const isActive = status === 'active';

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`bg-[#1A1F2E] border-[#2A3441] hover:border-[#D4AF37]/30 transition-all ${
          isCompleted ? 'ring-2 ring-[#D4AF37]/50' : ''
        }`}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`p-3 rounded-lg ${
                  isClaimed ? 'bg-gray-500/10' :
                  isCompleted ? 'bg-[#D4AF37]/10' :
                  'bg-blue-500/10'
                }`}>
                  <Icon className={`h-6 w-6 ${
                    isClaimed ? 'text-gray-500' :
                    isCompleted ? 'text-[#D4AF37]' :
                    'text-blue-500'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-[#E8EAED]">{challenge.title}</CardTitle>
                    {isCompleted && !isClaimed && (
                      <Badge className="bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20">
                        Ready to Claim!
                      </Badge>
                    )}
                    {isClaimed && (
                      <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Claimed
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-[#8A92A6] mt-1">
                    {challenge.description}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#8A92A6]">Progress</span>
                <span className={`${isCompleted ? 'text-[#D4AF37]' : 'text-[#E8EAED]'}`}>
                  {challenge.progress} / {challenge.target_count}
                </span>
              </div>
              <Progress 
                value={challenge.progressPercentage} 
                className="h-2"
              />
              <p className="text-xs text-[#8A92A6]">
                {Math.round(challenge.progressPercentage)}% complete
              </p>
            </div>

            {/* Rewards */}
            <div className="flex items-center gap-4 p-3 bg-[#0B1426] rounded-lg border border-[#2A3441]">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 rounded">
                  <Zap className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-[#8A92A6]">XP Reward</p>
                  <p className="text-[#E8EAED]">+{challenge.xp_reward}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#D4AF37]/10 rounded">
                  <Gift className="h-4 w-4 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-xs text-[#8A92A6]">Coins</p>
                  <p className="text-[#E8EAED]">+{challenge.coin_reward}</p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            {isCompleted && !isClaimed && (
              <Button
                onClick={() => handleClaimReward(challenge.id)}
                disabled={claimingId === challenge.id}
                className="w-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black"
              >
                {claimingId === challenge.id ? (
                  <>
                    <div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                    Claiming...
                  </>
                ) : (
                  <>
                    <Gift className="h-4 w-4 mr-2" />
                    Claim Reward
                  </>
                )}
              </Button>
            )}

            {isClaimed && (
              <div className="flex items-center justify-center gap-2 text-[#8A92A6] text-sm p-3 bg-gray-500/5 rounded">
                <CheckCircle className="h-4 w-4" />
                <span>Reward claimed on {new Date(challenge.claimed_at).toLocaleDateString()}</span>
              </div>
            )}

            {isActive && !isCompleted && (
              <div className="flex items-center justify-center gap-2 text-[#8A92A6] text-sm p-3 border border-[#2A3441] rounded">
                <Clock className="h-4 w-4" />
                <span>Keep going! {challenge.target_count - challenge.progress} more to go</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (loading && activeChallenges.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B1426] p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 border-4 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B1426] p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-[#1A1F2E] border-[#2A3441]">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-red-500">Error loading challenges</p>
                <p className="text-[#8A92A6] text-sm mt-2">{error.message}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1426]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1A1F2E] to-[#0B1426] border-b border-[#2A3441]">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl text-[#E8EAED] flex items-center gap-3">
                <Trophy className="h-8 w-8 text-[#D4AF37]" />
                Daily Challenges
              </h1>
              <p className="text-[#8A92A6] mt-2">
                Complete challenges to earn XP and coins
              </p>
            </div>

            {/* Stats Summary */}
            <div className="flex gap-4">
              <Card className="bg-[#1A1F2E] border-[#2A3441]">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl text-[#D4AF37]">{activeChallenges.length}</p>
                    <p className="text-xs text-[#8A92A6]">Active</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1A1F2E] border-[#2A3441]">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl text-green-500">{completedChallenges.length}</p>
                    <p className="text-xs text-[#8A92A6]">Ready</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1A1F2E] border-[#2A3441]">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl text-gray-500">{claimedChallenges.length}</p>
                    <p className="text-xs text-[#8A92A6]">Claimed</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="bg-[#1A1F2E] border border-[#2A3441] mb-6">
            <TabsTrigger 
              value="active" 
              className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
            >
              Active ({activeChallenges.length})
            </TabsTrigger>
            <TabsTrigger 
              value="completed"
              className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
            >
              Ready to Claim ({completedChallenges.length})
            </TabsTrigger>
            <TabsTrigger 
              value="claimed"
              className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
            >
              Claimed ({claimedChallenges.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeChallenges.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {activeChallenges.map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} status="active" />
                ))}
              </div>
            ) : (
              <Card className="bg-[#1A1F2E] border-[#2A3441]">
                <CardContent className="p-12 text-center">
                  <Lock className="h-12 w-12 text-[#8A92A6] mx-auto mb-4" />
                  <h3 className="text-xl text-[#E8EAED] mb-2">No Active Challenges</h3>
                  <p className="text-[#8A92A6]">
                    All challenges completed! Check back tomorrow for new challenges.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedChallenges.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {completedChallenges.map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} status="completed" />
                ))}
              </div>
            ) : (
              <Card className="bg-[#1A1F2E] border-[#2A3441]">
                <CardContent className="p-12 text-center">
                  <Trophy className="h-12 w-12 text-[#8A92A6] mx-auto mb-4" />
                  <h3 className="text-xl text-[#E8EAED] mb-2">No Rewards to Claim</h3>
                  <p className="text-[#8A92A6]">
                    Complete active challenges to unlock rewards!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="claimed" className="space-y-4">
            {claimedChallenges.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {claimedChallenges.map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} status="claimed" />
                ))}
              </div>
            ) : (
              <Card className="bg-[#1A1F2E] border-[#2A3441]">
                <CardContent className="p-12 text-center">
                  <Gift className="h-12 w-12 text-[#8A92A6] mx-auto mb-4" />
                  <h3 className="text-xl text-[#E8EAED] mb-2">No Claimed Challenges Yet</h3>
                  <p className="text-[#8A92A6]">
                    Complete and claim challenges to see them here!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
