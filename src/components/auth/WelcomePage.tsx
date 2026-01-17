import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ArrowRight, Car, Users, Wrench } from 'lucide-react';

interface WelcomePageProps {
  onNavigate: (page: string) => void;
}

export function WelcomePage({ onNavigate }: WelcomePageProps) {
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 relative"
      style={{
        background: 'linear-gradient(135deg, #0B1426 0%, #1a2332 100%)'
      }}
    >
      {/* Content container */}
      <div className="relative z-10 w-full max-w-4xl mx-auto">
      {/* Logo and Branding */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 flex items-center justify-center mb-6 mx-auto bg-[var(--sublimes-gold)] rounded-full">
          <Car className="w-12 h-12 text-[var(--sublimes-dark-bg)]" />
        </div>
        <h1 className="text-4xl font-bold mb-2 text-[var(--sublimes-gold)]">Sublimes Drive</h1>
        <p className="text-muted-foreground text-lg">
          The ultimate platform for car enthusiasts in UAE
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 w-full max-w-4xl">
        <Card className="p-6 text-center">
          <Users className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="font-semibold mb-2">Communities</h3>
          <p className="text-sm text-muted-foreground">
            Connect with fellow car enthusiasts
          </p>
        </Card>
        <Card className="p-6 text-center">
          <Car className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="font-semibold mb-2">Marketplace</h3>
          <p className="text-sm text-muted-foreground">
            Buy and sell cars & parts
          </p>
        </Card>
        <Card className="p-6 text-center">
          <Wrench className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="font-semibold mb-2">Garage Hub</h3>
          <p className="text-sm text-muted-foreground">
            Find trusted mechanics
          </p>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-sm space-y-3">
        <Button 
          onClick={() => onNavigate('signup')}
          className="w-full"
          size="lg"
        >
          Get Started
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <Button 
          onClick={() => onNavigate('login')}
          variant="outline"
          className="w-full"
          size="lg"
        >
          Sign In
        </Button>
      </div>

      {/* Terms */}
      <p className="text-xs text-muted-foreground text-center mt-6 max-w-sm">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
      </div>
    </div>
  );
}