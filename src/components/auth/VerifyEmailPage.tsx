import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react';

interface VerifyEmailPageProps {
  onNavigate: (page: string) => void;
}

export function VerifyEmailPage({ onNavigate }: VerifyEmailPageProps) {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for resend
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleVerify = async () => {
    if (otp.length !== 6) return;
    
    setIsLoading(true);
    setError('');
    
    // Simulate verification
    setTimeout(() => {
      setIsLoading(false);
      if (otp === '123456') {
        setIsVerified(true);
        setTimeout(() => {
          onNavigate('role-selection');
        }, 2000);
      } else {
        setError('Invalid verification code. Please try again.');
        setOtp('');
      }
    }, 2000);
  };

  const handleResend = () => {
    setTimeLeft(60);
    setCanResend(false);
    setError('');
    // Simulate resend
    console.log('Resending verification email...');
  };

  useEffect(() => {
    if (otp.length === 6) {
      handleVerify();
    }
  }, [otp]);

  if (isVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold">Email verified!</h2>
            <p className="text-muted-foreground">
              Your email has been successfully verified. Redirecting you to complete your profile...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onNavigate('signup')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Main Content */}
      <div 
        className="flex-1 flex items-center justify-center p-4 relative"
        style={{
          background: 'linear-gradient(135deg, #0B1426 0%, #1a2332 100%)'
        }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Content container */}
        <div className="relative z-10 w-full max-w-md">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>Verify your email</CardTitle>
            <CardDescription>
              We've sent a 6-digit verification code to your email address. Enter it below to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* OTP Input */}
            <div className="space-y-4">
              <InputOTP 
                maxLength={6} 
                value={otp} 
                onChange={setOtp}
                className="w-full"
              >
                <InputOTPGroup className="gap-2 w-full justify-center">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              {error && (
                <div className="flex items-center space-x-2 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              {isLoading && (
                <div className="text-center text-sm text-muted-foreground">
                  Verifying your code...
                </div>
              )}
            </div>

            {/* Resend */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Didn't receive the code?
              </p>
              {canResend ? (
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-sm"
                  onClick={handleResend}
                >
                  Resend verification code
                </Button>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Resend in {timeLeft}s
                </span>
              )}
            </div>

            {/* Manual Verify Button */}
            <Button 
              onClick={handleVerify}
              className="w-full"
              disabled={otp.length !== 6 || isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </Button>

            {/* Help Text */}
            <p className="text-xs text-muted-foreground text-center">
              Having trouble? Check your spam folder or contact support.
            </p>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}