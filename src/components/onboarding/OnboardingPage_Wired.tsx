/**
 * OnboardingPage_Wired - Database-connected Onboarding Experience
 * Uses: useProfile, useAnalytics
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { CheckCircle, ArrowRight, Users, ShoppingBag, Wrench, Calendar, Trophy } from 'lucide-react';
import { useProfile, useAnalytics } from '../../src/hooks';

interface OnboardingPageProps {
  onNavigate: (page: string) => void;
}

export function OnboardingPage({ onNavigate }: OnboardingPageProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { updateProfile } = useProfile();
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView('/onboarding');
    analytics.trackEvent('onboarding_started');
  }, []);

  const steps = [
    {
      title: "Welcome to Sublimes Drive!",
      description: "Your ultimate platform for Chinese car enthusiasts in UAE",
      icon: CheckCircle,
      color: "text-[#D4AF37]",
      bgColor: "bg-[#D4AF37]/20"
    },
    {
      title: "Connect with Communities",
      description: "Join discussions and build connections",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/20"
    },
    {
      title: "Explore Marketplace",
      description: "Buy and sell cars, parts, and accessories",
      icon: ShoppingBag,
      color: "text-green-500",
      bgColor: "bg-green-500/20"
    },
    {
      title: "Find Trusted Garages",
      description: "Connect with verified service providers",
      icon: Wrench,
      color: "text-purple-500",
      bgColor: "bg-purple-500/20"
    },
    {
      title: "Attend Events",
      description: "Join car meets, track days, and more",
      icon: Calendar,
      color: "text-orange-500",
      bgColor: "bg-orange-500/20"
    },
    {
      title: "Earn Rewards",
      description: "Gain XP points and unlock achievements",
      icon: Trophy,
      color: "text-[#D4AF37]",
      bgColor: "bg-[#D4AF37]/20"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      analytics.trackEvent('onboarding_step_completed', { step: currentStep + 1 });
    }
  };

  const handleSkip = async () => {
    analytics.trackEvent('onboarding_skipped', { step: currentStep + 1 });
    await updateProfile({ onboarding_completed: true });
    onNavigate('home');
  };

  const handleFinish = async () => {
    analytics.trackEvent('onboarding_completed');
    await updateProfile({ onboarding_completed: true });
    onNavigate('home');
  };

  const step = steps[currentStep];
  const Icon = step.icon;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-[#0B1426] flex items-center justify-center p-4">
      <Card className="bg-[#0F1829] border-[#1A2332] max-w-2xl w-full">
        <CardContent className="p-8">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#8B92A7]">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-sm text-[#D4AF37]">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <div className={`w-24 h-24 ${step.bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
              <Icon className={`${step.color}`} size={48} />
            </div>
            <h2 className="text-3xl text-[#E8EAED] mb-3" style={{ fontWeight: 600 }}>
              {step.title}
            </h2>
            <p className="text-lg text-[#8B92A7]">{step.description}</p>
          </div>

          {/* Features */}
          {currentStep === 0 && (
            <div className="mb-8 space-y-3">
              <div className="flex items-center gap-3 text-[#E8EAED]">
                <CheckCircle className="text-[#D4AF37]" size={20} />
                <span>Buy & sell Chinese cars easily</span>
              </div>
              <div className="flex items-center gap-3 text-[#E8EAED]">
                <CheckCircle className="text-[#D4AF37]" size={20} />
                <span>Connect with car enthusiasts</span>
              </div>
              <div className="flex items-center gap-3 text-[#E8EAED]">
                <CheckCircle className="text-[#D4AF37]" size={20} />
                <span>Find trusted garages and services</span>
              </div>
              <div className="flex items-center gap-3 text-[#E8EAED]">
                <CheckCircle className="text-[#D4AF37]" size={20} />
                <span>Earn rewards and achievements</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            {currentStep < steps.length - 1 ? (
              <>
                <Button
                  onClick={handleSkip}
                  variant="outline"
                  className="flex-1 border-[#1A2332] text-[#E8EAED] hover:bg-[#1A2332]"
                >
                  Skip Tour
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A037]"
                >
                  Next
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </>
            ) : (
              <Button
                onClick={handleFinish}
                className="w-full bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A037]"
              >
                <CheckCircle className="mr-2" size={20} />
                Get Started
              </Button>
            )}
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-[#D4AF37] w-8'
                    : index < currentStep
                    ? 'bg-[#D4AF37]/50'
                    : 'bg-[#1A2332]'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
