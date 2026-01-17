import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { CheckCircle, ArrowRight, Users, ShoppingBag, Wrench, Calendar, MessageSquare, Trophy } from 'lucide-react';

interface OnboardingPageProps {
  onNavigate: (page: string) => void;
}

export function OnboardingPage({ onNavigate }: OnboardingPageProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Sublimes Drive!",
      description: "Your ultimate platform for Chinese car enthusiasts in UAE",
      icon: CheckCircle,
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-12 h-12 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">You're all set!</h2>
            <p className="text-muted-foreground">
              Let's take a quick tour of what you can do on Sublimes Drive
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Connect with Communities",
      description: "Join discussions, share experiences, and build connections",
      icon: Users,
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
            <Users className="w-12 h-12 text-blue-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Communities</h2>
            <p className="text-muted-foreground mb-4">
              Connect with fellow car enthusiasts, share photos, ask questions, and participate in discussions about your favorite vehicles.
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Post photos and stories</li>
              <li>• Join trending topics</li>
              <li>• Get advice from experts</li>
              <li>• Earn XP points for participation</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Explore Marketplace",
      description: "Buy and sell cars, parts, and accessories",
      icon: ShoppingBag,
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-12 h-12 text-green-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Marketplace</h2>
            <p className="text-muted-foreground mb-4">
              Discover amazing deals on cars, parts, and accessories from verified sellers across UAE.
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Browse thousands of listings</li>
              <li>• Filter by location and price</li>
              <li>• Contact verified sellers</li>
              <li>• Save favorites for later</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Find Trusted Garages",
      description: "Get quotes and book services from verified mechanics",
      icon: Wrench,
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto">
            <Wrench className="w-12 h-12 text-orange-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Garage Hub</h2>
            <p className="text-muted-foreground mb-4">
              Find trusted mechanics and garages, get competitive quotes for repairs, and book services easily.
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Request repair quotes</li>
              <li>• Compare prices from multiple garages</li>
              <li>• Read reviews and ratings</li>
              <li>• Book appointments instantly</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Instant Meetups & Events",
      description: "Organize and join car meetups and events",
      icon: Calendar,
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto">
            <Calendar className="w-12 h-12 text-purple-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Events & Meetups</h2>
            <p className="text-muted-foreground mb-4">
              Discover car events, organize instant meetups, and connect with local car enthusiasts in person.
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Create instant meetups</li>
              <li>• Join local car events</li>
              <li>• Meet fellow enthusiasts</li>
              <li>• Share your passion</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Earn XP & Badges",
      description: "Build your reputation and unlock rewards",
      icon: Trophy,
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto">
            <Trophy className="w-12 h-12 text-yellow-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">XP & Achievements</h2>
            <p className="text-muted-foreground mb-4">
              Earn experience points for your activities and unlock exclusive badges and privileges.
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Earn XP for posts and interactions</li>
              <li>• Unlock achievement badges</li>
              <li>• Climb the leaderboard</li>
              <li>• Get exclusive perks</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onNavigate('home');
    }
  };

  const handleSkip = () => {
    onNavigate('home');
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Header */}
      <div className="p-4 border-b border-border">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSkip}
            >
              Skip
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="p-8">
            {steps[currentStep].content}
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="p-4 border-t border-border">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex space-x-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          
          <Button onClick={handleNext}>
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}