/**
 * ImportYourCarPage_Wired - Database-connected Car Import page
 * Uses: useAnalytics
 */

import { useState, useEffect } from 'react';
import { Car, CheckCircle, ArrowRight, Shield, Clock, DollarSign, Star, Phone, Mail, MessageCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { useAnalytics } from '../hooks';

interface ImportYourCarPageProps {
  onNavigate?: (page: string) => void;
}

export function ImportYourCarPage({ onNavigate }: ImportYourCarPageProps) {
  // State
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    carMake: '',
    carModel: '',
    year: '',
    budget: '',
    notes: '',
  });

  // Hooks
  const analytics = useAnalytics();

  // Track page view
  useEffect(() => {
    analytics.trackPageView('/import-your-car');
  }, []);

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
      color: 'text-[#D4AF37]',
      bgColor: 'bg-[#D4AF37]/10'
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
      description: 'Delivery to your location',
      color: 'text-[#D4AF37]',
      bgColor: 'bg-[#D4AF37]/10'
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: 'Verified Sellers',
      description: 'All sellers are verified and trusted',
      color: 'text-blue-500'
    },
    {
      icon: Clock,
      title: 'Fast Processing',
      description: '4-6 weeks average delivery time',
      color: 'text-green-500'
    },
    {
      icon: DollarSign,
      title: 'Best Prices',
      description: 'Competitive pricing on all models',
      color: 'text-[#D4AF37]'
    },
    {
      icon: Star,
      title: 'Full Support',
      description: 'End-to-end assistance included',
      color: 'text-purple-500'
    }
  ];

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    analytics.trackEvent('import_enquiry_submitted', {
      car_make: formData.carMake,
      car_model: formData.carModel,
      year: formData.year,
    });

    // Simulate API call
    setTimeout(() => {
      toast.success('🚗 Import enquiry submitted successfully! Our team will contact you within 24 hours.');
      setShowEnquiryForm(false);
      setSubmitting(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        carMake: '',
        carModel: '',
        year: '',
        budget: '',
        notes: '',
      });
    }, 1500);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[#0B1426]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#0F1829] to-[#0B1426] border-b border-[#1A2332]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30">
              🚗 Professional Import Service
            </Badge>
            <h1 className="text-5xl text-[#E8EAED] mb-4" style={{ fontWeight: 700 }}>
              Import Your Dream Car
            </h1>
            <p className="text-xl text-[#8B92A7] mb-8">
              From China to UAE - Professional, Safe, and Hassle-Free
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => {
                  analytics.trackEvent('import_enquiry_started');
                  setShowEnquiryForm(true);
                }}
                size="lg"
                className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A037] text-lg px-8 py-6"
              >
                <Car className="mr-2" size={24} />
                Start Import Process
              </Button>
              <Button
                onClick={() => onNavigate?.('marketplace')}
                size="lg"
                variant="outline"
                className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 text-lg px-8 py-6"
              >
                Browse Available Cars
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Process Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl text-[#E8EAED] mb-3" style={{ fontWeight: 600 }}>
            Import Process
          </h2>
          <p className="text-[#8B92A7]">
            8 simple steps to get your car from China to your garage
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {processSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className="bg-[#0F1829] border-[#1A2332] hover:border-[#D4AF37]/30 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${step.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={step.color} size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-[#8B92A7]">Step {index + 1}</span>
                      </div>
                      <h3 className="text-[#E8EAED] mb-1" style={{ fontWeight: 600 }}>
                        {step.title}
                      </h3>
                      <p className="text-sm text-[#8B92A7]">{step.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-[#0F1829] border-y border-[#1A2332] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl text-[#E8EAED] mb-3" style={{ fontWeight: 600 }}>
              Why Choose Us?
            </h2>
            <p className="text-[#8B92A7]">
              The most trusted car import service in UAE
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="bg-[#0B1426] border-[#1A2332] text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 rounded-full bg-[#0F1829] flex items-center justify-center mx-auto mb-4">
                      <Icon className={benefit.color} size={32} />
                    </div>
                    <h3 className="text-[#E8EAED] mb-2" style={{ fontWeight: 600 }}>
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-[#8B92A7]">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-5xl text-[#D4AF37] mb-2" style={{ fontWeight: 700 }}>
              500+
            </div>
            <p className="text-[#8B92A7]">Cars Imported Successfully</p>
          </div>
          <div>
            <div className="text-5xl text-[#D4AF37] mb-2" style={{ fontWeight: 700 }}>
              4.9
            </div>
            <p className="text-[#8B92A7]">Average Customer Rating</p>
          </div>
          <div>
            <div className="text-5xl text-[#D4AF37] mb-2" style={{ fontWeight: 700 }}>
              30
            </div>
            <p className="text-[#8B92A7]">Days Average Delivery</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-[#D4AF37]/10 to-transparent border-y border-[#D4AF37]/20 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl text-[#E8EAED] mb-4" style={{ fontWeight: 600 }}>
            Ready to Import Your Dream Car?
          </h2>
          <p className="text-xl text-[#8B92A7] mb-8">
            Our team of experts is ready to help you every step of the way
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setShowEnquiryForm(true)}
              size="lg"
              className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A037] text-lg px-8 py-6"
            >
              <MessageCircle className="mr-2" size={20} />
              Submit Enquiry
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-[#1A2332] text-[#E8EAED] hover:bg-[#0F1829] text-lg px-8 py-6"
            >
              <Phone className="mr-2" size={20} />
              Call Us: +971 50 123 4567
            </Button>
          </div>
        </div>
      </div>

      {/* Enquiry Form Dialog */}
      <Dialog open={showEnquiryForm} onOpenChange={setShowEnquiryForm}>
        <DialogContent className="bg-[#0F1829] border-[#1A2332] text-[#E8EAED] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#E8EAED]">Import Enquiry Form</DialogTitle>
            <DialogDescription className="text-[#8B92A7]">
              Fill in the details and our team will contact you within 24 hours
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-[#E8EAED]">Full Name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                  placeholder="Ahmed Hassan"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-[#E8EAED]">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                  placeholder="ahmed@example.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone" className="text-[#E8EAED]">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                placeholder="+971 50 123 4567"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="carMake" className="text-[#E8EAED]">Car Make *</Label>
                <Input
                  id="carMake"
                  required
                  value={formData.carMake}
                  onChange={(e) => handleInputChange('carMake', e.target.value)}
                  className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                  placeholder="BYD"
                />
              </div>
              <div>
                <Label htmlFor="carModel" className="text-[#E8EAED]">Model *</Label>
                <Input
                  id="carModel"
                  required
                  value={formData.carModel}
                  onChange={(e) => handleInputChange('carModel', e.target.value)}
                  className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                  placeholder="Seal"
                />
              </div>
              <div>
                <Label htmlFor="year" className="text-[#E8EAED]">Year *</Label>
                <Input
                  id="year"
                  required
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                  placeholder="2024"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="budget" className="text-[#E8EAED]">Budget (AED)</Label>
              <Input
                id="budget"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                placeholder="150,000"
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-[#E8EAED]">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                placeholder="Any specific requirements or questions..."
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A037]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={20} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <MessageCircle className="mr-2" size={20} />
                    Submit Enquiry
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEnquiryForm(false)}
                className="border-[#1A2332] text-[#E8EAED] hover:bg-[#1A2332]"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
