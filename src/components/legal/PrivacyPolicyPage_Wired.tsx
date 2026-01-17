/**
 * PrivacyPolicyPage_Wired - Database-connected Privacy Policy
 * Uses: useAnalytics
 */

import { useEffect } from 'react';
import { Shield, Eye, Lock, Database, Share2, Bell, Cookie } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { useAnalytics } from '../../src/hooks';

interface PrivacyPolicyPageProps {
  onNavigate?: (page: string) => void;
}

export function PrivacyPolicyPage({ onNavigate }: PrivacyPolicyPageProps) {
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView('/privacy-policy');
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1426]">
      <div className="bg-[#0F1829] border-b border-[#1A2332]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <Shield className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
          <h1 className="text-4xl text-[#E8EAED] mb-4" style={{ fontWeight: 600 }}>
            Privacy Policy
          </h1>
          <p className="text-[#8B92A7]">Last updated: January 2024</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl text-[#E8EAED] mb-4" style={{ fontWeight: 600 }}>
                1. Information We Collect
              </h2>
              <p className="text-[#8B92A7] leading-relaxed mb-4">
                We collect information you provide directly to us, such as when you create an account, list a vehicle, make a purchase, or contact us for support.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#E8EAED] mb-4" style={{ fontWeight: 600 }}>
                2. How We Use Your Information
              </h2>
              <p className="text-[#8B92A7] leading-relaxed">
                We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your comments and questions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#E8EAED] mb-4" style={{ fontWeight: 600 }}>
                3. Information Sharing
              </h2>
              <p className="text-[#8B92A7] leading-relaxed">
                We do not share your personal information with third parties except as described in this policy or with your consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#E8EAED] mb-4" style={{ fontWeight: 600 }}>
                4. Data Security
              </h2>
              <p className="text-[#8B92A7] leading-relaxed">
                We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#E8EAED] mb-4" style={{ fontWeight: 600 }}>
                5. Your Rights
              </h2>
              <p className="text-[#8B92A7] leading-relaxed">
                You have the right to access, update, or delete your personal information at any time through your account settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#E8EAED] mb-4" style={{ fontWeight: 600 }}>
                6. Contact Us
              </h2>
              <p className="text-[#8B92A7] leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at privacy@sublimesdrive.com
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
