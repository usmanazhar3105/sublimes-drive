import { useState } from 'react';
import { Car, CheckCircle, ArrowRight, Shield, Clock, DollarSign, Star, Phone, Mail, MessageCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';

interface ImportYourCarPageProps {
  onNavigate?: (page: string) => void;
}

export function ImportYourCarPage({ onNavigate }: ImportYourCarPageProps = {}) {
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted');
    toast.success('🚗 Import enquiry submitted successfully! Our team will contact you within 24 hours.');
    setShowEnquiryForm(false);
  };

  const processSteps = [
    {
      icon: Car,
      title: 'Select Your Car',
      description: 'Choose from hundreds of models',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: CheckCircle,
      title: 'Test Report',
      description: 'Professional inspection report',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      icon: Shield,
      title: 'Agreement',
      description: 'Secure purchase agreement',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      icon: DollarSign,
      title: 'Purchase',
      description: 'Complete your payment',
      color: 'text-[var(--sublimes-gold)]',
      bgColor: 'bg-[var(--sublimes-gold)]/10'
    },
    {
      icon: Car,
      title: 'Modifications',
      description: 'Custom modifications if needed',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    },
    {
      icon: ArrowRight,
      title: 'Shipping',
      description: 'Safe transport to UAE',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      icon: CheckCircle,
      title: 'UAE Conversion',
      description: 'RTA registration process',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10'
    },
    {
      icon: Star,
      title: 'Final Inspection',
      description: 'Quality check & delivery',
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10'
    }
  ];

  const services = [
    {
      icon: DollarSign,
      title: 'Cost Savings',
      description: 'Typically 20-40% cheaper than UAE showroom prices',
      color: 'text-green-500'
    },
    {
      icon: Shield,
      title: 'Warranty Options',
      description: 'Choose from 3, 5, or 8 year warranty packages',
      color: 'text-blue-500'
    },
    {
      icon: Car,
      title: 'Customization',
      description: 'Body kits, modifications, and personalization available',
      color: 'text-purple-500'
    },
    {
      icon: Star,
      title: 'UAE Bank Finance',
      description: 'Available at best rates, hassle free financing options',
      color: 'text-[var(--sublimes-gold)]'
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      {/* Hero Banner */}
      <div className="relative">
        <div className="h-48 md:h-64 relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">Import Your Dream Car</h1>
              <p className="text-sm md:text-xl opacity-90">Get your dream car from anywhere in the world, delivered to your doorstep in UAE</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Process Steps */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Step by Step Process</h2>
            <p className="text-muted-foreground text-lg">We handle everything from selection to delivery</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, index) => (
              <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${step.bgColor} flex items-center justify-center`}>
                    <step.icon className={`h-8 w-8 ${step.color}`} />
                  </div>
                  
                  <div className="absolute top-4 right-4">
                    <Badge variant="outline" className="text-xs">
                      {index + 1}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                  
                  {index < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2">
                      <ArrowRight className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Services Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">More Details About Our Services</h2>
            <p className="text-muted-foreground text-lg">Why choose our car import service</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg bg-gray-100 dark:bg-gray-800`}>
                      <service.icon className={`h-8 w-8 ${service.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                      <p className="text-muted-foreground">{service.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-[var(--sublimes-gold)] mb-2">500+</div>
              <div className="text-sm text-muted-foreground">Cars Imported</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-[var(--sublimes-gold)] mb-2">95%</div>
              <div className="text-sm text-muted-foreground">Customer Satisfaction</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-[var(--sublimes-gold)] mb-2">30</div>
              <div className="text-sm text-muted-foreground">Countries Covered</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-[var(--sublimes-gold)] mb-2">15</div>
              <div className="text-sm text-muted-foreground">Years Experience</div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Banner */}
        <Card className="bg-gradient-to-r from-[var(--sublimes-gold)] to-yellow-500 text-black">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Import Your Dream Car?</h2>
            <p className="text-lg mb-8 opacity-90">
              Submit an enquiry and our experts will provide you with a detailed quote and timeline.
            </p>
            
            <Dialog open={showEnquiryForm} onOpenChange={setShowEnquiryForm}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="bg-black text-white hover:bg-gray-800 px-8 py-4 text-lg"
                >
                  Start Your Import Journey
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col sm:max-h-[85vh]">
                <DialogHeader className="flex-shrink-0">
                  <div className="flex items-center gap-2 md:hidden mb-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setShowEnquiryForm(false)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-lg font-semibold">Car Import Enquiry</span>
                  </div>
                  <DialogTitle className="hidden md:block">Car Import Enquiry</DialogTitle>
                  <DialogDescription>
                    Fill out this form to get a detailed quote for importing your dream car to the UAE. Our team will review your requirements and provide a customized proposal within 24 hours.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="flex-1 overflow-y-auto pr-2">
                  <form className="space-y-6 pb-4" onSubmit={handleFormSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input id="firstName" placeholder="Enter your first name" className="h-12 sm:h-10" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input id="lastName" placeholder="Enter your last name" className="h-12 sm:h-10" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" placeholder="Enter your email" className="h-12 sm:h-10" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input id="phone" placeholder="+971 XX XXX XXXX" className="h-12 sm:h-10" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="carMake">Car Make *</Label>
                      <Select>
                        <SelectTrigger className="h-12 sm:h-10">
                          <SelectValue placeholder="Select car make" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="byd">BYD</SelectItem>
                          <SelectItem value="nio">NIO</SelectItem>
                          <SelectItem value="xpeng">XPeng</SelectItem>
                          <SelectItem value="li-auto">Li Auto</SelectItem>
                          <SelectItem value="geely">Geely</SelectItem>
                          <SelectItem value="haval">Great Wall Haval</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="carModel">Car Model *</Label>
                      <Input id="carModel" placeholder="e.g., M3, C63, RS6" className="h-12 sm:h-10" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="yearRange">Year Range</Label>
                      <Select>
                        <SelectTrigger className="h-12 sm:h-10">
                          <SelectValue placeholder="Select year range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2023">2023</SelectItem>
                          <SelectItem value="2022">2022</SelectItem>
                          <SelectItem value="2021">2021</SelectItem>
                          <SelectItem value="2020">2020</SelectItem>
                          <SelectItem value="older">2019 and older</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="budget">Budget Range (AED)</Label>
                      <Select>
                        <SelectTrigger className="h-12 sm:h-10">
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="50k-100k">AED 50,000 - 100,000</SelectItem>
                          <SelectItem value="100k-200k">AED 100,000 - 200,000</SelectItem>
                          <SelectItem value="200k-500k">AED 200,000 - 500,000</SelectItem>
                          <SelectItem value="500k+">AED 500,000+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="countryOfOrigin">Country of Origin</Label>
                    <Select>
                      <SelectTrigger className="h-12 sm:h-10">
                        <SelectValue placeholder="Where would you like to import from?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usa">United States</SelectItem>
                        <SelectItem value="germany">Germany</SelectItem>
                        <SelectItem value="japan">Japan</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="canada">Canada</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="additionalRequirements">Additional Requirements</Label>
                    <Textarea 
                      id="additionalRequirements" 
                      placeholder="Tell us about any specific requirements, modifications, or questions you have..."
                      rows={4}
                      className="min-h-[100px] resize-none"
                    />
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">What happens next?</h4>
                    <ul className="text-sm space-y-1">
                      <li>✅ Our team will review your requirements</li>
                      <li>✅ We'll provide a detailed quote within 24 hours</li>
                      <li>✅ Free consultation with our import specialist</li>
                      <li>✅ No obligation - completely free service</li>
                    </ul>
                  </div>
                  
                    <div className="flex gap-3 sticky bottom-0 bg-background pt-4 mt-6 border-t">
                      <Button type="button" variant="outline" onClick={() => setShowEnquiryForm(false)} className="flex-1 md:flex-none">
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80 flex-1 md:flex-none">
                        Submit Enquiry
                      </Button>
                    </div>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-4">Need More Information?</h3>
          <p className="text-muted-foreground mb-8">Our team is here to help you with any questions</p>
          
          <div className="flex justify-center space-x-6">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => {
                window.open('tel:+971501234567', '_self');
                toast.info('📞 Calling +971 50 123 4567...');
              }}
            >
              <Phone className="h-4 w-4" />
              Call Us
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => {
                window.open('mailto:import@sublimesdrive.com?subject=Car Import Inquiry', '_blank');
                toast.info('📧 Opening email client...');
              }}
            >
              <Mail className="h-4 w-4" />
              Email Us
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => {
                onNavigate?.('ai-chat-assistant');
                toast.info('🤖 Starting AI Chat Assistant...');
              }}
            >
              <MessageCircle className="h-4 w-4" />
              Live Chat
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}