import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { ArrowLeft, Upload, CheckCircle, AlertCircle, Building } from 'lucide-react';
import { Badge } from '../ui/badge';
import { supabase } from '../../utils/supabase/client';

import { STORAGE_BUCKETS } from '../../lib/storageBuckets';

interface VerifyGarageOwnerPageProps {
  onNavigate: (page: string) => void;
}

export function VerifyGarageOwnerPage({ onNavigate }: VerifyGarageOwnerPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [fileUrls, setFileUrls] = useState<{ license?: string, utility?: string }>({});
  const [uploading, setUploading] = useState<{ license?: boolean, utility?: boolean }>({});

  const [formData, setFormData] = useState({
    registeredName: '',
    garageName: '',
    location: '',
    licenseNumber: '',
    description: '',
    services: '',
    contactNumber: '',
    email: ''
  });

  const handleFileUpload = async (field: 'license' | 'utility', file: File) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUploading(prev => ({ ...prev, [field]: true }));
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${field}_garage_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKETS.verification)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKETS.verification)
        .getPublicUrl(fileName);

      setFileUrls(prev => ({ ...prev, [field]: publicUrl }));
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('verification_requests')
        .insert({
          user_id: user.id,
          verification_type: 'garage',
          kind: 'garage_owner',
          status: 'pending',
          data: {
            ...formData,
            trade_license_url: fileUrls.license,
            utility_bill_url: fileUrls.utility
          },
          business_name: formData.registeredName,
          trade_license: fileUrls.license,
          business_address: formData.location,
          documents: [fileUrls.license, fileUrls.utility].filter(Boolean)
        });

      if (error) throw error;

      await supabase
        .from('profiles')
        .update({
          verification_status: 'pending',
          sub_role: 'garage_owner'
        })
        .eq('id', user.id);

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting verification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 relative"
        style={{
          background: 'linear-gradient(135deg, #0B1426 0%, #1a2332 100%)'
        }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Content container */}
        <div className="relative z-10 w-full max-w-md">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold">Verification Submitted!</h2>
              <p className="text-muted-foreground">
                Your garage owner verification has been submitted for review. You'll receive an email once it's processed (usually within 2-3 business days).
              </p>
              <Badge variant="secondary" className="mt-4">
                Status: Under Review
              </Badge>
              <Button
                className="w-full mt-6"
                onClick={() => onNavigate('profile')}
              >
                Back to Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        background: 'linear-gradient(135deg, #0B1426 0%, #1a2332 100%)'
      }}
    >
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Content container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex items-center p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('profile')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <Building className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle>Garage Owner Verification</CardTitle>
                  <CardDescription>
                    Verify your garage business to manage bids and get blue shield badge
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Garage Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Garage Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="registeredName">Registered Business Name</Label>
                      <Input
                        id="registeredName"
                        placeholder="Legal business name"
                        value={formData.registeredName}
                        onChange={(e) => setFormData(prev => ({ ...prev, registeredName: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="garageName">Garage/Shop Name</Label>
                      <Input
                        id="garageName"
                        placeholder="Display name for customers"
                        value={formData.garageName}
                        onChange={(e) => setFormData(prev => ({ ...prev, garageName: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">Trade License Number</Label>
                      <Input
                        id="licenseNumber"
                        placeholder="UAE trade license number"
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="City, Emirate"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactNumber">Contact Number</Label>
                      <Input
                        id="contactNumber"
                        type="tel"
                        placeholder="+971 50 123 4567"
                        value={formData.contactNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Business Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="business@garage.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Business Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your garage services and specialties"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="services">Services Offered</Label>
                    <Textarea
                      id="services"
                      placeholder="List your main services (e.g., Engine repair, AC service, Body work)"
                      value={formData.services}
                      onChange={(e) => setFormData(prev => ({ ...prev, services: e.target.value }))}
                      rows={2}
                      required
                    />
                  </div>
                </div>

                {/* Document Upload */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Upload Documents</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload your trade license and utility bill for verification.
                  </p>

                  <div className="grid gap-4">
                    {/* Trade License */}
                    <div className="bg-muted/30 p-4 rounded-lg border border-dashed border-gray-700">
                      <Label className="mb-2 block">Trade License *</Label>
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="relative"
                          disabled={uploading.license}
                        >
                          {uploading.license ? (
                            <span>Uploading...</span>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Select File
                            </>
                          )}
                          <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept="image/*,.pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload('license', file);
                            }}
                          />
                        </Button>
                        {fileUrls.license && (
                          <div className="flex items-center text-green-500 text-sm">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Uploaded
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Utility Bill */}
                    <div className="bg-muted/30 p-4 rounded-lg border border-dashed border-gray-700">
                      <Label className="mb-2 block">Utility Bill / Tenancy Contract</Label>
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="relative"
                          disabled={uploading.utility}
                        >
                          {uploading.utility ? (
                            <span>Uploading...</span>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Select File
                            </>
                          )}
                          <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept="image/*,.pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload('utility', file);
                            }}
                          />
                        </Button>
                        {fileUrls.utility && (
                          <div className="flex items-center text-green-500 text-sm">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Uploaded
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 text-amber-500" />
                    Verification Requirements
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Valid UAE trade license for automotive services</li>
                    <li>• Utility bill or tenancy contract for business address</li>
                    <li>• Documents must be clear and current</li>
                    <li>• Business must be legally registered in UAE</li>
                    <li>• Processing time: 2-3 business days</li>
                  </ul>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading || !fileUrls.license}>
                  {isLoading ? 'Submitting for Review...' : 'Submit for Review'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}