import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Users, Gift, Copy, CheckCircle } from 'lucide-react';
import { useReferral } from '../hooks/useReferral';
import { useState } from 'react';
import { toast } from 'sonner';
import { copyToClipboard } from '../utils/clipboard';

export function ReferralWidget() {
  const { referralCode, stats, loading, applyReferralCode } = useReferral();
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    if (!referralCode) return;
    const success = await copyToClipboard(referralCode);
    if (success) {
      setCopied(true);
      toast.success('Referral code copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApplyCode = async () => {
    if (!inputCode.trim()) {
      toast.error('Please enter a referral code');
      return;
    }
    await applyReferralCode(inputCode.trim());
    setInputCode('');
  };

  if (loading) {
    return (
      <Card className="bg-[#0F1829] border-[#1A2332]">
        <CardContent className="p-6">
          <div className="text-center text-[#8B92A7]">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#0F1829] border-[#1A2332]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#E8EAED]">
          <Gift className="w-5 h-5 text-[#D4AF37]" />
          Referral Program
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Your Referral Code */}
        {referralCode && (
          <div className="p-4 bg-[#1A2332] rounded-lg border border-[#2A3441]">
            <Label className="text-[#8B92A7] text-sm mb-2 block">Your Referral Code</Label>
            <div className="flex items-center gap-2">
              <Input
                value={referralCode}
                readOnly
                className="bg-[#0B1426] border-[#2A3441] text-[#E8EAED] font-mono"
              />
              <Button
                size="icon"
                onClick={handleCopyCode}
                className="bg-[#D4AF37] text-black hover:bg-[#C19B2E]"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-[#8B92A7] mt-2">
              Share this code with friends. You both earn +5 XP when they sign up!
            </p>
          </div>
        )}

        {/* Apply Referral Code */}
        <div className="p-4 bg-[#1A2332] rounded-lg border border-[#2A3441]">
          <Label className="text-[#8B92A7] text-sm mb-2 block">Have a Referral Code?</Label>
          <div className="flex items-center gap-2">
            <Input
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              className="bg-[#0B1426] border-[#2A3441] text-[#E8EAED]"
            />
            <Button
              onClick={handleApplyCode}
              className="bg-[#D4AF37] text-black hover:bg-[#C19B2E]"
            >
              Apply
            </Button>
          </div>
        </div>

        {/* Stats */}
        {stats.totalReferrals > 0 && (
          <div className="p-4 bg-[#1A2332] rounded-lg border border-[#2A3441]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-[#8B92A7]">
                <Users className="w-4 h-4" />
                <span className="text-sm">Total Referrals</span>
              </div>
              <Badge variant="secondary" className="bg-[#D4AF37]/20 text-[#D4AF37]">
                {stats.totalReferrals}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#8B92A7]">Total Points Earned</span>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                +{stats.totalPoints} XP
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

