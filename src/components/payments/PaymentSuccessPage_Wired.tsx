/**
 * PaymentSuccessPage_Wired - Database-connected Payment Success page
 * Uses: useAnalytics
 */

import { useEffect } from 'react';
import { CheckCircle, Home, Eye, Share2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { useAnalytics } from '../../src/hooks';

interface PaymentSuccessPageProps {
  transactionId?: string;
  amount?: number;
  onNavigate?: (page: string) => void;
}

export function PaymentSuccessPage({ 
  transactionId = 'TXN-' + Date.now(), 
  amount = 0, 
  onNavigate 
}: PaymentSuccessPageProps) {
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView('/payment-success');
    analytics.trackEvent('payment_success_viewed', { 
      transaction_id: transactionId,
      amount 
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1426] flex items-center justify-center p-4">
      <Card className="bg-[#0F1829] border-[#1A2332] max-w-2xl w-full">
        <CardContent className="p-12 text-center">
          <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-500" size={48} />
          </div>

          <h1 className="text-4xl text-[#E8EAED] mb-4" style={{ fontWeight: 600 }}>
            Payment Successful!
          </h1>
          
          <p className="text-xl text-[#8B92A7] mb-8">
            Your listing has been published successfully
          </p>

          <div className="bg-[#0B1426] rounded-lg p-6 mb-8">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-[#8B92A7] mb-1">Transaction ID</p>
                <p className="text-[#E8EAED]" style={{ fontWeight: 600 }}>
                  {transactionId}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#8B92A7] mb-1">Amount Paid</p>
                <p className="text-[#D4AF37]" style={{ fontWeight: 600 }}>
                  AED {amount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#8B92A7] mb-1">Status</p>
                <p className="text-green-500" style={{ fontWeight: 600 }}>
                  Confirmed
                </p>
              </div>
              <div>
                <p className="text-sm text-[#8B92A7] mb-1">Date</p>
                <p className="text-[#E8EAED]" style={{ fontWeight: 600 }}>
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => onNavigate?.('my-listings')}
              className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A037]"
            >
              <Eye className="mr-2" size={20} />
              View My Listings
            </Button>
            <Button
              onClick={() => onNavigate?.('marketplace')}
              variant="outline"
              className="border-[#1A2332] text-[#E8EAED] hover:bg-[#1A2332]"
            >
              <Home className="mr-2" size={20} />
              Back to Marketplace
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-[#1A2332]">
            <p className="text-sm text-[#8B92A7]">
              A confirmation email has been sent to your registered email address
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
