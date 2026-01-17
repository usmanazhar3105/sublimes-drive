import { ArrowLeft, CreditCard, Calendar, AlertTriangle, CheckCircle, Clock, Mail } from 'lucide-react';

interface RefundPolicyPageProps {
  onNavigate: (page: string) => void;
}

export function RefundPolicyPage({ onNavigate }: RefundPolicyPageProps) {
  return (
    <div className="min-h-screen bg-[var(--sublimes-dark-bg)] text-[var(--sublimes-light-text)]">
      {/* Header */}
      <div className="bg-[var(--sublimes-card-bg)] border-b border-[var(--sublimes-border)] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onNavigate('legal-hub')}
              className="p-2 hover:bg-[var(--sublimes-dark-bg)] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Refund Policy</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Last Updated: September 24, 2025</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-b border-[var(--sublimes-border)] p-6">
            <div className="flex items-center space-x-3 mb-4">
              <CreditCard className="w-8 h-8 text-[var(--sublimes-gold)]" />
              <div>
                <h2 className="text-2xl font-bold text-[var(--sublimes-light-text)]">Refund Policy</h2>
                <p className="text-gray-400">Terms and conditions for refunds and cancellations</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 space-y-8">
            <section>
              <h3 className="text-xl font-bold text-[var(--sublimes-gold)] mb-4 flex items-center">
                <span className="w-8 h-8 bg-[var(--sublimes-gold)]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[var(--sublimes-gold)] mr-3">1</span>
                General Policy
              </h3>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  Thank you for using Sublimes Drive. We offer digital services and products, and this policy outlines the terms under which refunds may be issued. Due to the nature of digital services, many of our fees are non-refundable once the service has been rendered.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[var(--sublimes-gold)] mb-4 flex items-center">
                <span className="w-8 h-8 bg-[var(--sublimes-gold)]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[var(--sublimes-gold)] mr-3">2</span>
                Marketplace and Garage Listing Fees
              </h3>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <h4 className="font-semibold text-red-400">Non-Refundable</h4>
                    </div>
                    <p className="text-sm">
                      <strong>Standard Listings:</strong> Fees paid for posting a standard car or auto part listing are generally non-refundable once the listing is published.
                    </p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <h4 className="font-semibold text-red-400">Rejection Policy</h4>
                    </div>
                    <p className="text-sm">
                      <strong>Rejection by Admin:</strong> If your listing is rejected during our review process for violating our Terms of Service, a refund will not be issued.
                    </p>
                  </div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <h4 className="font-semibold text-blue-400">Technical Issues</h4>
                  </div>
                  <p>
                    <strong>Technical Errors:</strong> A refund or credit may be issued if a listing fails to post due to a technical error on our Platform. Please contact support with details of the issue.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[var(--sublimes-gold)] mb-4 flex items-center">
                <span className="w-8 h-8 bg-[var(--sublimes-gold)]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[var(--sublimes-gold)] mr-3">3</span>
                Boosts and Promotional Packages
              </h3>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p>
                    Fees paid for listing boosts, featured placements, or other promotional packages are <strong>non-refundable</strong> once the promotional period has begun.
                  </p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-yellow-500" />
                    <h4 className="font-semibold text-yellow-400">Cancellation Window</h4>
                  </div>
                  <p>
                    If you wish to cancel a boost before it has started, please contact our support team. Cancellations are handled on a case-by-case basis.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[var(--sublimes-gold)] mb-4 flex items-center">
                <span className="w-8 h-8 bg-[var(--sublimes-gold)]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[var(--sublimes-gold)] mr-3">4</span>
                Repair Bid Credits
              </h3>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                  <p>
                    Credits purchased for the Repair Bid system are <strong>non-refundable</strong>. These credits do not expire and will remain in your wallet until they are used.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[var(--sublimes-gold)] mb-4 flex items-center">
                <span className="w-8 h-8 bg-[var(--sublimes-gold)]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[var(--sublimes-gold)] mr-3">5</span>
                Exceptional Circumstances
              </h3>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <p className="mb-3">We may consider refunds in exceptional circumstances, such as:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Billing errors where you were charged incorrectly.</li>
                    <li>Proven fraudulent activity on your account.</li>
                  </ul>
                  <p className="mt-3 text-sm text-gray-400">
                    All such requests will be reviewed on a case-by-case basis and are at the sole discretion of Sublimes Drive.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[var(--sublimes-gold)] mb-4 flex items-center">
                <Mail className="w-8 h-8 text-[var(--sublimes-gold)] mr-3" />
                How to Request a Refund
              </h3>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <div className="bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-semibold text-[var(--sublimes-gold)] mb-2">Contact Information</h4>
                      <p>
                        To request a refund, please contact our customer support team at{' '}
                        <a href="mailto:support@sublimesdrive.com" className="text-[var(--sublimes-gold)] hover:underline">
                          support@sublimesdrive.com
                        </a>{' '}
                        within 7 days of the transaction.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--sublimes-gold)] mb-2">Processing Time</h4>
                      <p>
                        We aim to process all requests within <strong>5-7 business days</strong>.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-semibold text-[var(--sublimes-gold)] mb-3">Required Information</h4>
                    <p className="mb-2">Please include the following information in your request:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Your username and email address.</li>
                      <li>The transaction ID or invoice number.</li>
                      <li>A detailed reason for your refund request.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[var(--sublimes-gold)] mb-4 flex items-center">
                <span className="w-8 h-8 bg-[var(--sublimes-gold)]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[var(--sublimes-gold)] mr-3">7</span>
                Policy Changes
              </h3>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <p>
                    Sublimes Drive reserves the right to modify this Refund Policy at any time. Any changes will be posted on this page, and your continued use of our services after such changes have been posted will constitute your acceptance of the new policy.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="bg-[var(--sublimes-dark-bg)] border-t border-[var(--sublimes-border)] p-6">
            <div className="text-center text-gray-400">
              <p>For questions about our Refund Policy, please contact us at support@sublimesdrive.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}