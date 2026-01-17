import { useState } from 'react';
import { Shield, Smartphone, Key, Copy, Check, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'sonner';

export default function MFASetupPage() {
  const [step, setStep] = useState<'intro' | 'qr' | 'verify' | 'recovery' | 'complete'>('intro');
  const [verificationCode, setVerificationCode] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Mock data - replace with actual Supabase MFA setup
  const qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/SublimesDrive:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=SublimesDrive';
  const secret = 'JBSWY3DPEHPK3PXP';
  const recoveryCodes = [
    'SD-1234-5678',
    'SD-8765-4321',
    'SD-2468-1357',
    'SD-9876-5432',
    'SD-1357-2468',
    'SD-5432-9876',
  ];

  const copySecret = async () => {
    const { copyToClipboard } = await import('../../utils/clipboard');
    const success = await copyToClipboard(secret);
    if (success) {
      setCopied(true);
      toast.success('Secret key copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy secret key');
    }
  };

  const downloadRecoveryCodes = () => {
    const text = recoveryCodes.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sublimes-drive-recovery-codes.txt';
    a.click();
    toast.success('Recovery codes downloaded');
  };

  const handleVerify = () => {
    // Mock verification - replace with actual Supabase MFA verification
    if (verificationCode.length === 6) {
      setStep('recovery');
      toast.success('Two-factor authentication verified successfully!');
    } else {
      toast.error('Please enter a valid 6-digit code');
    }
  };

  const handleComplete = () => {
    setStep('complete');
    toast.success('MFA setup complete! Your account is now more secure.');
  };

  return (
    <div className="min-h-screen bg-[#0B1426] p-4">
      <div className="max-w-2xl mx-auto py-8">
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
              Two-Factor Authentication
            </h1>
          </div>
          <p className="text-[#9CA3AF]">
            Add an extra layer of security to your account
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8 flex justify-between items-center">
          {['intro', 'qr', 'verify', 'recovery', 'complete'].map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                ['intro', 'qr', 'verify', 'recovery', 'complete'].indexOf(step) >= i
                  ? 'bg-[#D4AF37] text-[#0B1426]'
                  : 'bg-[#2A3441] text-[#9CA3AF]'
              }`}>
                {i + 1}
              </div>
              {i < 4 && (
                <div className={`w-12 h-0.5 ${
                  ['intro', 'qr', 'verify', 'recovery', 'complete'].indexOf(step) > i
                    ? 'bg-[#D4AF37]'
                    : 'bg-[#2A3441]'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="bg-[#1A2332] border border-[#2A3441] rounded-lg p-6">
          {/* Intro */}
          {step === 'intro' && (
            <div className="text-center">
              <Smartphone className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-[#E8EAED] mb-3">
                Get Started with 2FA
              </h2>
              <p className="text-[#9CA3AF] mb-6">
                You'll need an authenticator app like Google Authenticator, 
                Microsoft Authenticator, or Authy on your phone.
              </p>
              <Button
                onClick={() => setStep('qr')}
                className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A137]"
              >
                Continue
              </Button>
            </div>
          )}

          {/* QR Code */}
          {step === 'qr' && (
            <div className="text-center">
              <h2 className="text-xl font-semibold text-[#E8EAED] mb-3">
                Scan QR Code
              </h2>
              <p className="text-[#9CA3AF] mb-6">
                Open your authenticator app and scan this QR code:
              </p>
              
              <div className="bg-white p-4 rounded-lg inline-block mb-6">
                <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
              </div>
              
              <div className="bg-[#0B1426] border border-[#2A3441] rounded-lg p-4 mb-6">
                <p className="text-[#9CA3AF] text-sm mb-2">Or enter this key manually:</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="text-[#D4AF37] font-mono">{secret}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copySecret}
                    className="text-[#9CA3AF] hover:text-[#E8EAED]"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <Button
                onClick={() => setStep('verify')}
                className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A137]"
              >
                I've Scanned the Code
              </Button>
            </div>
          )}

          {/* Verify */}
          {step === 'verify' && (
            <div className="text-center">
              <Key className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-[#E8EAED] mb-3">
                Verify Your Code
              </h2>
              <p className="text-[#9CA3AF] mb-6">
                Enter the 6-digit code from your authenticator app:
              </p>
              
              <Input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl tracking-widest mb-6 bg-[#0B1426] border-[#2A3441] text-[#E8EAED]"
              />
              
              <Button
                onClick={handleVerify}
                disabled={verificationCode.length !== 6}
                className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A137] w-full"
              >
                Verify Code
              </Button>
            </div>
          )}

          {/* Recovery Codes */}
          {step === 'recovery' && (
            <div>
              <h2 className="text-xl font-semibold text-[#E8EAED] mb-3">
                Save Your Recovery Codes
              </h2>
              <p className="text-[#9CA3AF] mb-6">
                Store these codes in a safe place. You'll need them if you lose access to your authenticator app.
              </p>
              
              <div className="bg-[#0B1426] border border-[#2A3441] rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-3">
                  {recoveryCodes.map((code, i) => (
                    <div key={i} className="text-[#D4AF37] font-mono text-sm">
                      {code}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 mb-6">
                <Button
                  onClick={downloadRecoveryCodes}
                  variant="outline"
                  className="flex-1 border-[#2A3441] text-[#E8EAED] hover:bg-[#2A3441]"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={async () => {
                    const { copyToClipboard } = await import('../../utils/clipboard');
                    const success = await copyToClipboard(recoveryCodes.join('\n'));
                    if (success) {
                      toast.success('Recovery codes copied');
                    } else {
                      toast.error('Failed to copy codes');
                    }
                  }}
                  variant="outline"
                  className="flex-1 border-[#2A3441] text-[#E8EAED] hover:bg-[#2A3441]"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              
              <Button
                onClick={handleComplete}
                className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A137] w-full"
              >
                I've Saved My Codes
              </Button>
            </div>
          )}

          {/* Complete */}
          {step === 'complete' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold text-[#E8EAED] mb-3">
                All Set!
              </h2>
              <p className="text-[#9CA3AF] mb-6">
                Two-factor authentication is now enabled on your account. 
                You'll be asked for a code when signing in from a new device.
              </p>
              <Button
                onClick={() => window.history.back()}
                className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A137]"
              >
                Return to Settings
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
