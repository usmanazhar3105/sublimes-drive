import { useEffect, useMemo, useState } from 'react';
import { Check, Clock, Eye, MessageCircle, Home, Star, Calendar, Share2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase/client';

interface PaymentSuccessPageProps {
  onNavigate?: (page: string) => void;
  paymentData?: any;
}

export function PaymentSuccessPage({ onNavigate, paymentData }: PaymentSuccessPageProps) {
  const sessionId = useMemo(() => {
    try {
      return new URLSearchParams(window.location.search).get('session_id');
    } catch {
      return null;
    }
  }, []);

  const [order, setOrder] = useState<any>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);

  // Resolve real order details from Stripe session id (no mock data)
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoadingOrder(true);
        if (!sessionId) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .eq('stripe_checkout_session_id', sessionId)
          .maybeSingle();
        if (error) throw error;
        if (!cancelled) setOrder(data);
      } catch (e) {
        console.warn('Payment success lookup failed (non-fatal):', e);
      } finally {
        if (!cancelled) setLoadingOrder(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [sessionId]);

  const transactionId = order?.id || sessionId || paymentData?.paymentResult?.transactionId || 'unknown';
  const totalAmount =
    typeof order?.amount === 'number'
      ? order.amount / 100
      : (paymentData?.pricing?.total || 0);

  const isListingFlow = Boolean(paymentData?.pricing);
  const estimatedApprovalTime = isListingFlow ? '2-6 hours' : 'Instant';
  const approvalProgress = isListingFlow ? 75 : 100;

  const benefits = [
    {
      icon: <Eye className="h-5 w-5 text-blue-500" />,
      title: 'Increased Visibility',
      description: 'Your listing will appear at the top of search results'
    },
    {
      icon: <Star className="h-5 w-5 text-[var(--sublimes-gold)]" />,
      title: 'Featured Badge',
      description: 'Stand out with a premium featured badge'
    },
    {
      icon: <MessageCircle className="h-5 w-5 text-green-500" />,
      title: 'Priority Support',
      description: 'Get faster responses from our support team'
    }
  ];

  const nextSteps = [
    {
      step: 1,
      title: 'Admin Review',
      description: 'Our team will review your listing for quality and compliance',
      status: 'current',
      estimated: '2-6 hours'
    },
    {
      step: 2,
      title: 'Listing Goes Live',
      description: 'Your boosted listing will be published and visible to buyers',
      status: 'pending',
      estimated: 'After approval'
    },
    {
      step: 3,
      title: 'Boost Activation',
      description: 'Your boost package features will be activated',
      status: 'pending',
      estimated: 'Immediately after going live'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-4 py-8">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground text-lg">
              Your listing has been submitted for admin approval
            </p>
          </div>
          <Badge className="bg-green-500/10 text-green-600 px-4 py-2">
            {loadingOrder ? 'Verifying payment…' : 'Transaction'} ID: {transactionId}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Approval Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-[var(--sublimes-gold)]" />
                  Approval Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Review Progress</span>
                    <span>{approvalProgress}%</span>
                  </div>
                  <Progress value={approvalProgress} className="h-2" />
                </div>
                
                <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                  <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">
                    📋 Currently Under Review
                  </h3>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    Your listing is being reviewed by our admin team. Expected approval time: <strong>{estimatedApprovalTime}</strong>
                  </p>
                </div>

                <div className="space-y-3">
                  {nextSteps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        step.status === 'current' 
                          ? 'bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]'
                          : step.status === 'completed'
                          ? 'bg-green-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {step.status === 'completed' ? <Check className="w-4 h-4" /> : step.step}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                        <p className="text-xs text-[var(--sublimes-gold)] mt-1">{step.estimated}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* What's Next */}
            <Card>
              <CardHeader>
                <CardTitle>📬 What Happens Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-blue-500">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Email Notification</h4>
                      <p className="text-sm text-muted-foreground">
                        You'll receive an email when your listing is approved
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-blue-500">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Boost Activation</h4>
                      <p className="text-sm text-muted-foreground">
                        Your boost features will be automatically activated
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-blue-500">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Start Getting Inquiries</h4>
                      <p className="text-sm text-muted-foreground">
                        Watch your phone and email for buyer inquiries!
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Purchase Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Purchase Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Base Listing Fee</span>
                    <span>AED {paymentData?.pricing?.baseFee || 0}</span>
                  </div>
                  
                  {paymentData?.pricing?.boostFee > 0 && (
                    <div className="flex justify-between">
                      <span>Boost Package</span>
                      <span>AED {paymentData.pricing.boostFee}</span>
                    </div>
                  )}
                  
                  {paymentData?.pricing?.addOnsFee > 0 && (
                    <div className="flex justify-between">
                      <span>Add-on Services</span>
                      <span>AED {paymentData.pricing.addOnsFee}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Paid</span>
                    <span className="text-green-600">AED {totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-[var(--sublimes-gold)]/10 p-3 rounded-lg border border-[var(--sublimes-gold)]/20">
                  <p className="text-sm">
                    <strong>Receipt sent to your email</strong><br />
                    You can also download it from your account
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Boost Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>🚀 Your Boost Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                      {benefit.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold">{benefit.title}</h4>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button 
                onClick={() => onNavigate?.('home')}
                className="w-full bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/90"
              >
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => onNavigate?.('marketplace')}
                className="w-full"
              >
                <Calendar className="mr-2 h-4 w-4" />
                View My Listings
              </Button>
              
              <Button 
                variant="outline" 
                onClick={async () => {
                  const shareData = {
                    title: 'Check out my listing on Sublimes Drive!',
                    text: 'I just posted my car on Sublimes Drive - the best platform for car enthusiasts in the UAE!',
                    url: window.location.origin,
                  };

                  try {
                    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                      await navigator.share(shareData);
                      toast.success('Shared successfully!');
                    } else {
                      // Fallback: copy to clipboard
                      const shareText = `${shareData.text} ${shareData.url}`;
                      
                      if (navigator.clipboard) {
                        await navigator.clipboard.writeText(shareText);
                        toast.success('Share text copied to clipboard!');
                      } else {
                        // Even more basic fallback - social media share
                        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
                        window.open(shareUrl, '_blank');
                        toast.success('Opening social media share...');
                      }
                    }
                  } catch (error) {
                    console.error('Share failed:', error);
                    toast.error('Failed to share. Please try again.');
                  }
                }}
                className="w-full"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share Success
              </Button>
            </div>
          </div>
        </div>

        {/* Support Contact */}
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <h3 className="font-semibold">Need Help?</h3>
              <p className="text-sm text-muted-foreground">
                Our support team is here to help you with any questions about your listing
              </p>
              <div className="flex justify-center space-x-4 mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    try {
                      // Try to open AI chat bot first
                      const chatBot = document.querySelector('[data-chat-bot]') as HTMLElement;
                      if (chatBot) {
                        chatBot.click();
                        toast.success('Opening live chat...');
                      } else {
                        // Fallback to conversations page
                        onNavigate?.('conversations');
                        toast.success('Opening support chat...');
                      }
                    } catch (error) {
                      console.error('Chat failed to open:', error);
                      toast.error('Failed to open chat. Please try again.');
                    }
                  }}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Live Chat
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    try {
                      // For mobile devices, this will trigger the phone dialer
                      window.location.href = 'tel:+971503530121';
                      toast.success('Opening dialer...');
                    } catch (error) {
                      // Fallback for desktop - copy phone number
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText('+971 50 353 0121');
                        toast.success('Phone number copied to clipboard!');
                      } else {
                        toast.error('Please call +971 50 353 0121');
                      }
                    }
                  }}
                >
                  📞 +971 50 353 0121
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}