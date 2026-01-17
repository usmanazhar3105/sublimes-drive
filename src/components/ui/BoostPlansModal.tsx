import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { CheckCircle, Star, TrendingUp, Search, Home, Calendar, Zap } from 'lucide-react';

interface BoostPlan {
  id: string;
  name: string;
  duration: number; // days
  price: number;
  currency: string;
  placement: 'home' | 'category' | 'search' | 'all';
  benefits: string[];
  expectedViews: string;
  popular?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface BoostPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: BoostPlan) => void;
  entityType: 'marketplace' | 'garage' | 'offer';
  isVerified?: boolean;
}

export function BoostPlansModal({ 
  isOpen, 
  onClose, 
  onSelectPlan, 
  entityType, 
  isVerified = false 
}: BoostPlansModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const getPlansForEntity = (type: 'marketplace' | 'garage' | 'offer'): BoostPlan[] => {
    const basePlans = {
      marketplace: [
        {
          id: 'featured-7',
          name: 'Featured Boost',
          duration: 7,
          price: 99,
          currency: 'AED',
          placement: 'home',
          benefits: [
            'Homepage featured placement',
            'Enhanced listing appearance',
            'Priority in search results',
            '3x more views expected'
          ],
          expectedViews: '2-4x increase',
          popular: true,
          icon: Star,
          description: 'Get prime visibility on the homepage'
        },
        {
          id: 'category-top-14',
          name: 'Category Top',
          duration: 14,
          price: 149,
          currency: 'AED',
          placement: 'category',
          benefits: [
            'Top position in your category',
            'Enhanced listing appearance',
            'Featured badge display',
            '2x more views expected'
          ],
          expectedViews: '2-3x increase',
          popular: true,
          icon: TrendingUp,
          description: 'Dominate your specific category with top placement'
        },
        {
          id: 'search-top-30',
          name: 'Search Top',
          duration: 30,
          price: 199,
          currency: 'AED',
          placement: 'search',
          benefits: [
            'Top of relevant search results',
            'Keyword priority ranking',
            'Featured badge display',
            'Extended visibility period'
          ],
          expectedViews: '4-6x increase',
          icon: Search,
          description: 'Appear first in searches related to your listing'
        }
      ],
      garage: [
        {
          id: 'hub-top-7',
          name: 'Hub Top',
          duration: 7,
          price: 149,
          currency: 'AED',
          placement: 'home',
          benefits: [
            'Featured on Garage Hub homepage',
            'Priority in location searches',
            'Verified badge enhancement',
            '3x more inquiries expected'
          ],
          expectedViews: '3-5x increase',
          popular: true,
          icon: Home,
          description: 'Premium placement in the Garage Hub'
        },
        {
          id: 'local-boost-14',
          name: 'Local Boost',
          duration: 14,
          price: 199,
          currency: 'AED',
          placement: 'search',
          benefits: [
            'Top position in location searches',
            'Featured in nearby services',
            'Enhanced contact visibility',
            '4x more calls expected'
          ],
          expectedViews: '4-6x increase',
          icon: TrendingUp,
          description: 'Dominate local area searches for services'
        },
        {
          id: 'premium-30',
          name: 'Premium',
          duration: 30,
          price: 299,
          currency: 'AED',
          placement: 'all',
          benefits: [
            'Multi-placement visibility',
            'Premium garage badge',
            'Featured in recommendations',
            '6x more visibility'
          ],
          expectedViews: '5-8x increase',
          icon: Zap,
          description: 'Maximum exposure across all platforms'
        }
      ],
      offer: [
        {
          id: 'featured-deal-7',
          name: 'Featured Deal',
          duration: 7,
          price: 0, // FREE for admin
          currency: 'AED',
          placement: 'category',
          benefits: [
            'Featured deals section',
            'Category top placement',
            'Promotional styling',
            '3x more conversions'
          ],
          expectedViews: '3-5x increase',
          popular: true,
          icon: Star,
          description: 'Stand out in the featured deals section'
        },
        {
          id: 'mega-deal-14',
          name: 'Mega Deal',
          duration: 14,
          price: 0, // FREE for admin
          currency: 'AED',
          placement: 'all',
          benefits: [
            'Multi-placement visibility',
            'Special mega deal badge',
            'Push notification eligible',
            '5x more visibility'
          ],
          expectedViews: '5-10x increase',
          icon: Zap,
          description: 'Maximum exposure across all platforms'
        }
      ]
    };

    return basePlans[type] || [];
  };

  const plans = getPlansForEntity(entityType);

  if (!isVerified && entityType === 'garage') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Verification Required</DialogTitle>
            <DialogDescription>
              You need to be a verified garage owner to boost your garage profile.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-500/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="font-semibold mb-2">Get Verified First</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Complete the garage verification process to unlock boost features and gain customer trust.
            </p>
            <div className="space-y-2">
              <Button className="w-full bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80">
                Start Verification Process
              </Button>
              <Button variant="outline" onClick={onClose} className="w-full">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {entityType === 'offer' ? '🚀🔥 ADMIN BOOST OFFER - COMPLETELY FREE - NO PAYMENT 🔥🚀' : `Boost Your ${entityType === 'marketplace' ? 'Listing' : 'Garage'}`}
          </DialogTitle>
          <DialogDescription>
            {entityType === 'offer' 
              ? 'Select a boost plan to apply directly as admin. No payment required.'
              : 'Get more visibility and engagement with our boost plans. Choose the plan that best fits your needs.'
            }
          </DialogDescription>
        </DialogHeader>

        {entityType === 'offer' && (
          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-lg mb-6 text-center border-4 border-yellow-400 shadow-2xl">
            <div className="text-3xl font-bold animate-pulse">🎉⚡ ADMIN SPECIAL - ALL BOOSTS ARE 100% FREE ⚡🎉</div>
            <div className="text-lg mt-2 font-semibold">NO PAYMENT • NO CHARGES • INSTANT ACTIVATION</div>
            <div className="text-sm mt-1 bg-white text-black p-2 rounded-md inline-block font-bold">
              🚀 ADMIN BOOST ACTIVATED - COMPLETELY FREE 🚀
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            
            return (
              <Card 
                key={plan.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isSelected 
                    ? 'border-[var(--sublimes-gold)] bg-[var(--sublimes-gold)]/5' 
                    : plan.popular 
                      ? 'border-blue-500/50 bg-blue-500/5'
                      : 'border-border hover:border-[var(--sublimes-gold)]/30'
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        plan.popular ? 'bg-blue-500/10' : 'bg-[var(--sublimes-gold)]/10'
                      }`}>
                        <Icon className={`h-5 w-5 ${
                          plan.popular ? 'text-blue-500' : 'text-[var(--sublimes-gold)]'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground">{plan.duration} days</p>
                      </div>
                    </div>
                    {plan.popular && (
                      <Badge className="bg-blue-500 text-white">Popular</Badge>
                    )}
                  </div>

                  <div className="mb-4">
                    {entityType === 'offer' ? (
                      <div className="text-3xl font-bold text-white bg-gradient-to-r from-green-400 to-blue-500 p-6 rounded-lg border-4 border-yellow-400 text-center animate-pulse shadow-xl">
                        🔥 100% FREE 🔥<br/>
                        <span className="text-xl bg-white text-black p-2 rounded-md inline-block mt-2">
                          ADMIN BOOST - $0.00
                        </span><br/>
                        <span className="text-lg">NO PAYMENT REQUIRED!</span>
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-[var(--sublimes-gold)]">
                        {plan.price} {plan.currency}
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    {plan.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg mb-4">
                    <div className="text-sm font-medium text-green-600 mb-1">Expected Results</div>
                    <div className="text-sm text-muted-foreground">{plan.expectedViews}</div>
                  </div>

                  {isSelected && (
                    <Button 
                      className="w-full bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80"
                      onClick={() => onSelectPlan(plan)}
                    >
                      {entityType === 'offer' ? `🚀 APPLY FREE ${plan.name.toUpperCase()} BOOST 🚀` : `Continue with ${plan.name}`}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-start">
            <TrendingUp className="h-5 w-5 text-[var(--sublimes-gold)] mr-2 mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">
                {entityType === 'offer' ? 'Admin Boost Benefits' : 'Boost Benefits'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {entityType === 'offer' 
                  ? 'Admin boosts are applied instantly with no payment required. Track performance in the Boost Management section.'
                  : 'All boost plans include detailed analytics, priority customer support, and the ability to track your boost performance in real-time.'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {!selectedPlan && (
            <Button disabled>
              {entityType === 'offer' ? 'Select a boost plan to apply' : 'Select a plan to continue'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}