import { useState } from 'react';
import { FileText, HelpCircle, Shield, RefreshCw, Users, Mail, Search, ArrowRight, ExternalLink, ChevronRight, Eye, ThumbsUp } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface LegalHubPageProps {
  onNavigate: (page: string) => void;
}

export function LegalHubPage({ onNavigate }: LegalHubPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const legalSections = [
    {
      id: 'faq',
      title: 'FAQ & Help',
      icon: HelpCircle,
      description: 'Frequently asked questions and help articles',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      articles: 50,
      support: '24/7',
      resolution: '95%',
      action: () => onNavigate('faq-knowledge-base')
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      icon: FileText,
      description: 'Our terms and conditions for using Sublimes Drive',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      action: () => onNavigate('terms-of-service')
    },
    {
      id: 'privacy',
      title: 'Privacy & Cookie Policy',
      icon: Shield,
      description: 'How we collect, use, and protect your personal information',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      action: () => onNavigate('privacy-policy')
    },
    {
      id: 'refund',
      title: 'Refund Policy',
      icon: RefreshCw,
      description: 'Information about refunds and cancellations',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      action: () => onNavigate('refund-policy')
    },
    {
      id: 'about',
      title: 'About Us',
      icon: Users,
      description: 'Learn more about Sublimes Drive and our mission',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      action: () => onNavigate('about-us')
    },
    {
      id: 'contact',
      title: 'Contact Us',
      icon: Mail,
      description: 'Get in touch with our support team',
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      action: () => {/* Contact functionality */}
    }
  ];

  const popularArticles = [
    {
      title: 'How to Get Verified',
      category: 'Getting Started',
      views: '12.5k',
      helpful: '98%'
    },
    {
      title: 'Post Your First Car Listing',
      category: 'Marketplace',
      views: '8.2k',
      helpful: '94%'
    },
    {
      title: 'Garage Verification Process',
      category: 'Garages',
      views: '6.1k',
      helpful: '96%'
    },
    {
      title: 'Payment & Billing Guide',
      category: 'Payments',
      views: '4.8k',
      helpful: '92%'
    },
    {
      title: 'Account Security Best Practices',
      category: 'Security',
      views: '3.9k',
      helpful: '97%'
    },
    {
      title: 'Community Guidelines',
      category: 'Community',
      views: '3.2k',
      helpful: '90%'
    }
  ];

  const socialLinks = [
    { name: 'TikTok', url: '#', icon: '📱' },
    { name: 'YouTube', url: '#', icon: '📺' }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Help Center</h1>
            <p className="text-xl opacity-90 mb-8">Find quick answers or chat with our AI assistant</p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-4 text-lg bg-white text-black border-0"
              />
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80">
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Help Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
              <div className="text-3xl font-bold mb-2">50+</div>
              <div className="text-muted-foreground">Help Articles</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-green-500" />
              </div>
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-muted-foreground">AI Support</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Badge className="h-8 w-8 bg-purple-500 text-white flex items-center justify-center rounded-full">
                  ★
                </Badge>
              </div>
              <div className="text-3xl font-bold mb-2">95%</div>
              <div className="text-muted-foreground">Resolution Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Legal Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {legalSections.map((section) => (
            <Card 
              key={section.id} 
              className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={section.action}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${section.bgColor} group-hover:scale-110 transition-transform`}>
                    <section.icon className={`h-6 w-6 ${section.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2 group-hover:text-[var(--sublimes-gold)] transition-colors">
                      {section.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {section.description}
                    </p>
                    <div className="flex items-center text-sm text-[var(--sublimes-gold)]">
                      <span>Learn more</span>
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Popular Articles */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <span className="mr-3">📈</span>
            Popular Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularArticles.slice(0, 4).map((article, index) => (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-all duration-200 cursor-pointer group bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]"
                onClick={() => onNavigate('faq-knowledge-base')}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-500/10 text-blue-500 px-3 py-1">
                        {article.category}
                      </Badge>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[var(--sublimes-gold)] group-hover:translate-x-1 transition-all" />
                    </div>
                    
                    <h3 className="font-semibold text-lg group-hover:text-[var(--sublimes-gold)] transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{article.views.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{article.helpful}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button 
              className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/90"
              onClick={() => onNavigate('faq-knowledge-base')}
            >
              View All Articles
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Contact & Social */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-medium">Email Support</div>
                    <div className="text-sm text-muted-foreground">support@sublimesdrive.com</div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-medium">Live Chat</div>
                    <div className="text-sm text-muted-foreground">Available 24/7</div>
                  </div>
                  <Button size="sm" className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80">
                    Chat Now
                  </Button>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-medium">Phone Support</div>
                    <div className="text-sm text-muted-foreground">+971 4 123 4567</div>
                  </div>
                  <Button size="sm" variant="outline">
                    Call
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Follow Us */}
          <Card>
            <CardHeader>
              <CardTitle>Follow Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {socialLinks.map((social, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{social.icon}</span>
                    <div>
                      <div className="font-medium">{social.name}</div>
                      <div className="text-sm text-muted-foreground">Follow for updates</div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {/* Language Selection */}
              <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Language</div>
                    <div className="text-sm text-muted-foreground">Choose your preferred language</div>
                  </div>
                  <select className="bg-transparent border border-border rounded px-3 py-1">
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Powered by Sublimes Drive © 2025
          </p>
        </div>
      </div>
    </div>
  );
}