/**
 * LoginPage - iOS-Style Polish
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { Logo } from '../ui/Logo';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAnalytics } from '../../src/hooks';
import { supabase } from '../../utils/supabase/client';
// import bgImage from "figma:asset/..."; // TODO: Replace with actual asset
const bgImage = "/placeholder.png";

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView('/login');
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      analytics.trackEvent('google_signin_attempted');
      
      // Get the current origin for redirect - use full URL with /home (car owner dashboard)
      const redirectUrl = `${window.location.origin}/home`;
      console.log('Google OAuth redirect URL (Car Owner Dashboard):', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false
        }
      });
      
      if (error) {
        console.error('Google sign-in error:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        
        // Check if provider is not enabled
        if (error.message?.includes('provider') || error.message?.includes('not enabled')) {
          toast.error('Google login is not configured. Please contact support or use email/password login.');
        } else {
          toast.error(error.message || 'Failed to sign in with Google.');
        }
      } else {
        analytics.trackEvent('google_signin_success');
        // OAuth will redirect, no need to do anything else
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      toast.error(err.message || 'An error occurred during Google sign-in');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLoading(true);
      analytics.trackEvent('apple_signin_attempted');
      
      const redirectUrl = `${window.location.origin}/home`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: redirectUrl
        }
      });
      
      if (error) {
        console.error('Apple sign-in error:', error);
        if (error.message?.includes('provider') || error.message?.includes('not enabled')) {
          toast.error('Apple login is not configured. Please use email/password or Google login.');
        } else {
          toast.error(error.message || 'Failed to sign in with Apple.');
        }
      } else {
        analytics.trackEvent('apple_signin_success');
      }
    } catch (err: any) {
      console.error('Apple sign-in error:', err);
      toast.error(err.message || 'An error occurred during Apple sign-in');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      analytics.trackEvent('login_attempted', { email });

      // First, sign out any existing session to avoid conflicts
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      if (existingSession) {
        console.log('Signing out existing session before login...');
        await supabase.auth.signOut();
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('Login error:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        
        // Show specific error messages with helpful suggestions
        if (error.message.includes('Invalid login credentials') || error.message.includes('Invalid')) {
          toast.error(
            "Invalid email or password. If you don't have an account, please sign up first.",
            {
              duration: 5000,
              action: {
                label: 'Sign Up',
                onClick: () => onNavigate('signup')
              }
            }
          );
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please verify your email address before signing in. Check your inbox for a verification link.');
        } else if (error.message.includes('Too many requests')) {
          toast.error('Too many login attempts. Please wait a moment and try again.');
        } else if (error.message.includes('User not found')) {
          toast.error("No account found with this email. Please sign up first.", {
            action: {
              label: 'Sign Up',
              onClick: () => onNavigate('signup')
            }
          });
        } else {
          toast.error(error.message || 'Failed to sign in. Please try again.');
        }
        
        analytics.trackEvent('login_failed', { email, error: error.message });
        setLoading(false);
        return;
      }

      if (data.user && data.session) {
        toast.success('Login successful! Welcome back.');
        analytics.trackEvent('login_success', { email, userId: data.user.id });
        // Small delay to ensure session is fully set
        setTimeout(() => {
          onNavigate('home');
        }, 100);
      } else {
        toast.error('Login failed. No user or session returned.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Unexpected login error:', err);
      toast.error(err.message || 'An unexpected error occurred. Please try again.');
      analytics.trackEvent('login_error', { email, error: String(err) });
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/75" />

      <div className="relative z-10 w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('welcome')}
          className="flex items-center gap-2 text-[#E8EAED] mb-6 hover:text-[#D4AF37] transition-colors"
        >
          <ArrowLeft size={20} />
          <span style={{ fontSize: '15px' }}>Back</span>
        </button>

        {/* Card */}
        <Card className="bg-[#1e293b]/95 backdrop-blur border-[#334155] rounded-3xl" style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)' }}>
          <CardContent className="p-6">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Logo size="sm" />
            </div>

            <h1 className="text-[#E8EAED] text-center mb-2" style={{ fontSize: '24px', fontWeight: 700 }}>
              Welcome Back
            </h1>
            <p className="text-[#8B92A7] text-center mb-6" style={{ fontSize: '14px' }}>
              Sign in to your account
            </p>

            {/* Social Auth Buttons */}
            <div className="space-y-3 mb-6">
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl bg-white/10 backdrop-blur border-[#334155] text-[#E8EAED] hover:bg-white/20"
                onClick={handleGoogleSignIn}
                style={{ fontSize: '15px', fontWeight: 500 }}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <Button
                variant="outline"
                className="w-full h-12 rounded-xl bg-white/10 backdrop-blur border-[#334155] text-[#E8EAED] hover:bg-white/20"
                onClick={handleAppleSignIn}
                style={{ fontSize: '15px', fontWeight: 500 }}
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Continue with Apple
              </Button>
            </div>

            <div className="text-center text-[#6B7280] mb-6" style={{ fontSize: '13px' }}>
              Or sign in with email
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-[#E8EAED]" style={{ fontSize: '14px', fontWeight: 500 }}>
                  Email
                </Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={18} />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="pl-10 bg-[#0f172a] border-[#334155] text-[#E8EAED] h-12 rounded-xl"
                    style={{ fontSize: '15px' }}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-[#E8EAED]" style={{ fontSize: '14px', fontWeight: 500 }}>
                  Password
                </Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={18} />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-[#0f172a] border-[#334155] text-[#E8EAED] h-12 rounded-xl"
                    style={{ fontSize: '15px' }}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#E8EAED]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => onNavigate('forgot-password')}
                  className="text-[#D4AF37] hover:text-[#C19B2E]"
                  style={{ fontSize: '13px', fontWeight: 500 }}
                >
                  Forgot password?
                </button>
              </div>

              <Button
                onClick={handleLogin}
                disabled={loading}
                className="w-full h-13 rounded-xl text-[#0B1426] mt-2"
                style={{
                  background: '#D4AF37',
                  fontWeight: 600,
                  fontSize: '16px',
                  boxShadow: '0 4px 16px rgba(212, 175, 55, 0.3)',
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={20} />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              <div className="text-center pt-2" style={{ fontSize: '14px' }}>
                <span className="text-[#8B92A7]">Don't have an account? </span>
                <button
                  onClick={() => onNavigate('signup')}
                  className="text-[#D4AF37] hover:text-[#C19B2E]"
                  style={{ fontWeight: 500 }}
                >
                  Sign up
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
