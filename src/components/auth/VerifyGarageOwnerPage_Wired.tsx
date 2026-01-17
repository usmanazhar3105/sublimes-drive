/**
 * VerifyGarageOwnerPage_Wired - Database-connected Garage Owner Verification
 * Uses: useProfile, useAnalytics
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft, Upload, CheckCircle, Loader2, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { useProfile, useAnalytics } from '../../src/hooks';

interface VerifyGarageOwnerPageProps {
  onNavigate: (page: string) => void;
}

export function VerifyGarageOwnerPage({ onNavigate }: VerifyGarageOwnerPageProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    garageName: '',
    tradeLicense: '',
    location: '',
    phone: '',
    services: '',
  });

  const { updateProfile } = useProfile();
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView('/verify-garage-owner');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    analytics.trackEvent('garage_owner_verification_submitted', {
      garage_name: formData.garageName,
      location: formData.location,
    });

    const { error } = await updateProfile({
      role: 'garage-owner',
      verification_status: 'pending',
      garage_details: formData,
    });

    setSubmitting(false);

    if (!error) {
      setSubmitted(true);
      toast.success('Verification submitted! We will review within 24-48 hours.');
    } else {
      toast.error('Verification failed. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B1426]">
        <Card className="bg-[#0F1829] border-[#1A2332] max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-500" size={32} />
            </div>
            <h2 className="text-2xl text-[#E8EAED] mb-3" style={{ fontWeight: 600 }}>
              Verification Submitted!
            </h2>
            <p className="text-[#8B92A7] mb-6">
              We'll review your garage details within 24-48 hours and notify you via email.
            </p>
            <Button
              onClick={() => onNavigate('home')}
              className="w-full bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A037]"
            >
              Continue to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1426] p-4">
      <div className="max-w-2xl mx-auto py-8">
        <Button
          onClick={() => onNavigate('role-selection')}
          variant="ghost"
          className="mb-6 text-[#8B92A7] hover:text-[#E8EAED]"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back
        </Button>

        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center">
                <Wrench className="text-[#D4AF37]" size={24} />
              </div>
              <div>
                <CardTitle className="text-2xl text-[#E8EAED]">Verify Garage Ownership</CardTitle>
                <p className="text-[#8B92A7]">Provide your garage details for verification</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label className="text-[#E8EAED]">Garage Name *</Label>
                <Input
                  required
                  value={formData.garageName}
                  onChange={(e) => setFormData({ ...formData, garageName: e.target.value })}
                  className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                  placeholder="Elite Auto Service"
                />
              </div>

              <div>
                <Label className="text-[#E8EAED]">Trade License Number *</Label>
                <Input
                  required
                  value={formData.tradeLicense}
                  onChange={(e) => setFormData({ ...formData, tradeLicense: e.target.value })}
                  className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                  placeholder="123456"
                />
              </div>

              <div>
                <Label className="text-[#E8EAED]">Location *</Label>
                <Input
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                  placeholder="Dubai, Al Quoz Industrial Area"
                />
              </div>

              <div>
                <Label className="text-[#E8EAED]">Contact Phone *</Label>
                <Input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                  placeholder="+971 50 123 4567"
                />
              </div>

              <div>
                <Label className="text-[#E8EAED]">Services Offered *</Label>
                <Input
                  required
                  value={formData.services}
                  onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                  className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                  placeholder="General Repair, Oil Change, Tire Service"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A037]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={20} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2" size={20} />
                    Submit Verification
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
