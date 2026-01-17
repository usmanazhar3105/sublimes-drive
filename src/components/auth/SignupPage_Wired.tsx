/**
 * SignupPage - Compact Single Screen (No Scrolling)
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { ArrowLeft, User, Mail, Phone, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import { useAnalytics } from '../../src/hooks';
import { supabase } from '../../utils/supabase/client';
// import bgImage from "figma:asset/..."; // TODO: Replace with actual asset
const bgImage = "/placeholder.png";

interface SignupPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function SignupPage({ onNavigate }: SignupPageProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [loading, setLoading] = useState(false);

  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView('/signup');
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      analytics.trackEvent('google_signup_attempted');
      
      const redirectUrl = `${window.location.origin}/home`;
      console.log('Google OAuth redirect URL (Car Owner Dashboard):', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false
        }
      });
      
      if (error) {
        console.error('Google sign-in error:', error);
        toast.error('Failed to sign in with Google. Please ensure Google provider is enabled in Supabase Dashboard.');
      } else {
        analytics.trackEvent('google_signup_success');
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      toast.error('An error occurred during Google sign-in');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLoading(true);
      analytics.trackEvent('apple_signup_attempted');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/home`
        }
      });
      
      if (error) {
        console.error('Apple sign-in error:', error);
        toast.error('Failed to sign in with Apple. Please ensure Apple provider is enabled in Supabase Dashboard.');
      } else {
        analytics.trackEvent('apple_signup_success');
      }
    } catch (err) {
      console.error('Apple sign-in error:', err);
      toast.error('An error occurred during Apple sign-in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!formData.firstName || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the Terms of Service');
      return;
    }

    try {
      setLoading(true);
      analytics.trackEvent('signup_attempted', { email: formData.email });

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: `${formData.firstName} ${formData.lastName}`.trim(),
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone || null,
            marketing_emails: marketingEmails,
          },
        },
      });

      if (error) {
        console.error('Signup error:', error);
        
        // Show specific error messages
        if (error.message.includes('User already registered')) {
          toast.error('An account with this email already exists. Please sign in instead.');
        } else if (error.message.includes('Password')) {
          toast.error(error.message);
        } else {
          toast.error(error.message || 'Failed to create account. Please try again.');
        }
        
        analytics.trackEvent('signup_failed', { email: formData.email, error: error.message });
        return;
      }

      if (data.user) {
        toast.success('Account created successfully! Please check your email to verify your account.');
        analytics.trackEvent('signup_success', { email: formData.email, userId: data.user.id });
        onNavigate('verify-email', { email: formData.email });
      }
    } catch (err) {
      console.error('Unexpected signup error:', err);
      toast.error('An unexpected error occurred. Please try again.');
      analytics.trackEvent('signup_error', { email: formData.email, error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-3 sm:p-4 overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/75" />

      <div className="relative z-10 w-full max-w-lg my-2">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('welcome')}
          className="flex items-center gap-2 text-[#E8EAED] mb-3 hover:text-[#D4AF37]"
        >
          <ArrowLeft size={18} />
          <span style={{ fontSize: '14px' }}>Back</span>
        </button>

        {/* Card - Compact */}
        <Card className="bg-[#1e293b]/95 backdrop-blur border-[#334155] rounded-2xl" style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)' }}>
          <CardContent className="p-5">
            <h1 className="text-[#E8EAED] mb-1" style={{ fontSize: '20px', fontWeight: 700 }}>
              Create your account
            </h1>
            <p className="text-[#8B92A7] mb-4" style={{ fontSize: '12px' }}>
              Join the Sublimes Drive community
            </p>

            {/* Social Auth Buttons - Very Compact */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button
                variant="outline"
                className="h-9 rounded-lg bg-white/10 backdrop-blur border-[#334155] text-[#E8EAED] hover:bg-white/20"
                onClick={handleGoogleSignIn}
                disabled={loading}
                style={{ fontSize: '13px', fontWeight: 500 }}
              >
                <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>

              <Button
                variant="outline"
                className="h-9 rounded-lg bg-white/10 backdrop-blur border-[#334155] text-[#E8EAED] hover:bg-white/20"
                onClick={handleAppleSignIn}
                disabled={loading}
                style={{ fontSize: '13px', fontWeight: 500 }}
              >
                <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Apple
              </Button>
            </div>

            <div className="text-center text-[#6B7280] mb-3" style={{ fontSize: '11px' }}>
              Or create with email
            </div>

            {/* Form Fields - Super Compact */}
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="firstName" className="text-[#E8EAED]" style={{ fontSize: '12px', fontWeight: 500 }}>
                    First Name
                  </Label>
                  <div className="relative mt-1">
                    <User className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B7280]" size={14} />
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="First"
                      className="pl-8 bg-[#0f172a] border-[#334155] text-[#E8EAED] h-9 rounded-lg"
                      style={{ fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-[#E8EAED]" style={{ fontSize: '12px', fontWeight: 500 }}>
                    Last Name
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Last"
                      className="bg-[#0f172a] border-[#334155] text-[#E8EAED] h-9 rounded-lg"
                      style={{ fontSize: '13px' }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-[#E8EAED]" style={{ fontSize: '12px', fontWeight: 500 }}>
                  Email
                </Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B7280]" size={14} />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="pl-8 bg-[#0f172a] border-[#334155] text-[#E8EAED] h-9 rounded-lg"
                    style={{ fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-[#E8EAED]" style={{ fontSize: '12px', fontWeight: 500 }}>
                  Phone <span className="text-[#6B7280]">(Optional)</span>
                </Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B7280]" size={14} />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+971 50 123 4567"
                    className="pl-8 bg-[#0f172a] border-[#334155] text-[#E8EAED] h-9 rounded-lg"
                    style={{ fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-[#E8EAED]" style={{ fontSize: '12px', fontWeight: 500 }}>
                  Password
                </Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B7280]" size={14} />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Create password"
                    className="pl-8 pr-8 bg-[#0f172a] border-[#334155] text-[#E8EAED] h-9 rounded-lg"
                    style={{ fontSize: '13px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#E8EAED]"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-[#E8EAED]" style={{ fontSize: '12px', fontWeight: 500 }}>
                  Confirm Password
                </Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B7280]" size={14} />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm password"
                    className="pl-8 bg-[#0f172a] border-[#334155] text-[#E8EAED] h-9 rounded-lg"
                    style={{ fontSize: '13px' }}
                    onKeyPress={(e) => e.key === 'Enter' && handleSignup()}
                  />
                </div>
              </div>

              {/* Checkboxes - Compact */}
              <div className="space-y-1.5 pt-0.5">
                <div className="flex items-start gap-2">
                  <Checkbox 
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    className="mt-0.5 border-[#334155] h-3.5 w-3.5"
                  />
                  <label htmlFor="terms" className="text-[#8B92A7] leading-tight" style={{ fontSize: '11px' }}>
                    I agree to the{' '}
                    <button onClick={() => onNavigate('terms')} className="text-[#D4AF37]">
                      Terms
                    </button>
                    {' '}and{' '}
                    <button onClick={() => onNavigate('privacy')} className="text-[#D4AF37]">
                      Privacy Policy
                    </button>
                  </label>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox 
                    id="marketing"
                    checked={marketingEmails}
                    onCheckedChange={(checked) => setMarketingEmails(checked as boolean)}
                    className="mt-0.5 border-[#334155] h-3.5 w-3.5"
                  />
                  <label htmlFor="marketing" className="text-[#8B92A7] leading-tight" style={{ fontSize: '11px' }}>
                    Send me marketing emails
                  </label>
                </div>
              </div>

              <Button
                onClick={handleSignup}
                disabled={loading}
                className="w-full h-10 rounded-lg text-[#0B1426] mt-1.5"
                style={{
                  background: '#D4AF37',
                  fontWeight: 600,
                  fontSize: '14px',
                  boxShadow: '0 4px 16px rgba(212, 175, 55, 0.3)',
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={16} />
                    Creating...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

              <div className="text-center pt-0.5" style={{ fontSize: '12px' }}>
                <span className="text-[#8B92A7]">Have an account? </span>
                <button
                  onClick={() => onNavigate('login')}
                  className="text-[#D4AF37] hover:text-[#C19B2E]"
                  style={{ fontWeight: 500 }}
                >
                  Sign in
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
