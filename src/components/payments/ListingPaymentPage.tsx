import { useState, useEffect } from 'react';
import { ArrowLeft, Check, Crown, Zap, Eye, Users, Calendar, Star, CreditCard, Shield } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Checkbox } from '../ui/checkbox';

interface ListingPaymentPageProps {
  onNavigate?: (page: string, data?: any) => void;
  listingData?: any;
  listingType?: 'marketplace' | 'garage';
  paymentType?: 'listing' | 'boost';
  boostData?: any;
}

interface BoostPackage {
  id: string;
  name: string;
  duration: number;
  price: number;
  originalPrice?: number;
  savings?: number;
  features: string[];
  badge?: string;
  badgeColor?: string;
  popular?: boolean;
}

const boostPackages: BoostPackage[] = [
  {
    id: 'boost-7',
    name: '7-Day Boost',
    duration: 7,
    price: 49,
    originalPrice: 70,
    savings: 21,
    features: [
      'Top search results for 7 days',
      'Featured badge on listing',
      'Push notifications to followers',
      '3x more visibility',
      'Priority customer support'
    ],
    badge: 'STARTER',
    badgeColor: 'bg-blue-500'
  },
  {
    id: 'boost-14',
    name: '14-Day Boost',
    duration: 14,
    price: 89,
    originalPrice: 140,
    savings: 51,
    features: [
      'Top search results for 14 days', 
      'Featured badge on listing',
      'Push notifications to followers',
      '5x more visibility',
      'Priority customer support',
      'Social media promotion',
      'Weekly performance report'
    ],
    badge: 'POPULAR',
    badgeColor: 'bg-[var(--sublimes-gold)]',
    popular: true
  },
  {
    id: 'boost-30',
    name: '30-Day Boost',
    duration: 30,
    price: 149,
    originalPrice: 280,
    savings: 131,
    features: [
      'Top search results for 30 days',
      'Featured badge on listing',
      'Push notifications to followers', 
      '10x more visibility',
      'Priority customer support',
      'Social media promotion',
      'Weekly performance reports',
      'Dedicated account manager',
      'Premium listing design'
    ],
    badge: 'PREMIUM',
    badgeColor: 'bg-purple-600'
  }
];

const addOnServices = [
  {
    id: 'professional-photos',
    name: 'Professional Photography',
    price: 99,
    description: 'Professional photographer will visit and take high-quality photos',
    icon: '📸'
  },
  {
    id: 'listing-optimization',
    name: 'Listing Optimization',
    price: 29,
    description: 'SEO-optimized title and description to attract more buyers',
    icon: '🎯'
  },
  {
    id: 'urgent-approval',
    name: 'Urgent Approval',
    price: 19,
    description: 'Get your listing approved within 2 hours instead of 24 hours',
    icon: '⚡'
  }
];

