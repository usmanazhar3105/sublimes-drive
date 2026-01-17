/**
 * LegalTabContent - Legal & Information Tab for Profile Page
 * Fetches content from database with admin management
 */

import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { 
  HelpCircle, FileText, Shield, DollarSign, Info, 
  ExternalLink, Mail, Phone, Clock, Loader2 
} from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';
import { copyToClipboard } from '../../utils/clipboard';

interface LegalTabContentProps {
  onNavigate?: (page: string) => void;
}

interface SupportInfo {
  email_support: string;
  phone_support: string;
  response_time: string;
  business_hours?: any;
  social_media?: any;
  office_address?: string;
}

const legalSections = [
  {
    id: 'faq',
    title: 'FAQ & Help',
    description: 'Get help and find answers',
    icon: HelpCircle,
    iconColor: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    route: 'faq-knowledge-base'
  },
  {
    id: 'terms',
    title: 'Terms of Service',
    description: 'Our terms and conditions',
    icon: FileText,
    iconColor: 'text-green-400',
    bgColor: 'bg-green-500/10',
    route: 'terms-of-service'
  },
  {
    id: 'privacy',
    title: 'Privacy & Cookie Policy',
    description: 'How we protect your data',
    icon: Shield,
    iconColor: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    route: 'privacy-policy'
  },
  {
    id: 'refund',
    title: 'Refund Policy',
    description: 'Information about refunds',
    icon: DollarSign,
    iconColor: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    route: 'refund-policy'
  },
  {
    id: 'about',
    title: 'About Us',
    description: 'Learn about Sublimes Drive',
    icon: Info,
    iconColor: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    route: 'about-us'
  }
];

export function LegalTabContent({ onNavigate }: LegalTabContentProps) {
  const [supportInfo, setSupportInfo] = useState<SupportInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupportInfo();
  }, []);

  const fetchSupportInfo = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('support_information')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching support info:', error);
        // Use default values if not found
        setSupportInfo({
          email_support: 'support@sublimesdrive.com',
          phone_support: '+971 50 353 0121',
          response_time: 'Within 24h'
        });
      } else {
        setSupportInfo(data);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setSupportInfo({
        email_support: 'support@sublimesdrive.com',
        phone_support: '+971 50 353 0121',
        response_time: 'Within 24h'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyEmail = async () => {
    if (supportInfo?.email_support) {
      const success = await copyToClipboard(supportInfo.email_support);
      if (success) {
        toast.success('Email copied to clipboard!');
      } else {
        toast.error('Failed to copy email');
      }
    }
  };

  const handleCopyPhone = async () => {
    if (supportInfo?.phone_support) {
      const success = await copyToClipboard(supportInfo.phone_support);
      if (success) {
        toast.success('Phone number copied to clipboard!');
      } else {
        toast.error('Failed to copy phone number');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Legal & Information Section */}
      <Card className="bg-[#0F1829] border-[#1A2332]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="h-5 w-5 text-[#D4AF37]" />
            <h3 className="text-lg text-[#E8EAED]">Legal & Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {legalSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => onNavigate?.(section.route)}
                  className="flex flex-col items-start p-4 sm:p-5 rounded-xl bg-[#1A2332] hover:bg-[#2A3342] border border-[#2A3342] hover:border-[#D4AF37]/50 transition-all group hover:scale-[1.02] hover:shadow-lg hover:shadow-[#D4AF37]/10"
                >
                  <div className={`${section.bgColor} p-3 rounded-lg mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-6 w-6 ${section.iconColor}`} />
                  </div>
                  <div className="text-left w-full">
                    <p className="text-[#E8EAED] group-hover:text-[#D4AF37] transition-colors mb-1.5 flex items-center justify-between">
                      <span>{section.title}</span>
                      <ExternalLink className="h-4 w-4 text-[#8B92A7] group-hover:text-[#D4AF37] transition-colors" />
                    </p>
                    <p className="text-sm text-[#8B92A7] leading-relaxed">{section.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Support Section */}
      <Card className="bg-[#0F1829] border-[#1A2332]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="h-5 w-5 text-[#D4AF37]" />
            <h3 className="text-lg text-[#E8EAED]">Support</h3>
          </div>

          <div className="space-y-4">
            {/* Email Support */}
            <div className="flex items-start justify-between p-4 rounded-lg bg-[#1A2332] border border-[#2A3342]">
              <div className="flex items-start gap-3">
                <div className="bg-blue-500/10 p-2 rounded-lg mt-0.5">
                  <Mail className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-[#8B92A7] mb-1">Email Support:</p>
                  <a 
                    href={`mailto:${supportInfo?.email_support}`}
                    className="text-[#D4AF37] hover:text-[#C19B2E] transition-colors"
                  >
                    {supportInfo?.email_support}
                  </a>
                </div>
              </div>
              <Button
                onClick={handleCopyEmail}
                variant="ghost"
                size="sm"
                className="text-[#8B92A7] hover:text-[#E8EAED]"
              >
                Copy
              </Button>
            </div>

            {/* Phone Support */}
            {supportInfo?.phone_support && (
              <div className="flex items-start justify-between p-4 rounded-lg bg-[#1A2332] border border-[#2A3342]">
                <div className="flex items-start gap-3">
                  <div className="bg-green-500/10 p-2 rounded-lg mt-0.5">
                    <Phone className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-[#8B92A7] mb-1">Phone:</p>
                    <a 
                      href={`tel:${supportInfo.phone_support}`}
                      className="text-[#D4AF37] hover:text-[#C19B2E] transition-colors"
                    >
                      {supportInfo.phone_support}
                    </a>
                  </div>
                </div>
                <Button
                  onClick={handleCopyPhone}
                  variant="ghost"
                  size="sm"
                  className="text-[#8B92A7] hover:text-[#E8EAED]"
                >
                  Copy
                </Button>
              </div>
            )}

            {/* Response Time */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-[#1A2332] border border-[#2A3342]">
              <div className="bg-orange-500/10 p-2 rounded-lg mt-0.5">
                <Clock className="h-4 w-4 text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-[#8B92A7] mb-1">Response Time:</p>
                <p className="text-[#E8EAED]">{supportInfo?.response_time}</p>
              </div>
            </div>

            {/* Office Address (if available) */}
            {supportInfo?.office_address && (
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <p className="text-sm text-blue-400 mb-1">Office Location:</p>
                <p className="text-[#E8EAED]">{supportInfo.office_address}</p>
              </div>
            )}
          </div>

          {/* Help Center Button */}
          <div className="mt-6 pt-6 border-t border-[#2A3342]">
            <Button
              onClick={() => onNavigate?.('faq-knowledge-base')}
              className="w-full bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0B1426]"
            >
              Visit Help Center
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-blue-500/30">
        <CardContent className="p-6">
          <h4 className="text-[#E8EAED] mb-4">Need Immediate Help?</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={() => window.open(`mailto:${supportInfo?.email_support}`, '_blank')}
              variant="outline"
              className="border-[#2A3342] text-[#E8EAED] hover:bg-[#2A3342]"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email Us
            </Button>
            <Button
              onClick={() => onNavigate?.('faq-knowledge-base')}
              variant="outline"
              className="border-[#2A3342] text-[#E8EAED] hover:bg-[#2A3342]"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Browse FAQ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
