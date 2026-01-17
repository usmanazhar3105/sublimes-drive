import { ArrowLeft, Shield, Calendar, Lock, Cookie, Eye, Database } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onNavigate: (page: string) => void;
}

export function PrivacyPolicyPage({ onNavigate }: PrivacyPolicyPageProps) {
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
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Privacy & Cookie Policy</h1>
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
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-b border-[var(--sublimes-border)] p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-8 h-8 text-[var(--sublimes-gold)]" />
              <div>
                <h2 className="text-2xl font-bold text-[var(--sublimes-light-text)]">Privacy & Cookie Policy</h2>
                <p className="text-gray-400">How we collect, use, and protect your information</p>
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
                  Sublimes Drive ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Platform. Please read this policy carefully.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[var(--sublimes-gold)] mb-4 flex items-center">
                <span className="w-8 h-8 bg-[var(--sublimes-gold)]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[var(--sublimes-gold)] mr-3">2</span>
                Information We Collect
              </h3>
              <div className="space-y-6 text-gray-300 leading-relaxed">
                <p>We may collect information about you in a variety of ways, including:</p>
                
                <div className="bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Database className="w-5 h-5 text-blue-500" />
                    <h4 className="font-semibold text-blue-400">Personal Data You Provide to Us</h4>
                  </div>
                  <p className="mb-3">We collect information you provide directly to us, such as when you create an account, create a listing, post a comment, or contact support. This may include:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Contact information (e.g., name, email, phone number).</li>
                    <li>Account details (e.g., username, password).</li>
                    <li>Profile information (e.g., car brand, car model, profile picture).</li>
                    <li>Content you create (e.g., posts, comments, listings, reviews).</li>
                    <li>Payment information for transactions.</li>
                  </ul>
                </div>

                <div className="bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Eye className="w-5 h-5 text-purple-500" />
                    <h4 className="font-semibold text-purple-400">Information We Collect Automatically</h4>
                  </div>
                  <p className="mb-3">When you use the Platform, we may automatically collect certain information, including:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Log and Usage Data:</strong> IP address, browser type, operating system, pages viewed, and timestamps.</li>
                    <li><strong>Device Information:</strong> Information about the computer or mobile device you use to access our Platform.</li>
                    <li><strong>Location Data:</strong> We may collect information about your location if you grant us permission.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[var(--sublimes-gold)] mb-4 flex items-center">
                <span className="w-8 h-8 bg-[var(--sublimes-gold)]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[var(--sublimes-gold)] mr-3">3</span>
                How We Use Your Information
              </h3>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>We use the information we collect for various purposes, including to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide, maintain, and improve our Platform.</li>
                  <li>Process your transactions and manage your orders.</li>
                  <li>Personalize your experience and display relevant content.</li>
                  <li>Communicate with you, including responding to your comments and questions.</li>
                  <li>Monitor and analyze trends, usage, and activities.</li>
                  <li>Detect and prevent fraudulent transactions and other illegal activities.</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[var(--sublimes-gold)] mb-4 flex items-center">
                <span className="w-8 h-8 bg-[var(--sublimes-gold)]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[var(--sublimes-gold)] mr-3">4</span>
                How We Share Your Information
              </h3>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>We may share your information in the following situations:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>With Other Users:</strong> Your profile information and content will be visible to other users of the Platform.</li>
                  <li><strong>With Service Providers:</strong> We share information with third-party vendors who perform services for us, such as payment processing and data analytics.</li>
                  <li><strong>For Legal Reasons:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities.</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[var(--sublimes-gold)] mb-4 flex items-center">
                <Cookie className="w-8 h-8 text-[var(--sublimes-gold)] mr-3" />
                Cookie Policy
              </h3>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-lg p-4">
                  <p className="mb-3">
                    Cookies are small data files stored on your hard drive or in device memory that help us improve our Platform and your experience. We use cookies to:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Understand and save your preferences for future visits.</li>
                    <li>Keep you signed in.</li>
                    <li>Compile aggregate data about site traffic and interactions.</li>
                  </ul>
                  <p className="mt-3">
                    You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Platform.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[var(--sublimes-gold)] mb-4 flex items-center">
                <span className="w-8 h-8 bg-[var(--sublimes-gold)]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[var(--sublimes-gold)] mr-3">6</span>
                Your Rights and Choices
              </h3>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>You have certain rights regarding your personal information, including the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access the personal information we hold about you.</li>
                  <li>Request that we correct any inaccurate information.</li>
                  <li>Request that we delete your personal information.</li>
                  <li>Opt-out of certain marketing communications.</li>
                </ul>
                <p>
                  You can review and update your account information at any time by logging into your account settings.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[var(--sublimes-gold)] mb-4 flex items-center">
                <Lock className="w-8 h-8 text-[var(--sublimes-gold)] mr-3" />
                Data Security
              </h3>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <p>
                    We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[var(--sublimes-gold)] mb-4 flex items-center">
                <span className="w-8 h-8 bg-[var(--sublimes-gold)]/10 rounded-lg flex items-center justify-center text-sm font-bold text-[var(--sublimes-gold)] mr-3">8</span>
                Contact Us
              </h3>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  If you have any questions or concerns about this Privacy Policy, please contact us at 
                  <a href="mailto:privacy@sublimesdrive.com" className="text-[var(--sublimes-gold)] hover:underline ml-1">
                    privacy@sublimesdrive.com
                  </a>.
                </p>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="bg-[var(--sublimes-dark-bg)] border-t border-[var(--sublimes-border)] p-6">
            <div className="text-center text-gray-400">
              <p>For questions about our Privacy Policy, please contact us at privacy@sublimesdrive.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}