import { useState } from 'react';
import { Download, Trash2, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

export default function DataExportPage() {
  const [exportStatus, setExportStatus] = useState<'idle' | 'processing' | 'ready'>('idle');
  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'confirming' | 'processing'>('idle');

  const handleExportData = async () => {
    setExportStatus('processing');
    toast.info('Preparing your data export...');
    
    // TODO: Call Supabase Edge Function to export data
    // This should compile all user data from all tables
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setExportStatus('ready');
    toast.success('Your data export is ready for download');
  };

  const handleDownloadExport = () => {
    // TODO: Download the generated export file
    toast.success('Download started');
    setExportStatus('idle');
  };

  const handleRequestDeletion = async () => {
    if (deleteStatus === 'confirming') {
      setDeleteStatus('processing');
      toast.info('Processing your deletion request...');
      
      // TODO: Call Supabase Edge Function to queue deletion
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Deletion request submitted. You will be contacted within 30 days.');
      setDeleteStatus('idle');
    } else {
      setDeleteStatus('confirming');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1426] p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="text-[#9CA3AF] hover:text-[#E8EAED] mb-4"
            onClick={() => window.history.back()}
          >
            ← Back
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-[#1A2332] rounded-lg">
              <Shield className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <h1 className="text-2xl font-bold text-[#E8EAED]">
              Your Data & Privacy
            </h1>
          </div>
          <p className="text-[#9CA3AF]">
            Manage your personal data in compliance with GDPR
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-400 text-sm">
                <strong>Your Privacy Rights:</strong> Under GDPR and UAE data protection laws, 
                you have the right to access, export, and delete your personal data.
              </p>
            </div>
          </div>
        </div>

        {/* Export Data Section */}
        <div className="bg-[#1A2332] border border-[#2A3441] rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-[#0B1426] rounded-lg">
              <Download className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-[#E8EAED] mb-2">
                Export Your Data
              </h2>
              <p className="text-[#9CA3AF] mb-4">
                Download a copy of all your data including profile information, posts, 
                listings, messages, and activity history in JSON format.
              </p>
              
              {exportStatus === 'idle' && (
                <Button
                  onClick={handleExportData}
                  className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A137]"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Request Data Export
                </Button>
              )}
              
              {exportStatus === 'processing' && (
                <div className="flex items-center gap-3">
                  <div className="animate-spin h-5 w-5 border-2 border-[#D4AF37] border-t-transparent rounded-full" />
                  <span className="text-[#E8EAED]">Preparing your export...</span>
                </div>
              )}
              
              {exportStatus === 'ready' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle className="w-5 h-5" />
                    <span>Your data export is ready!</span>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleDownloadExport}
                      className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A137]"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Export
                    </Button>
                    <Button
                      onClick={() => setExportStatus('idle')}
                      variant="outline"
                      className="border-[#2A3441] text-[#E8EAED] hover:bg-[#2A3441]"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-[#0B1426] border border-[#2A3441] rounded-lg p-4">
            <h3 className="text-[#E8EAED] font-semibold mb-3 text-sm">
              What's included in your export:
            </h3>
            <ul className="text-[#9CA3AF] text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-[#D4AF37] mt-0.5">•</span>
                <span>Profile information and settings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D4AF37] mt-0.5">•</span>
                <span>Posts, comments, and reactions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D4AF37] mt-0.5">•</span>
                <span>Marketplace listings and messages</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D4AF37] mt-0.5">•</span>
                <span>Transaction history and wallet data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D4AF37] mt-0.5">•</span>
                <span>Activity logs and analytics</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Delete Data Section */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-red-500/20 rounded-lg">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-red-500 mb-2">
                Delete Your Account
              </h2>
              <p className="text-[#9CA3AF] mb-4">
                Permanently delete your account and all associated data. 
                This action cannot be undone.
              </p>
              
              {deleteStatus === 'idle' && (
                <Button
                  onClick={handleRequestDeletion}
                  variant="outline"
                  className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Request Account Deletion
                </Button>
              )}
              
              {deleteStatus === 'confirming' && (
                <div className="space-y-4">
                  <div className="bg-[#0B1426] border border-red-500/30 rounded-lg p-4">
                    <h3 className="text-red-500 font-semibold mb-2">
                      ⚠️ Are you absolutely sure?
                    </h3>
                    <ul className="text-[#9CA3AF] text-sm space-y-2 mb-4">
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>All your listings will be removed from the marketplace</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>Your posts and comments will be permanently deleted</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>All messages and conversations will be lost</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>Your account cannot be recovered after 30 days</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={handleRequestDeletion}
                      variant="outline"
                      className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                    >
                      Yes, Delete My Account
                    </Button>
                    <Button
                      onClick={() => setDeleteStatus('idle')}
                      variant="outline"
                      className="border-[#2A3441] text-[#E8EAED] hover:bg-[#2A3441]"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              
              {deleteStatus === 'processing' && (
                <div className="flex items-center gap-3">
                  <div className="animate-spin h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full" />
                  <span className="text-[#E8EAED]">Processing deletion request...</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-[#0B1426] border border-red-500/30 rounded-lg p-4">
            <h3 className="text-red-500 font-semibold mb-3 text-sm">
              Deletion Process:
            </h3>
            <ul className="text-[#9CA3AF] text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>Your account will be deactivated immediately</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>Data deletion begins within 30 days</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>Some data may be retained for legal compliance (90 days)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>You'll receive confirmation when deletion is complete</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[#9CA3AF] text-sm">
            Questions about your data?{' '}
            <a href="/legal/privacy" className="text-[#D4AF37] hover:underline">
              Read our Privacy Policy
            </a>
            {' '}or{' '}
            <a href="mailto:privacy@sublimesdrive.com" className="text-[#D4AF37] hover:underline">
              contact our privacy team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
