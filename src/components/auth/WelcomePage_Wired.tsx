/**
 * WelcomePage - Compact Mobile-First Design with Correct Logo
 */

import { useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Logo } from '../ui/Logo';
import { ArrowRight, Users, Car, Wrench } from 'lucide-react';
import { useAnalytics } from '../../src/hooks';
import bgImage from '../../assets/sublimes-drive-bg.jpg';

interface WelcomePageProps {
  onNavigate: (page: string) => void;
}

export function WelcomePage({ onNavigate }: WelcomePageProps) {
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView('/welcome');
  }, []);

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-between p-6 relative overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/75" />

      {/* Content container - Vertically centered */}
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col justify-center min-h-screen py-8">
        
        {/* Logo - Compact with proper sizing */}
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>

        {/* Tagline - Smaller */}
        <p className="text-[#E8EAED] text-center mb-8" style={{ fontSize: '15px', lineHeight: '22px' }}>
          The ultimate platform for Chinese car enthusiasts in UAE
        </p>

        {/* Feature Cards - Compact & iOS Style */}
        <div className="space-y-3 mb-8">
          <Card 
            className="bg-[#1e293b]/95 backdrop-blur border-[#334155] p-4 rounded-2xl"
            style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)' }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div className="flex-1">
                <h3 className="text-[#E8EAED] mb-1" style={{ fontSize: '16px', fontWeight: 600 }}>
                  Communities
                </h3>
                <p className="text-[#8B92A7]" style={{ fontSize: '13px', lineHeight: '18px' }}>
                  Connect with fellow car enthusiasts, share experiences, and build lasting friendships
                </p>
              </div>
            </div>
          </Card>
          
          <Card 
            className="bg-[#1e293b]/95 backdrop-blur border-[#334155] p-4 rounded-2xl"
            style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)' }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                <Car className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div className="flex-1">
                <h3 className="text-[#E8EAED] mb-1" style={{ fontSize: '16px', fontWeight: 600 }}>
                  Marketplace
                </h3>
                <p className="text-[#8B92A7]" style={{ fontSize: '13px', lineHeight: '18px' }}>
                  Buy and sell cars, parts, and accessories in a trusted community
                </p>
              </div>
            </div>
          </Card>
          
          <Card 
            className="bg-[#1e293b]/95 backdrop-blur border-[#334155] p-4 rounded-2xl"
            style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)' }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                <Wrench className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div className="flex-1">
                <h3 className="text-[#E8EAED] mb-1" style={{ fontSize: '16px', fontWeight: 600 }}>
                  Garage Hub
                </h3>
                <p className="text-[#8B92A7]" style={{ fontSize: '13px', lineHeight: '18px' }}>
                  Find trusted mechanics, get quotes, and manage maintenance
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* CTA Buttons - iOS Style */}
        <div className="space-y-3">
          <Button
            onClick={() => {
              analytics.trackEvent('welcome_get_started_clicked');
              onNavigate('signup');
            }}
            className="w-full h-14 rounded-xl text-[#0B1426]"
            style={{
              background: '#D4AF37',
              fontWeight: 600,
              fontSize: '16px',
              boxShadow: '0 4px 16px rgba(212, 175, 55, 0.3)',
            }}
          >
            Get Started
            <ArrowRight className="ml-2" size={20} />
          </Button>
          
          <Button
            onClick={() => {
              analytics.trackEvent('welcome_signin_clicked');
              onNavigate('login');
            }}
            variant="outline"
            className="w-full h-14 rounded-xl bg-transparent backdrop-blur"
            style={{
              borderWidth: '2px',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: '#E8EAED',
              fontWeight: 600,
              fontSize: '16px',
            }}
          >
            Sign In
          </Button>
        </div>

        {/* Footer Text - Compact */}
        <p className="text-center text-[#6B7280] mt-6" style={{ fontSize: '11px', lineHeight: '16px' }}>
          By continuing, you agree to our{' '}
          <button onClick={() => onNavigate('terms')} className="text-[#8B92A7] underline">
            Terms
          </button>
          {' '}and{' '}
          <button onClick={() => onNavigate('privacy')} className="text-[#8B92A7] underline">
            Privacy Policy
          </button>
        </p>
      </div>
    </div>
  );
}
