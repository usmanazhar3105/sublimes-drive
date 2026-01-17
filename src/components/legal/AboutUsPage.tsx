import { ArrowLeft, Heart, Users, CheckCircle, Star, Mail, Phone, Instagram, Youtube, Facebook } from 'lucide-react';
// Banner image - imported from Figma asset
// import bannerImage from "figma:asset/..."; // TODO: Replace with actual asset
const bannerImage = "/placeholder.png";

interface AboutUsPageProps {
  onNavigate: (page: string) => void;
}

export function AboutUsPage({ onNavigate }: AboutUsPageProps) {
  return (
    <div className="min-h-screen bg-[var(--sublimes-dark-bg)] text-[var(--sublimes-light-text)]">
      {/* Header */}
      <div className="bg-[var(--sublimes-card-bg)] border-b border-[var(--sublimes-border)] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onNavigate('legal-hub')}
              className="p-2 hover:bg-[var(--sublimes-dark-bg)] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[var(--sublimes-gold)]/10 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-[var(--sublimes-gold)]" />
              </div>
              <div>
                <h1 className="text-xl font-bold">About Sublimes Drive</h1>
                <p className="text-sm text-gray-400">The UAE's Premier Hub for Chinese Car Enthusiasts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Banner - Using uploaded image */}
      <div className="relative">
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img 
            src={bannerImage} 
            alt="Sublimes Drive Banner" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
          <div className="absolute inset-0 flex items-start justify-start px-6 md:px-12 py-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                About Sublimes Drive
              </h2>
              <p className="text-lg md:text-xl text-gray-100">
                The UAE's Premier Hub for Chinese Car Enthusiasts
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Our Journey */}
            <section className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6 md:p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-[var(--sublimes-light-text)]">Our Journey</h3>
              </div>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  Sublimes Drive was born from a simple observation: Chinese car owners in the UAE needed a dedicated space to connect, share experiences, and access specialized services for their vehicles.
                </p>
                <p>
                  What started as a small community has grown into the UAE's most comprehensive platform for Chinese automotive enthusiasts, bringing together car owners, verified garages, and service providers under one roof.
                </p>
                <p>
                  Today, we're proud to serve thousands of members across all seven emirates, facilitating connections, enabling transactions, and building the automotive community of tomorrow.
                </p>
              </div>
            </section>

            {/* Core Values */}
            <section className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6 md:p-8">
              <h3 className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-6">What We Stand For</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Users className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-green-400 mb-2">Community First</h4>
                      <p className="text-gray-300 text-sm">Connect with fellow Chinese car enthusiasts across the UAE</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-400 mb-2">Verified Services</h4>
                      <p className="text-gray-300 text-sm">Access trusted, verified garages and service providers</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-[var(--sublimes-gold)]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Star className="w-5 h-5 text-[var(--sublimes-gold)]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--sublimes-gold)] mb-2">Quality Focus</h4>
                      <p className="text-gray-300 text-sm">Premium experiences and genuine part sourcing</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Heart className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-purple-400 mb-2">UAE-Wide</h4>
                      <p className="text-gray-300 text-sm">Serving all seven emirates with local expertise</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Call to Action */}
            <section className="bg-gradient-to-r from-[var(--sublimes-gold)]/10 to-blue-500/10 border border-[var(--sublimes-gold)]/20 rounded-xl p-6 md:p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-4">
                  Ready to Join Our Community?
                </h3>
                <p className="text-gray-300 mb-6">
                  Connect with thousands of Chinese car enthusiasts and discover premium automotive services
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button 
                    onClick={() => onNavigate('communities')}
                    className="px-6 py-3 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] rounded-lg font-semibold hover:bg-[var(--sublimes-gold)]/90 transition-colors"
                  >
                    Explore Communities
                  </button>
                  <button 
                    onClick={() => onNavigate('garage-hub')}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                  >
                    Find Garages
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
              <h3 className="text-xl font-bold text-[var(--sublimes-light-text)] mb-4">Get in Touch</h3>
              <div className="space-y-4">
                <h4 className="font-semibold text-[var(--sublimes-gold)] text-sm uppercase tracking-wide">Contact Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <a href="mailto:info@sublimesdrive.com" className="text-[var(--sublimes-light-text)] hover:text-[var(--sublimes-gold)] transition-colors">
                        info@sublimesdrive.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-400">Phone</p>
                      <a href="tel:+971503530121" className="text-[var(--sublimes-light-text)] hover:text-[var(--sublimes-gold)] transition-colors">
                        +971 50 353 0121
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
              <h4 className="font-semibold text-[var(--sublimes-gold)] text-sm uppercase tracking-wide mb-4">Follow Us</h4>
              <div className="space-y-3">
                <a 
                  href="https://www.facebook.com/Sublimesdrive/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-[var(--sublimes-light-text)] hover:text-[var(--sublimes-gold)] transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                  <span>Facebook</span>
                </a>
                <a href="#" className="flex items-center space-x-3 text-[var(--sublimes-light-text)] hover:text-pink-400 transition-colors">
                  <Instagram className="w-5 h-5" />
                  <span>Instagram</span>
                </a>
                <a href="#" className="flex items-center space-x-3 text-[var(--sublimes-light-text)] hover:text-blue-400 transition-colors">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <span className="text-sm">🎵</span>
                  </div>
                  <span>TikTok</span>
                </a>
                <a href="#" className="flex items-center space-x-3 text-[var(--sublimes-light-text)] hover:text-red-400 transition-colors">
                  <Youtube className="w-5 h-5" />
                  <span>YouTube</span>
                </a>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
              <h4 className="font-semibold text-[var(--sublimes-gold)] text-sm uppercase tracking-wide mb-4">Our Community</h4>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--sublimes-light-text)]">15,000+</div>
                  <div className="text-sm text-gray-400">Active Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--sublimes-light-text)]">500+</div>
                  <div className="text-sm text-gray-400">Verified Garages</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--sublimes-light-text)]">7</div>
                  <div className="text-sm text-gray-400">Emirates Covered</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}