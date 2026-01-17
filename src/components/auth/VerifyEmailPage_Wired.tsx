/**
 * VerifyEmailPage - Wired
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Logo } from '../ui/Logo';
import { Mail, Loader2, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useAnalytics } from '../../src/hooks';
import { supabase } from '../../utils/supabase/client';
// import bgImage from "figma:asset/..."; // TODO: Replace with actual asset
const bgImage = "/placeholder.png";

interface VerifyEmailPageProps {
  onNavigate: (page: string) => void;
  email?: string;
}

export function VerifyEmailPage({ onNavigate, email }: VerifyEmailPageProps) {
  const [resending, setResending] = useState(false);
  const [displayEmail, setDisplayEmail] = useState(email || '');
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView('/verify-email');
    
    // Try to get email from localStorage if not passed as prop
    if (!email) {
      const storedEmail = localStorage.getItem('pendingVerificationEmail');
      if (storedEmail) {
        setDisplayEmail(storedEmail);
      }
    } else {
      // Store email in localStorage for page refreshes
      localStorage.setItem('pendingVerificationEmail', email);
      setDisplayEmail(email);
    }
  }, [email]);

  const handleResend = async () => {
    if (!displayEmail) {
      toast.error('No email address found. Please sign up again.');
      return;
    }
    
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: displayEmail,
      });
      
      if (error) {
        toast.error(error.message || 'Failed to resend verification email');
      } else {
        toast.success('Verification email sent!');
        analytics.trackEvent('verification_email_resent', { email: displayEmail });
      }
    } catch (err) {
      toast.error('Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-[#0B1426]/85 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" showText={false} />
          </div>
          <h1 className="text-3xl text-[#D4AF37] mb-2">Verify Your Email</h1>
          <p className="text-[#8B92A7]">Check your inbox for verification link</p>
        </div>

        <Card className="bg-[#0F1829]/95 backdrop-blur border-[#1A2332]">
          <CardContent className="p-8 text-center">
            <Mail className="w-16 h-16 text-[#D4AF37] mx-auto mb-6" />
            <h3 className="text-xl text-[#E8EAED] mb-4">Email Sent!</h3>
            <p className="text-[#8B92A7] mb-2">We've sent a verification link to:</p>
            <p className="text-[#D4AF37] mb-6">{displayEmail || 'your email address'}</p>
            
            <div className="space-y-3">
              <p className="text-sm text-[#8B92A7]">Didn't receive the email?</p>
              <Button
                onClick={handleResend}
                disabled={resending}
                variant="outline"
                className="w-full border-[#2A3342] text-[#E8EAED]"
              >
                {resending ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={20} />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2" size={20} />
                    Resend Email
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => onNavigate('login')}
                className="w-full bg-[#D4AF37] text-[#0B1426]"
              >
                <CheckCircle className="mr-2" size={20} />
                Continue to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
