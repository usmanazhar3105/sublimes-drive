/**
 * ForgotPasswordPage - Wired
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { Logo } from '../ui/Logo';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAnalytics } from '../../hooks';
// import bgImage from "figma:asset/..."; // TODO: Replace with actual asset
const bgImage = "/placeholder.png";

interface ForgotPasswordPageProps {
  onNavigate: (page: string) => void;
}

export function ForgotPasswordPage({ onNavigate }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView('/forgot-password');
  }, []);

  const handleReset = async () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setSent(true);
      toast.success('Reset link sent to your email!');
      analytics.trackEvent('password_reset_requested', { email });
      setLoading(false);
    }, 1000);
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
          <h1 className="text-3xl text-[#D4AF37] mb-2">Reset Password</h1>
          <p className="text-[#8B92A7]">Enter your email to receive reset link</p>
        </div>

        <Card className="bg-[#0F1829]/95 backdrop-blur border-[#1A2332]">
          <CardContent className="p-6 space-y-4">
            {sent ? (
              <div className="text-center py-4">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl text-[#E8EAED] mb-2">Check Your Email</h3>
                <p className="text-[#8B92A7] mb-6">We've sent a password reset link to {email}</p>
                <Button onClick={() => onNavigate('login')} className="bg-[#D4AF37] text-[#0B1426]">
                  Back to Login
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="email" className="text-[#E8EAED]">Email Address</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B92A7]" size={20} />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="pl-10 bg-[#1A2332] border-[#2A3342] text-[#E8EAED]"
                      onKeyPress={(e) => e.key === 'Enter' && handleReset()}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleReset}
                  disabled={loading}
                  className="w-full bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426] h-11"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={20} />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>

                <button
                  onClick={() => onNavigate('login')}
                  className="flex items-center justify-center gap-2 text-[#8B92A7] hover:text-[#E8EAED] w-full"
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
