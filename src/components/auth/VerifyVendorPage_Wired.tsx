/**
 * VerifyVendorPage_Wired - Vendor Verification Form
 * Allows users to submit business verification documents
 * Connected to admin verification workflow
 */

import { useState, useEffect } from 'react';
import {
  Store, Upload, CheckCircle, Clock, XCircle,
  AlertCircle, FileText, Phone, Mail, MapPin, Building2,
  ArrowLeft, Loader2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase/client';
import { STORAGE_BUCKETS } from '../../lib/storageBuckets';
import { useProfile } from '../../src/hooks';

const BUSINESS_TYPES = [
  { value: 'parts_seller', label: '零件卖家 - Parts Seller' },
  { value: 'accessories', label: '配件商 - Accessories' },
  { value: 'services', label: '服务商 - Services' },
  { value: 'other', label: '其他 - Other' }
];

const EMIRATES = [
  'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman',
  'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'
];

interface VerifyVendorPageProps {
  onNavigate?: (page: string) => void;
  onBack?: () => void;
}

export function VerifyVendorPage_Wired({ onNavigate, onBack }: VerifyVendorPageProps) {
  const { profile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [existingVerification, setExistingVerification] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    tradeLicenseNumber: '',
    location: '',
    emirate: '',
    businessPhone: '',
    businessEmail: '',
    businessAddress: '',
    tradeLicenseUrl: '',
    taxCertificateUrl: '',
    businessPhotosUrls: [] as string[]
  });

  useEffect(() => {
    checkExistingVerification();
  }, [profile?.id]);

  const checkExistingVerification = async () => {
    if (!profile?.id) return;

    try {
      setCheckingStatus(true);
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', profile.id)
        .eq('verification_type', 'vendor')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setExistingVerification(data);
        // Pre-fill form with existing data if status is not verified
        if (data.status !== 'approved') {
          const formDataFromDb = data.data || {};
          setFormData({
            businessName: formDataFromDb.business_name || '',
            businessType: formDataFromDb.business_type || '',
            tradeLicenseNumber: formDataFromDb.trade_license_number || '',
            location: formDataFromDb.location || '',
            emirate: formDataFromDb.emirate || '',
            businessPhone: formDataFromDb.business_phone || '',
            businessEmail: formDataFromDb.business_email || '',
            businessAddress: formDataFromDb.business_address || '',
            tradeLicenseUrl: formDataFromDb.trade_license_url || '',
            taxCertificateUrl: formDataFromDb.tax_certificate_url || '',
            businessPhotosUrls: formDataFromDb.business_photos_urls || []
          });
        }
      }
    } catch (error: any) {
      console.error('Error checking verification status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (field: string, file: File) => {
    if (!profile?.id) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/${field}_${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.verification)
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKETS.verification)
        .getPublicUrl(fileName);

      handleChange(field, publicUrl);
      toast.success('Document uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload document');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile?.id) {
      toast.error('Please sign in to continue');
      return;
    }

    // Validation
    if (!formData.businessName || !formData.businessType || !formData.tradeLicenseNumber ||
      !formData.emirate || !formData.businessPhone || !formData.businessEmail ||
      !formData.businessAddress) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      const verificationData = {
        user_id: profile.id,
        verification_type: 'vendor',
        status: 'pending',
        data: {
          business_name: formData.businessName,
          business_type: formData.businessType,
          trade_license_number: formData.tradeLicenseNumber,
          location: formData.location,
          emirate: formData.emirate,
          business_phone: formData.businessPhone,
          business_email: formData.businessEmail,
          business_address: formData.businessAddress,
          trade_license_url: formData.tradeLicenseUrl,
          tax_certificate_url: formData.taxCertificateUrl,
          business_photos_urls: formData.businessPhotosUrls
        },
        documents: [formData.tradeLicenseUrl, formData.taxCertificateUrl].filter(Boolean)
      };

      let error;
      if (existingVerification?.id) {
        // Update existing verification
        const result = await supabase
          .from('verification_requests')
          .update(verificationData)
          .eq('id', existingVerification.id);
        error = result.error;
      } else {
        // Create new verification
        const result = await supabase
          .from('verification_requests')
          .insert([verificationData]);
        error = result.error;
      }

      if (error) throw error;

      toast.success('Verification request submitted successfully! 🎉');

      // Refresh status
      await checkExistingVerification();
    } catch (error: any) {
      console.error('Error submitting verification:', error);
      toast.error(error.message || 'Failed to submit verification request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="bg-green-900/30 text-green-400 border-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-900/30 text-yellow-400 border-yellow-700">
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-900/30 text-red-400 border-red-700">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-900/30 text-gray-400 border-gray-700">
            <AlertCircle className="w-3 h-3 mr-1" />
            Not Verified
          </Badge>
        );
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-[#0B1426] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  // Show status if already approved
  if (existingVerification?.status === 'approved') {
    return (
      <div className="min-h-screen bg-[#0B1426] py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={onBack || (() => onNavigate?.('profile'))}
            className="mb-4 text-gray-400 hover:text-[#E8EAED]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>

          <Card className="bg-[#0F1829] border-[#1A2332]">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-2xl text-[#E8EAED] mb-2">Vendor Verified! 🎉</h2>
              <p className="text-gray-400 mb-4">
                Your business has been verified successfully
              </p>
              <div className="bg-[#0B1426] rounded-lg p-4 mb-6">
                <div className="text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Business Name:</span>
                    <span className="text-sm text-[#E8EAED]">{existingVerification.business_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Type:</span>
                    <span className="text-sm text-[#E8EAED]">
                      {BUSINESS_TYPES.find(t => t.value === existingVerification.business_type)?.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">License:</span>
                    <span className="text-sm text-[#E8EAED]">{existingVerification.trade_license_number}</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={onBack || (() => onNavigate?.('profile'))}
                className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A137]"
              >
                Return to Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1426] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBack || (() => onNavigate?.('profile'))}
            className="mb-4 text-gray-400 hover:text-[#E8EAED]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
                <Store className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div>
                <h1 className="text-2xl text-[#E8EAED]">Vendor Verification</h1>
                <p className="text-sm text-gray-400">Submit your business details for verification</p>
              </div>
            </div>
            {existingVerification && getStatusBadge(existingVerification.status)}
          </div>

          {existingVerification?.status === 'rejected' && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <p className="text-sm text-red-400 mb-1">Your verification was rejected</p>
                  {existingVerification.rejection_reason && (
                    <p className="text-xs text-gray-400">
                      Reason: {existingVerification.rejection_reason}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Please update your information and resubmit
                  </p>
                </div>
              </div>
            </div>
          )}

          {existingVerification?.status === 'pending' && (
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-400 mb-1">Verification in progress</p>
                  <p className="text-xs text-gray-400">
                    Your business verification is being reviewed by our team
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card className="bg-[#0F1829] border-[#1A2332]">
            <CardHeader>
              <CardTitle className="text-[#E8EAED] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#D4AF37]" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="businessName" className="text-[#E8EAED]">
                  Business Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                  placeholder="例如: 比亚迪配件商城 / BYD Parts Store"
                  className="bg-[#0B1426] border-gray-700 text-[#E8EAED]"
                  required
                />
              </div>

              {/* Business Type */}
              <div className="space-y-2">
                <Label htmlFor="businessType" className="text-[#E8EAED]">
                  Business Type <span className="text-red-400">*</span>
                </Label>
                <Select value={formData.businessType} onValueChange={(value) => handleChange('businessType', value)}>
                  <SelectTrigger className="bg-[#0B1426] border-gray-700 text-[#E8EAED]">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F1829] border-gray-700">
                    {BUSINESS_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="text-[#E8EAED]">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Trade License Number */}
              <div className="space-y-2">
                <Label htmlFor="tradeLicenseNumber" className="text-[#E8EAED]">
                  Trade License Number <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="tradeLicenseNumber"
                  value={formData.tradeLicenseNumber}
                  onChange={(e) => handleChange('tradeLicenseNumber', e.target.value)}
                  placeholder="例如: 123456"
                  className="bg-[#0B1426] border-gray-700 text-[#E8EAED]"
                  required
                />
              </div>

              {/* Location & Emirate */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-[#E8EAED]">
                    Location/Area
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="例如: Deira / Al Quoz"
                    className="bg-[#0B1426] border-gray-700 text-[#E8EAED]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emirate" className="text-[#E8EAED]">
                    Emirate <span className="text-red-400">*</span>
                  </Label>
                  <Select value={formData.emirate} onValueChange={(value) => handleChange('emirate', value)}>
                    <SelectTrigger className="bg-[#0B1426] border-gray-700 text-[#E8EAED]">
                      <SelectValue placeholder="Select emirate" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0F1829] border-gray-700">
                      {EMIRATES.map((emirate) => (
                        <SelectItem key={emirate} value={emirate} className="text-[#E8EAED]">
                          {emirate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Business Phone & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessPhone" className="text-[#E8EAED]">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Business Phone <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="businessPhone"
                    type="tel"
                    value={formData.businessPhone}
                    onChange={(e) => handleChange('businessPhone', e.target.value)}
                    placeholder="+971 50 123 4567"
                    className="bg-[#0B1426] border-gray-700 text-[#E8EAED]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessEmail" className="text-[#E8EAED]">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Business Email <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    value={formData.businessEmail}
                    onChange={(e) => handleChange('businessEmail', e.target.value)}
                    placeholder="business@example.com"
                    className="bg-[#0B1426] border-gray-700 text-[#E8EAED]"
                    required
                  />
                </div>
              </div>

              {/* Business Address */}
              <div className="space-y-2">
                <Label htmlFor="businessAddress" className="text-[#E8EAED]">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Business Address <span className="text-red-400">*</span>
                </Label>
                <Textarea
                  id="businessAddress"
                  value={formData.businessAddress}
                  onChange={(e) => handleChange('businessAddress', e.target.value)}
                  placeholder="Full business address"
                  className="bg-[#0B1426] border-gray-700 text-[#E8EAED] min-h-[80px]"
                  required
                />
              </div>

              {/* Document Uploads */}
              <div className="space-y-4 pt-4 border-t border-gray-800">
                <h3 className="text-[#E8EAED] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#D4AF37]" />
                  Upload Documents
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="tradeLicense" className="text-[#E8EAED]">
                    Trade License (Optional)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="tradeLicense"
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload('tradeLicenseUrl', file);
                      }}
                      className="bg-[#0B1426] border-gray-700 text-[#E8EAED]"
                    />
                    {formData.tradeLicenseUrl && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxCertificate" className="text-[#E8EAED]">
                    Tax Certificate (Optional)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="taxCertificate"
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload('taxCertificateUrl', file);
                      }}
                      className="bg-[#0B1426] border-gray-700 text-[#E8EAED]"
                    />
                    {formData.taxCertificateUrl && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-400">
                  * Upload clear photos of your documents. Accepted formats: JPG, PNG, PDF
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack || (() => onNavigate?.('profile'))}
                  className="flex-1 border-gray-700 text-gray-400"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A137]"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      {existingVerification ? 'Update' : 'Submit'} for Verification
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