export function ListingPaymentPage({ onNavigate, listingData, listingType = 'marketplace', paymentType = 'listing', boostData }: ListingPaymentPageProps) {
  const [selectedBoost, setSelectedBoost] = useState<string>('boost-14'); // Default to popular
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [feeData, setFeeData] = useState<{ base_fee: number; vat: number; total: number } | null>(null);
  const [loadingFee, setLoadingFee] = useState(true);

  // 🔥 FEE CALCULATION: Use fn_calculate_fee RPC function
  useEffect(() => {
    const calculateFee = async () => {
      try {
        const { supabase } = await import('../../utils/supabase/client');
        const feeKind = listingType === 'marketplace' ? 'car' : 'garage';
        const { data, error } = await supabase.rpc('fn_calculate_fee', {
          p_kind: feeKind,
          p_amount: null
        });
        
        if (error) throw error;
        if (data) {
          setFeeData({
            base_fee: data.base_fee || 0,
            vat: data.vat || 0,
            total: data.total || 0
          });
        }
      } catch (err) {
        console.error('Error calculating fee:', err);
        // Fallback to hardcoded values if RPC fails
        const fallbackBase = listingType === 'marketplace' ? 50 : 100;
        setFeeData({
          base_fee: fallbackBase,
          vat: fallbackBase * 0.05,
          total: fallbackBase * 1.05
        });
      } finally {
        setLoadingFee(false);
      }
    };
    
    calculateFee();
  }, [listingType]);

  const baseFee = feeData?.base_fee || (listingType === 'marketplace' ? 50 : 100);
  const selectedPackage = boostPackages.find(pkg => pkg.id === selectedBoost);
  const selectedAddOnItems = addOnServices.filter(addon => selectedAddOns.includes(addon.id));
  
  const subtotal = baseFee + (selectedPackage?.price || 0) + selectedAddOnItems.reduce((sum, addon) => sum + addon.price, 0);
  const vat = feeData ? feeData.vat + ((selectedPackage?.price || 0) + selectedAddOnItems.reduce((sum, addon) => sum + addon.price, 0)) * 0.05 : subtotal * 0.05; // 5% VAT in UAE
  const total = subtotal + vat;

  const handleAddOnToggle = (addonId: string) => {
    setSelectedAddOns(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const handlePayAndSubmit = () => {
    const paymentData = {
      listingData,
      listingType,
      selectedBoost,
      selectedAddOns,
      pricing: {
        baseFee,
        boostFee: selectedPackage?.price || 0,
        addOnsFee: selectedAddOnItems.reduce((sum, addon) => sum + addon.price, 0),
        subtotal,
        vat,
        total
      }
    };
    
    onNavigate?.('stripe-payment', paymentData);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onNavigate?.('place-ad')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Choose Your Boost Package</h1>
              <p className="text-muted-foreground">Maximize your listing's visibility and reach</p>
            </div>
          </div>
          <Badge className="bg-green-500/10 text-green-500">
            Step 2 of 3
          </Badge>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-8">
        {/* Boost Packages */}
        <div>
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <Zap className="mr-2 h-5 w-5 text-[var(--sublimes-gold)]" />
            Boost Packages
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {boostPackages.map((pkg) => (
              <Card 
                key={pkg.id}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedBoost === pkg.id 
                    ? 'ring-2 ring-[var(--sublimes-gold)] bg-[var(--sublimes-gold)]/5' 
                    : 'hover:shadow-lg hover:scale-105'
                } ${pkg.popular ? 'relative' : ''}`}
                onClick={() => setSelectedBoost(pkg.id)}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] px-3">
                      MOST POPULAR
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Badge className={`${pkg.badgeColor} text-white px-2 py-1 text-xs`}>
                      {pkg.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-3xl font-bold text-[var(--sublimes-gold)]">
                        AED {pkg.price}
                      </span>
                      {pkg.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          AED {pkg.originalPrice}
                        </span>
                      )}
                    </div>
                    {pkg.savings && (
                      <p className="text-sm text-green-500 font-medium">
                        Save AED {pkg.savings}!
                      </p>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {pkg.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {selectedBoost === pkg.id && (
                    <div className="mt-4 p-3 bg-[var(--sublimes-gold)]/10 rounded-lg border border-[var(--sublimes-gold)]/20">
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-[var(--sublimes-gold)]" />
                        <span className="text-sm font-medium text-[var(--sublimes-gold)]">
                          Selected Package
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Add-on Services */}
        <div>
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <Star className="mr-2 h-5 w-5 text-[var(--sublimes-gold)]" />
            Add-on Services
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {addOnServices.map((addon) => (
              <Card 
                key={addon.id}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedAddOns.includes(addon.id) 
                    ? 'ring-2 ring-[var(--sublimes-gold)] bg-[var(--sublimes-gold)]/5' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleAddOnToggle(addon.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      checked={selectedAddOns.includes(addon.id)}
                      onChange={() => handleAddOnToggle(addon.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">{addon.icon}</span>
                        <div>
                          <h3 className="font-semibold">{addon.name}</h3>
                          <p className="text-[var(--sublimes-gold)] font-bold">
                            AED {addon.price}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {addon.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Base Listing Fee</span>
                <span>AED {baseFee}</span>
              </div>
              
              {selectedPackage && (
                <div className="flex justify-between">
                  <span>{selectedPackage.name}</span>
                  <span>AED {selectedPackage.price}</span>
                </div>
              )}
              
              {selectedAddOnItems.map(addon => (
                <div key={addon.id} className="flex justify-between">
                  <span>{addon.name}</span>
                  <span>AED {addon.price}</span>
                </div>
              ))}
              
              <Separator />
              
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>AED {subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>VAT (5%)</span>
                <span>AED {vat.toFixed(2)}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-[var(--sublimes-gold)]">AED {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="pt-4 border-t border-border">
              <h3 className="font-semibold mb-3">Payment Method</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="card" 
                    name="payment"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                  />
                  <label htmlFor="card" className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Credit/Debit Card</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-blue-500">
                  Your payment is secured by Stripe SSL encryption
                </span>
              </div>
            </div>

            {/* Pay Button */}
            <Button 
              onClick={handlePayAndSubmit}
              className="w-full bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/90 py-3 text-lg font-semibold"
            >
              Pay AED {total.toFixed(2)} & Submit for Approval
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Your listing will be submitted for admin approval after successful payment
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}