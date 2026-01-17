import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowLeft, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '../ui/badge';

interface VerifyCarOwnerPageProps {
  onNavigate: (page: string) => void;
}

export function VerifyCarOwnerPage({ onNavigate }: VerifyCarOwnerPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState(0);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    plateNumber: '',
    vinNumber: '',
    emirate: ''
  });

  const carBrands = [
    'BYD', 'NIO', 'XPeng', 'Li Auto', 'Geely', 'Great Wall Motors',
    'Chery', 'Hongqi', 'ZEEKR', 'Jetour', 'MG Motor', 'GAC'
  ];

  const emirates = [
    'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  const handleFileUpload = () => {
    // Simulate file upload
    setUploadedFiles(prev => Math.min(prev + 1, 6));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate verification submission
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 2000);
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
              Your car owner verification has been submitted for review. You'll receive an email once it's processed (usually within 24-48 hours).
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
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <CardTitle>Car Owner Verification</CardTitle>
                <CardDescription>
                  Verify your vehicle ownership to get full access and green shield badge
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Vehicle Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Vehicle Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Car Brand</Label>
                    <Select value={formData.brand} onValueChange={(value) => setFormData(prev => ({ ...prev, brand: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {carBrands.map((brand) => (
                          <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      placeholder="e.g., Camry, Accord"
                      value={formData.model}
                      onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Select value={formData.year} onValueChange={(value) => setFormData(prev => ({ ...prev, year: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emirate">Emirate</Label>
                    <Select value={formData.emirate} onValueChange={(value) => setFormData(prev => ({ ...prev, emirate: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select emirate" />
                      </SelectTrigger>
                      <SelectContent>
                        {emirates.map((emirate) => (
                          <SelectItem key={emirate} value={emirate}>{emirate}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plateNumber">Plate Number</Label>
                    <Input
                      id="plateNumber"
                      placeholder="e.g., ABC 123"
                      value={formData.plateNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, plateNumber: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vinNumber">VIN Number (Optional)</Label>
                    <Input
                      id="vinNumber"
                      placeholder="17-character VIN"
                      value={formData.vinNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, vinNumber: e.target.value }))}
                      maxLength={17}
                    />
                  </div>
                </div>
              </div>

              {/* Document Upload */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Upload Documents</h3>
                <p className="text-sm text-muted-foreground">
                  Upload front and back of your vehicle registration (Mulkiya) for verification.
                </p>
                
                <Card className="border-dashed border-2 border-muted-foreground/25">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <Upload className="w-10 h-10 text-muted-foreground mx-auto" />
                      <div>
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={handleFileUpload}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Add Media
                        </Button>
                        <p className="text-sm text-muted-foreground mt-2">
                          {uploadedFiles}/6 files uploaded
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Supported: JPG, PNG, PDF (max 10MB each)
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {uploadedFiles > 0 && (
                  <div className="space-y-2">
                    {Array.from({ length: uploadedFiles }, (_, i) => (
                      <div key={i} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Document {i + 1} uploaded</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Requirements */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 text-amber-500" />
                  Verification Requirements
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Valid UAE vehicle registration (Mulkiya)</li>
                  <li>• Documents must be clear and readable</li>
                  <li>• Vehicle must be registered under your name</li>
                  <li>• Processing time: 24-48 hours</li>
                </ul>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || uploadedFiles === 0}>
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