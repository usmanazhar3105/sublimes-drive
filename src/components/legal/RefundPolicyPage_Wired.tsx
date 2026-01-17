/**
 * RefundPolicyPage_Wired - Database-connected Refund Policy
 * Uses: useAnalytics
 */

import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { useAnalytics } from '../../src/hooks';

interface RefundPolicyPageProps {
  onNavigate?: (page: string) => void;
}

export function RefundPolicyPage({ onNavigate }: RefundPolicyPageProps) {
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView('/refund-policy');
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1426]">
      <div className="bg-[#0F1829] border-b border-[#1A2332]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <RefreshCw className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
          <h1 className="text-4xl text-[#E8EAED] mb-4" style={{ fontWeight: 600 }}>
            Refund Policy
          </h1>
          <p className="text-[#8B92A7]">Last updated: January 2024</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl text-[#E8EAED] mb-4" style={{ fontWeight: 600 }}>
                1. Refund Eligibility
              </h2>
              <p className="text-[#8B92A7] leading-relaxed">
                Refunds are available for boost packages and paid services within 7 days of purchase if unused.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#E8EAED] mb-4" style={{ fontWeight: 600 }}>
                2. How to Request a Refund
              </h2>
              <p className="text-[#8B92A7] leading-relaxed">
                Contact our support team at support@sublimesdrive.com with your order details and reason for refund.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#E8EAED] mb-4" style={{ fontWeight: 600 }}>
                3. Processing Time
              </h2>
              <p className="text-[#8B92A7] leading-relaxed">
                Approved refunds will be processed within 5-7 business days to the original payment method.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#E8EAED] mb-4" style={{ fontWeight: 600 }}>
                4. Non-Refundable Items
              </h2>
              <p className="text-[#8B92A7] leading-relaxed">
                Listing fees and used boost credits are non-refundable once activated or utilized.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
