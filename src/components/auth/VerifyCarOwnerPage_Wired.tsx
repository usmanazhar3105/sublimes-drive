/**
 * VerifyCarOwnerPage_Wired - Database-connected Car Owner Verification
 * Uses: useProfile, useAnalytics
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft, Upload, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useProfile, useAnalytics } from '../../src/hooks';

interface VerifyCarOwnerPageProps {
  onNavigate: (page: string) => void;
}

export function VerifyCarOwnerPage({ onNavigate }: VerifyCarOwnerPageProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    plateNumber: '',
    vinNumber: '',
    emirate: 'Dubai',
  });

  const { updateProfile } = useProfile();
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView('/verify-car-owner');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    analytics.trackEvent('car_owner_verification_submitted', {
      brand: formData.brand,
      model: formData.model,
      year: formData.year,
    });

    const { error } = await updateProfile({
      role: 'car-owner',
      verification_status: 'pending',
      car_details: formData,
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
              We'll review your documents within 24-48 hours and notify you via email.
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
            <CardTitle className="text-2xl text-[#E8EAED]">Verify Car Ownership</CardTitle>
            <p className="text-[#8B92A7]">Provide your car details for verification</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#E8EAED]">Car Brand *</Label>
                  <Input
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                    placeholder="BYD"
                  />
                </div>
                <div>
                  <Label className="text-[#E8EAED]">Model *</Label>
                  <Input
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                    placeholder="Seal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#E8EAED]">Year *</Label>
                  <Input
                    required
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                    placeholder="2024"
                  />
                </div>
                <div>
                  <Label className="text-[#E8EAED]">Emirate *</Label>
                  <Input
                    required
                    value={formData.emirate}
                    onChange={(e) => setFormData({ ...formData, emirate: e.target.value })}
                    className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                  />
                </div>
              </div>

              <div>
                <Label className="text-[#E8EAED]">Plate Number *</Label>
                <Input
                  required
                  value={formData.plateNumber}
                  onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                  className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                  placeholder="A 12345"
                />
              </div>

              <div>
                <Label className="text-[#E8EAED]">VIN Number (Optional)</Label>
                <Input
                  value={formData.vinNumber}
                  onChange={(e) => setFormData({ ...formData, vinNumber: e.target.value })}
                  className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                  placeholder="1HGBH41JXMN109186"
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
