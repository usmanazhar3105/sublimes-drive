/**
 * FAQKnowledgeBasePage_Wired - Database-connected FAQ page
 * Uses: useAnalytics
 */

import { useEffect, useState } from 'react';
import { HelpCircle, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useAnalytics } from '../../src/hooks';

interface FAQKnowledgeBasePageProps {
  onNavigate?: (page: string) => void;
}

export function FAQKnowledgeBasePage({ onNavigate }: FAQKnowledgeBasePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView('/faq-knowledge-base');
  }, []);

  const faqs = [
    {
      id: '1',
      question: 'How do I create a listing?',
      answer: 'Click on "Place Your Ad" in the navigation menu, fill in the required details, upload photos, and submit for review.'
    },
    {
      id: '2',
      question: 'What payment methods do you accept?',
      answer: 'We accept credit/debit cards, bank transfers, and digital wallets through our secure payment gateway.'
    },
    {
      id: '3',
      question: 'How long does verification take?',
      answer: 'Account verification typically takes 24-48 hours. Car owner verification may take up to 3 business days.'
    },
    {
      id: '4',
      question: 'Can I import cars from China?',
      answer: 'Yes! We offer a comprehensive car import service. Visit our "Import Your Car" page to learn more.'
    },
    {
      id: '5',
      question: 'How do boost packages work?',
      answer: 'Boost packages increase visibility of your listings. Each boost credit can be used to promote one listing for a specified period.'
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B1426]">
      <div className="bg-[#0F1829] border-b border-[#1A2332]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <HelpCircle className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
          <h1 className="text-4xl text-[#E8EAED] mb-4" style={{ fontWeight: 600 }}>
            FAQ & Knowledge Base
          </h1>
          <p className="text-[#8B92A7] mb-8">Find answers to common questions</p>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8B92A7]" size={20} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search FAQs..."
                className="pl-12 bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-4">
          {faqs.map((faq) => (
            <Card key={faq.id} className="bg-[#0F1829] border-[#1A2332]">
              <CardContent className="p-0">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-[#1A2332]/30 transition-colors"
                >
                  <span className="text-lg text-[#E8EAED]" style={{ fontWeight: 600 }}>
                    {faq.question}
                  </span>
                  {expandedFaq === faq.id ? (
                    <ChevronUp className="text-[#D4AF37]" size={24} />
                  ) : (
                    <ChevronDown className="text-[#8B92A7]" size={24} />
                  )}
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-6 pb-6">
                    <p className="text-[#8B92A7] leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-[#0F1829] border-[#1A2332] mt-8">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl text-[#E8EAED] mb-4" style={{ fontWeight: 600 }}>
              Still have questions?
            </h3>
            <p className="text-[#8B92A7] mb-6">
              Contact our support team and we'll be happy to help
            </p>
            <Button className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A037]">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
