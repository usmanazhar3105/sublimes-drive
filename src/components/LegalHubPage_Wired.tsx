/**
 * LegalHubPage_Wired - Database-connected Legal Hub
 * Uses: useAnalytics
 */

import { useState, useEffect } from 'react';
import { FileText, HelpCircle, Shield, RefreshCw, Users, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { useAnalytics } from '../hooks';

interface LegalHubPageProps {
  onNavigate: (page: string) => void;
}

export function LegalHubPage({ onNavigate }: LegalHubPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView('/legal-hub');
  }, []);

  const legalSections = [
    {
      id: 'faq',
      title: 'FAQ & Help',
      icon: HelpCircle,
      description: 'Frequently asked questions and help articles',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      action: () => onNavigate('faq')
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      icon: FileText,
      description: 'Our terms and conditions for using Sublimes Drive',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      action: () => onNavigate('terms')
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: Shield,
      description: 'How we collect, use, and protect your personal information',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      action: () => onNavigate('privacy')
    },
    {
      id: 'refund',
      title: 'Refund Policy',
      icon: RefreshCw,
      description: 'Information about refunds and cancellations',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      action: () => onNavigate('refund')
    },
    {
      id: 'about',
      title: 'About Us',
      icon: Users,
      description: 'Learn more about Sublimes Drive and our mission',
      color: 'text-[#D4AF37]',
      bgColor: 'bg-[#D4AF37]/10',
      action: () => onNavigate('about')
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B1426]">
      <div className="bg-[#0F1829] border-b border-[#1A2332]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-4xl text-[#E8EAED] mb-4" style={{ fontWeight: 600 }}>
            Legal Hub & Support
          </h1>
          <p className="text-[#8B92A7] mb-8 max-w-2xl mx-auto">
            Everything you need to know about using Sublimes Drive safely and securely
          </p>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8B92A7]" size={20} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search legal documents..."
                className="pl-12 bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {legalSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.id} className="bg-[#0F1829] border-[#1A2332] hover:border-[#D4AF37]/30 transition-all cursor-pointer" onClick={section.action}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl ${section.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={section.color} size={28} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl text-[#E8EAED] mb-2" style={{ fontWeight: 600 }}>
                        {section.title}
                      </h3>
                      <p className="text-[#8B92A7] mb-4">{section.description}</p>
                      <Button onClick={section.action} size="sm" variant="outline" className="border-[#1A2332] text-[#E8EAED]">
                        Read More
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
