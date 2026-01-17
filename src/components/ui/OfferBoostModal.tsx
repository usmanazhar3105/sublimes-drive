import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './dialog';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Badge } from './badge';
import { Zap, Crown, Star, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface BoostPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // days
  features: string[];
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  popular?: boolean;
}

interface OfferBoostModalProps {
  isOpen: boolean;
  onClose: () => void;
  offerTitle: string;
  onBoostConfirm: (packageId: string, priorityLevel: string) => void;
}

const BOOST_PACKAGES: BoostPackage[] = [
  {
    id: 'premium',
    name: 'Premium Boost',
    description: 'Top placement for 7 days',
    price: 0,
    duration: 7,
    features: [
      'Top placement in offers section',
      'Featured badge',
      'Priority in search results',
      'Email notifications to subscribers'
    ],
    icon: Crown,
    color: 'text-yellow-400',
    popular: true
  },
  {
    id: 'featured',
    name: 'Featured Boost',
    description: 'Featured section for 14 days',
    price: 0,
    duration: 14,
    features: [
      'Featured section placement',
      'Enhanced visibility',
      'Category priority',
      'Mobile app prominence'
    ],
    icon: Star,
    color: 'text-blue-400'
  },
  {
    id: 'extended',
    name: 'Extended Boost',
    description: 'Premium + Featured for 30 days',
    price: 0,
    duration: 30,
    features: [
      'Premium + Featured benefits',
      'Extended 30-day visibility',
      'Maximum exposure',
      'Priority customer support'
    ],
    icon: Zap,
    color: 'text-purple-400'
  }
];

const PRIORITY_LEVELS = [
  { value: 'high', label: 'High Priority (1)', description: 'Maximum visibility' },
  { value: 'medium', label: 'Medium Priority (2)', description: 'Good visibility' },
  { value: 'low', label: 'Low Priority (3)', description: 'Standard visibility' }
];

export function OfferBoostModal({ isOpen, onClose, offerTitle, onBoostConfirm }: OfferBoostModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [priorityLevel, setPriorityLevel] = useState<string>('high');

  const selectedBoostPackage = BOOST_PACKAGES.find(pkg => pkg.id === selectedPackage);

  const handleBoostOffer = () => {
    if (!selectedPackage) {
      toast.error('Please select a boost package');
      return;
    }

    onBoostConfirm(selectedPackage, priorityLevel);
    onClose();
    setSelectedPackage('');
    setPriorityLevel('high');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[var(--sublimes-gold)] flex items-center gap-2">
            <Zap className="w-5 h-5" />
            🚀 ADMIN BOOST OFFER - NO PAYMENT: {offerTitle}
          </DialogTitle>
          <p className="text-gray-400 mt-2">
            Choose boost settings for this offer - Admin boost is FREE
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Boost Type Selection */}
          <div>
            <h3 className="text-lg font-medium text-[var(--sublimes-light-text)] mb-4">Boost Type</h3>
            <div className="grid grid-cols-1 gap-4">
              {BOOST_PACKAGES.map((pkg) => {
                const Icon = pkg.icon;
                const isSelected = selectedPackage === pkg.id;
                
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[var(--sublimes-gold)] bg-[var(--sublimes-gold)]/10'
                        : 'border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)] hover:border-[var(--sublimes-gold)]/50'
                    }`}
                  >
                    {pkg.popular && (
                      <Badge className="absolute -top-2 left-4 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]">
                        Popular
                      </Badge>
                    )}
                    
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-[var(--sublimes-card-bg)]`}>
                          <Icon className={`w-6 h-6 ${pkg.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-[var(--sublimes-light-text)]">{pkg.name}</h4>
                            <span className="text-lg font-bold text-green-500 bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
                              🔥 FREE ADMIN BOOST 🔥
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mb-3">{pkg.description}</p>
                          <div className="space-y-1">
                            {pkg.features.map((feature, index) => (
                              <div key={index} className="flex items-center text-sm text-gray-300">
                                <div className="w-1.5 h-1.5 bg-[var(--sublimes-gold)] rounded-full mr-2"></div>
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-[var(--sublimes-border)] flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-400">
                        <Clock className="w-4 h-4 mr-1" />
                        {pkg.duration} days duration
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 bg-[var(--sublimes-gold)] rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-[var(--sublimes-dark-bg)] rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority Level */}
          <div>
            <h3 className="text-lg font-medium text-[var(--sublimes-light-text)] mb-4">Priority Level</h3>
            <Select value={priorityLevel} onValueChange={setPriorityLevel}>
              <SelectTrigger className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]">
                <SelectValue placeholder="Select priority level" />
              </SelectTrigger>
              <SelectContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
                {PRIORITY_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div>
                      <div className="font-medium">{level.label}</div>
                      <div className="text-sm text-gray-400">{level.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Boost Preview */}
          {selectedBoostPackage && (
            <div className="p-4 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg">
              <h4 className="font-medium text-[var(--sublimes-gold)] mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Boost Preview
              </h4>
              <p className="text-sm text-gray-300 mb-2">
                This offer will be boosted and appear in the Boost Management section under "Offers" tab.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Package:</span>
                  <span className="ml-2 text-[var(--sublimes-light-text)]">{selectedBoostPackage.name}</span>
                </div>
                <div>
                  <span className="text-gray-400">Duration:</span>
                  <span className="ml-2 text-[var(--sublimes-light-text)]">{selectedBoostPackage.duration} days</span>
                </div>
                <div>
                  <span className="text-gray-400">Price:</span>
                  <span className="ml-2 text-green-500 font-bold">FREE ADMIN BOOST</span>
                </div>
                <div>
                  <span className="text-gray-400">Priority:</span>
                  <span className="ml-2 text-[var(--sublimes-light-text)]">
                    {PRIORITY_LEVELS.find(p => p.value === priorityLevel)?.label}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleBoostOffer}
            disabled={!selectedPackage}
            className="flex-1 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/90"
          >
            <Zap className="w-4 h-4 mr-2" />
            🚀 APPLY FREE BOOST 🚀
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}