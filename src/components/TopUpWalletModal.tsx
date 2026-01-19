import { useState } from 'react';
import { X, CreditCard, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { useWallet } from '../hooks/useWallet';
import { supabase } from '../utils/supabase/client';

interface TopUpWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string, data?: any) => void;
}

const PRESET_AMOUNTS = [
  { value: 20, label: 'AED 20', credits: 20 },
  { value: 50, label: 'AED 50', credits: 50 },
  { value: 75, label: 'AED 75', credits: 75 },
  { value: 100, label: 'AED 100', credits: 100 }
];

export function TopUpWalletModal({ isOpen, onClose, onNavigate }: TopUpWalletModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { topUpWallet } = useWallet();

  const handlePresetSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    setCustomAmount(numericValue);
    setSelectedAmount(numericValue ? parseInt(numericValue) : null);
  };

  const getFinalAmount = () => {
    if (customAmount) {
      return parseInt(customAmount);
    }
    return selectedAmount;
  };

  const handlePay = async () => {
    const amount = getFinalAmount();
    
    if (!amount || amount < 1) {
      toast.error('Please select or enter a valid amount');
      return;
    }

    if (amount < 10) {
      toast.error('Minimum top-up amount is AED 10');
      return;
    }

    if (amount > 10000) {
      toast.error('Maximum top-up amount is AED 10,000');
      return;
    }

    setIsProcessing(true);

    try {
      // Call the wallet top-up function which creates Stripe checkout session
      const { error } = await topUpWallet(amount, 'stripe');
      
      if (error) {
        console.error('Payment error:', error);
        toast.error(error || 'Payment failed. Please try again.');
        setIsProcessing(false);
        return;
      }
      
      // If successful, topUpWallet will redirect to Stripe checkout
      // So we don't need to navigate or close the modal here
      // The redirect happens automatically
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error?.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setSelectedAmount(null);
    setCustomAmount('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-[var(--sublimes-light-text)]">Top Up Wallet</DialogTitle>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-[var(--sublimes-light-text)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-400 text-sm">
            Add credits to your wallet to place bids on repair requests.
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Manual Amount Input */}
          <div>
            <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
              Enter Custom Amount (AED)
            </label>
            <Input
              type="text"
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              placeholder="Enter amount in AED"
              className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
            />
          </div>

          {/* Preset Amounts */}
          <div>
            <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-3">
              Or Select Amount
            </label>
            <div className="grid grid-cols-2 gap-3">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetSelect(preset.value)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedAmount === preset.value && !customAmount
                      ? 'border-[var(--sublimes-gold)] bg-[var(--sublimes-gold)]/10'
                      : 'border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)] hover:border-[var(--sublimes-gold)]/50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-[var(--sublimes-gold)] mb-1">
                      {preset.label}
                    </div>
                    <div className="text-sm text-gray-400">
                      {preset.credits} Credits
                    </div>
                  </div>
                  {selectedAmount === preset.value && !customAmount && (
                    <div className="absolute top-2 right-2">
                      <div className="w-5 h-5 bg-[var(--sublimes-gold)] rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-[var(--sublimes-dark-bg)]" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Summary */}
          {getFinalAmount() && (
            <div className="bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Amount to pay:</span>
                <span className="text-xl font-bold text-[var(--sublimes-gold)]">
                  AED {getFinalAmount()}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-400">Credits to receive:</span>
                <span className="text-[var(--sublimes-light-text)] font-medium">
                  {getFinalAmount()} Credits
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1 border-[var(--sublimes-border)]"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePay}
              disabled={!getFinalAmount() || isProcessing}
              className="flex-1 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/90"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Pay'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}