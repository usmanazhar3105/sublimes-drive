import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { CreditCard, Wallet } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { toast } from 'sonner';

interface WalletTopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletTopUpModal({ isOpen, onClose }: WalletTopUpModalProps) {
  const [amount, setAmount] = useState<string>('100');
  const { topUpWallet, loading } = useWallet();

  const presetAmounts = [50, 100, 200, 500, 1000];

  const handleTopUp = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (numAmount < 10) {
      toast.error('Minimum top-up amount is AED 10');
      return;
    }

    const { error } = await topUpWallet(numAmount);
    if (!error) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0F1829] border-[#1A2332] text-[#E8EAED]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#D4AF37]" />
            Top Up Wallet
          </DialogTitle>
          <DialogDescription className="text-[#8B92A7]">
            Add funds to your wallet for bid repairs
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preset Amounts */}
          <div>
            <Label className="text-[#E8EAED] mb-2 block">Quick Select</Label>
            <div className="grid grid-cols-5 gap-2">
              {presetAmounts.map((preset) => (
                <Button
                  key={preset}
                  variant={amount === preset.toString() ? 'default' : 'outline'}
                  className={amount === preset.toString() 
                    ? 'bg-[#D4AF37] text-black hover:bg-[#C19B2E]' 
                    : 'border-[#2A3441] text-[#E8EAED] hover:bg-[#1A2332]'
                  }
                  onClick={() => setAmount(preset.toString())}
                >
                  AED {preset}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <Label htmlFor="amount" className="text-[#E8EAED]">
              Custom Amount (AED)
            </Label>
            <Input
              id="amount"
              type="number"
              min="10"
              step="10"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-[#1A2332] border-[#2A3441] text-[#E8EAED] mt-2"
              placeholder="Enter amount"
            />
            <p className="text-xs text-[#8B92A7] mt-1">Minimum: AED 10</p>
          </div>

          {/* Payment Method */}
          <div>
            <Label className="text-[#E8EAED] mb-2 block">Payment Method</Label>
            <div className="flex items-center gap-2 p-3 bg-[#1A2332] rounded-lg border border-[#2A3441]">
              <CreditCard className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-[#E8EAED]">Stripe (Secure Payment)</span>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between p-4 bg-[#1A2332] rounded-lg border border-[#2A3441]">
            <span className="text-[#E8EAED] font-medium">Total</span>
            <span className="text-2xl font-bold text-[#D4AF37]">
              AED {parseFloat(amount || '0').toFixed(2)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-[#2A3441] text-[#E8EAED] hover:bg-[#1A2332]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleTopUp}
              disabled={loading || !amount || parseFloat(amount) < 10}
              className="flex-1 bg-[#D4AF37] text-black hover:bg-[#C19B2E] disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


