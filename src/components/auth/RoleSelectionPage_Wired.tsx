/**
 * RoleSelectionPage - iOS-Style Compact
 */

import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { ArrowLeft, Shield, CheckCircle, Building, ChevronRight } from 'lucide-react';
import { useAnalytics } from '../../src/hooks';
// import bgImage from "figma:asset/..."; // TODO: Replace with actual asset
const bgImage = "/placeholder.png";

interface RoleSelectionPageProps {
  onNavigate: (page: string) => void;
}

export function RoleSelectionPage({ onNavigate }: RoleSelectionPageProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView('/role-selection');
  }, []);

  const handleRoleSelect = (role: string) => {
    setSelected(role);
    analytics.trackEvent('role_selected', { role });
    
    setTimeout(() => {
      if (role === 'browser') {
        onNavigate('home');
      } else if (role === 'car-owner') {
        onNavigate('verify-car-owner');
      } else {
        onNavigate('verify-garage-owner');
      }
    }, 300);
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/75" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('signup')}
          className="flex items-center gap-2 text-[#E8EAED] mb-6 hover:text-[#D4AF37] transition-colors"
        >
          <ArrowLeft size={20} />
          <span style={{ fontSize: '15px' }}>Back</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-[#E8EAED] mb-2" style={{ fontSize: '28px', fontWeight: 700 }}>
            Choose Your Role
          </h1>
          <p className="text-[#8B92A7]" style={{ fontSize: '14px' }}>
            Select how you'd like to use Sublimes Drive
          </p>
        </div>

        {/* Role Cards - Compact */}
        <div className="space-y-3 mb-6">
          {/* Car Browser */}
          <Card 
            onClick={() => handleRoleSelect('browser')}
            className="bg-[#1e293b]/95 backdrop-blur border-[#D4AF37] hover:bg-[#1e293b] cursor-pointer transition-all rounded-2xl"
            style={{ boxShadow: '0 4px 16px rgba(212, 175, 55, 0.2)' }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h3 className="text-[#E8EAED] mb-0.5" style={{ fontSize: '16px', fontWeight: 600 }}>
                      Car Browser
                    </h3>
                    <p className="text-[#8B92A7]" style={{ fontSize: '12px', lineHeight: '16px' }}>
                      Explore everything. Yellow badge.
                    </p>
                  </div>
                </div>
                <ChevronRight className="text-[#8B92A7]" size={20} />
              </div>
            </CardContent>
          </Card>

          {/* Car Owner */}
          <Card 
            onClick={() => handleRoleSelect('car-owner')}
            className="bg-[#1e293b]/95 backdrop-blur border-[#10b981] hover:bg-[#1e293b] cursor-pointer transition-all rounded-2xl"
            style={{ boxShadow: '0 4px 16px rgba(16, 185, 129, 0.2)' }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#10b981]/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-[#10b981]" />
                  </div>
                  <div>
                    <h3 className="text-[#E8EAED] mb-0.5" style={{ fontSize: '16px', fontWeight: 600 }}>
                      Car Owner
                    </h3>
                    <p className="text-[#8B92A7]" style={{ fontSize: '12px', lineHeight: '16px' }}>
                      Full access. Verify for green badge.
                    </p>
                  </div>
                </div>
                <ChevronRight className="text-[#8B92A7]" size={20} />
              </div>
            </CardContent>
          </Card>

          {/* Garage Owner */}
          <Card 
            onClick={() => handleRoleSelect('garage-owner')}
            className="bg-[#1e293b]/95 backdrop-blur border-[#3b82f6] hover:bg-[#1e293b] cursor-pointer transition-all rounded-2xl"
            style={{ boxShadow: '0 4px 16px rgba(59, 130, 246, 0.2)' }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#3b82f6]/20 flex items-center justify-center flex-shrink-0">
                    <Building className="w-5 h-5 text-[#3b82f6]" />
                  </div>
                  <div>
                    <h3 className="text-[#E8EAED] mb-0.5" style={{ fontSize: '16px', fontWeight: 600 }}>
                      Garage Owner
                    </h3>
                    <p className="text-[#8B92A7]" style={{ fontSize: '12px', lineHeight: '16px' }}>
                      Manage bids. Verify for blue badge.
                    </p>
                  </div>
                </div>
                <ChevronRight className="text-[#8B92A7]" size={20} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Why Verification Section - Compact */}
        <Card className="bg-[#1e293b]/95 backdrop-blur border-[#334155] rounded-2xl">
          <CardContent className="p-4">
            <h3 className="text-[#E8EAED] mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>
              Why verification?
            </h3>
            <ul className="space-y-1 text-[#8B92A7]" style={{ fontSize: '12px' }}>
              <li>• Earn trust and badges</li>
              <li>• Unlock features</li>
              <li>• Reduce spam and fraud</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
