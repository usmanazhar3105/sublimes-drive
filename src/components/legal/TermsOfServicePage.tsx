import { ArrowLeft, FileText, Calendar, Scale } from 'lucide-react';

interface TermsOfServicePageProps {
  onNavigate: (page: string) => void;
}

export function TermsOfServicePage({ onNavigate }: TermsOfServicePageProps) {
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
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Terms of Service</h1>
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
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-[var(--sublimes-border)] p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Scale className="w-8 h-8 text-[var(--sublimes-gold)]" />
              <div>
                <h2 className="text-2xl font-bold text-[var(--sublimes-light-text)]">Terms of Service</h2>
                <p className="text-gray-400">Legal agreement between you and Sublimes Drive</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 space-y-8">
            <section>
              <h3 className="text-xl font-bold text-[var(--sublimes-gold)] mb-4 flex items-center">
                <span className="w-8 h-8 bg-[var(--sublimes-gold)]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[var(--sublimes-gold)] mr-3">1</span>
                Introduction
              </h3>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  Welcome to Sublimes Drive ("we", "us", "our"). These Terms of Service ("Terms") govern your use of our website, mobile applications, and services (collectively, the "Platform"). By accessing or using our Platform, you agree to be bound by these Terms. If you do not agree, you may not use the Platform.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[var(--sublimes-gold)] mb-4 flex items-center">
                <span className="w-8 h-8 bg-[var(--sublimes-gold)]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[var(--sublimes-gold)] mr-3">2</span>
                User Accounts
              </h3>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  To access certain features, you must create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to provide accurate and complete information and to update it as necessary.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[var(--sublimes-gold)] mb-4 flex items-center">
                <span className="w-8 h-8 bg-[var(--sublimes-gold)]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[var(--sublimes-gold)] mr-3">3</span>
                User Conduct and Content
              </h3>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  You are solely responsible for the content you post, including posts, comments, listings, and messages ("User Content"). You agree not to post User Content that:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Is unlawful, harmful, defamatory, obscene, or otherwise objectionable.</li>
                  <li>Infringes on any third party's intellectual property rights.</li>
                  <li>Contains viruses or other malicious code.</li>
                  <li>Includes unsolicited promotions, spam, or contact information in community areas.</li>
                </ul>
                <p>
                  We reserve the right, but not the obligation, to monitor, screen, and remove User Content at our discretion and without notice.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[var(--sublimes-gold)] mb-4 flex items-center">
                <span className="w-8 h-8 bg-[var(--sublimes-gold)]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[var(--sublimes-gold)] mr-3">4</span>
                Marketplace and Garage Hub
              </h3>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  Our Platform includes a marketplace for cars and parts and a hub for garages. We are not a party to any transactions between users. We do not guarantee the quality, safety, or legality of items listed or the truth or accuracy of listings.
                </p>
                <p>
                  Sellers are responsible for accurately describing their items and honoring the sales. Buyers are responsible for conducting their own due diligence before making a purchase.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[var(--sublimes-gold)] mb-4 flex items-center">
                <span className="w-8 h-8 bg-[var(--sublimes-gold)]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[var(--sublimes-gold)] mr-3">5</span>
                Fees and Payments
              </h3>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  Certain services, such as creating listings or boosting visibility, may require payment. All applicable fees will be clearly disclosed to you before you complete a purchase. Payments are processed through our third-party payment provider (Stripe). By making a payment, you agree to their terms of service.
                </p>
                <p>
                  All fees are non-refundable except as explicitly stated in our Refund Policy.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[var(--sublimes-gold)] mb-4 flex items-center">
                <span className="w-8 h-8 bg-[var(--sublimes-gold)]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[var(--sublimes-gold)] mr-3">6</span>
                Intellectual Property
              </h3>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  The Platform and its original content (excluding User Content), features, and functionality are owned by Sublimes Drive and are protected by international copyright, trademark, and other intellectual property laws.
                </p>
                <p>
                  By posting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display your content in connection with the Platform.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[var(--sublimes-gold)] mb-4 flex items-center">
                <span className="w-8 h-8 bg-[var(--sublimes-gold)]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[var(--sublimes-gold)] mr-3">7</span>
                Disclaimers and Limitation of Liability
              </h3>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p className="font-semibold text-orange-400">
                  THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, WHETHER EXPRESS OR IMPLIED, INCLUDING THE WARRANTY OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                </p>
                <p className="font-semibold text-orange-400">
                  TO THE FULLEST EXTENT PERMITTED BY LAW, SUBLIMES DRIVE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, ARISING FROM YOUR USE OF THE PLATFORM.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[var(--sublimes-gold)] mb-4 flex items-center">
                <span className="w-8 h-8 bg-[var(--sublimes-gold)]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[var(--sublimes-gold)] mr-3">8</span>
                Governing Law
              </h3>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of the United Arab Emirates as applied in the Emirate of Dubai, without regard to its conflict of law principles.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[var(--sublimes-gold)] mb-4 flex items-center">
                <span className="w-8 h-8 bg-[var(--sublimes-gold)]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[var(--sublimes-gold)] mr-3">9</span>
                Changes to Terms
              </h3>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page. Your continued use of the Platform after any such change constitutes your acceptance of the new Terms.
                </p>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="bg-[var(--sublimes-dark-bg)] border-t border-[var(--sublimes-border)] p-6">
            <div className="text-center text-gray-400">
              <p>For questions about these Terms of Service, please contact us at legal@sublimesdrive.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}