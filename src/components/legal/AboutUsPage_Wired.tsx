/**
 * AboutUsPage_Wired - Database-connected About Us page
 * Uses: useAnalytics
 */

import { useEffect } from 'react';
import { Target, Heart, Award, Facebook } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { useAnalytics } from '../../src/hooks';
// import bannerImage from "figma:asset/..."; // TODO: Replace with actual asset
const bannerImage = "/placeholder.png";

interface AboutUsPageProps {
  onNavigate?: (page: string) => void;
}

export function AboutUsPage({ onNavigate }: AboutUsPageProps) {
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView('/about-us');
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1426]">
      {/* Banner Section with Image and Text */}
      <div className="relative bg-[#0F1829] border-b border-[#1A2332] overflow-hidden">
        {/* Banner Image */}
        <div className="absolute inset-0">
          <img 
            src={bannerImage} 
            alt="Sublimes Drive Banner" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Text Content - Left Aligned */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl text-[#E8EAED] mb-4" style={{ fontWeight: 600 }}>
              About Sublimes Drive
            </h1>
            <p className="text-lg sm:text-xl text-[#E8EAED]/90">
              The ultimate platform for Chinese car enthusiasts in the UAE
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="bg-[#0F1829] border-[#1A2332] mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl text-[#E8EAED] mb-4" style={{ fontWeight: 600 }}>
              Our Mission
            </h2>
            <p className="text-[#8B92A7] leading-relaxed">
              Sublimes Drive was founded with a simple mission: to create the most comprehensive and user-friendly platform for Chinese car enthusiasts in the UAE. We connect buyers, sellers, and service providers in one seamless ecosystem.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-[#0F1829] border-[#1A2332] text-center">
            <CardContent className="p-6">
              <Target className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
              <h3 className="text-lg text-[#E8EAED] mb-2" style={{ fontWeight: 600 }}>Our Vision</h3>
              <p className="text-sm text-[#8B92A7]">
                To be the #1 platform for Chinese cars in the Middle East
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#0F1829] border-[#1A2332] text-center">
            <CardContent className="p-6">
              <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg text-[#E8EAED] mb-2" style={{ fontWeight: 600 }}>Our Values</h3>
              <p className="text-sm text-[#8B92A7]">
                Trust, community, and passion for automobiles
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#0F1829] border-[#1A2332] text-center">
            <CardContent className="p-6">
              <Award className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg text-[#E8EAED] mb-2" style={{ fontWeight: 600 }}>Our Commitment</h3>
              <p className="text-sm text-[#8B92A7]">
                Providing the best experience for every user
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-8">
            <h2 className="text-2xl text-[#E8EAED] mb-4" style={{ fontWeight: 600 }}>
              Contact Us
            </h2>
            <div className="space-y-3 text-[#8B92A7]">
              <p>Email: info@sublimesdrive.com</p>
              <p>Phone: +971 50 123 4567</p>
              <p>Address: Dubai, UAE</p>
              <div className="pt-2 flex items-center space-x-2">
                <Facebook className="w-5 h-5 text-[#D4AF37]" />
                <a 
                  href="https://www.facebook.com/Sublimesdrive/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#D4AF37] hover:text-[#D4AF37]/80 transition-colors"
                >
                  facebook.com/Sublimesdrive
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
