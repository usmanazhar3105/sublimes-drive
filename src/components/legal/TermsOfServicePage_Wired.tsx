/**
 * TermsOfServicePage_Wired - Database-connected Terms of Service
 * Uses: useAnalytics
 */

import { useEffect } from 'react';
import { FileText } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { useAnalytics } from '../../src/hooks';

interface TermsOfServicePageProps {
  onNavigate?: (page: string) => void;
}

export function TermsOfServicePage({ onNavigate }: TermsOfServicePageProps) {
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView('/terms-of-service');
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1426]">
      <div className="bg-[#0F1829] border-b border-[#1A2332]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <FileText className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
          <h1 className="text-4xl text-[#E8EAED] mb-4" style={{ fontWeight: 600 }}>
            Terms of Service
          </h1>
          <p className="text-[#8B92A7]">Last updated: January 2024</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl text-[#E8EAED] mb-4" style={{ fontWeight: 600 }}>
                1. Acceptance of Terms
              </h2>
              <p className="text-[#8B92A7] leading-relaxed">
                By accessing and using Sublimes Drive, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#E8EAED] mb-4" style={{ fontWeight: 600 }}>
                2. User Accounts
              </h2>
              <p className="text-[#8B92A7] leading-relaxed">
                You are responsible for maintaining the confidentiality of your account and password and for restricting access to your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#E8EAED] mb-4" style={{ fontWeight: 600 }}>
                3. Prohibited Activities
              </h2>
              <p className="text-[#8B92A7] leading-relaxed">
                You agree not to engage in any activity that interferes with or disrupts the Service or servers and networks connected to the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#E8EAED] mb-4" style={{ fontWeight: 600 }}>
                4. Listings and Transactions
              </h2>
              <p className="text-[#8B92A7] leading-relaxed">
                All listings must be accurate and comply with applicable laws. Sublimes Drive is not responsible for transactions between users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#E8EAED] mb-4" style={{ fontWeight: 600 }}>
                5. Termination
              </h2>
              <p className="text-[#8B92A7] leading-relaxed">
                We reserve the right to terminate or suspend your account at any time for violations of these Terms of Service.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
