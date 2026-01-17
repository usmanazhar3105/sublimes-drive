import { useState } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  ArrowLeft, 
  Shield, 
  CheckCircle, 
  Loader,
  Car,
  Settings,
  Wrench,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { toast } from 'sonner';

export interface PaymentConfig {
  type: 'car-listing' | 'parts-listing' | 'garage-listing' | 'bid-wallet' | 'boost' | 'offer';
  title: string;
  amount: number;
  currency: string;
  description: string;
  duration?: number;
  features?: string[];
}

interface PaymentFlowProps {
  config: PaymentConfig;
  onSuccess: (paymentReference: string) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export function PaymentFlow({ config, onSuccess, onCancel, isOpen }: PaymentFlowProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stripe' | 'apple-pay' | 'google-pay'>('stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'method' | 'processing' | 'success' | 'error'>('method');
  const [paymentReference, setPaymentReference] = useState('');

  if (!isOpen) return null;

  const getTypeIcon = () => {
    switch (config.type) {
      case 'car-listing': return <Car className="w-8 h-8 text-blue-500" />;
      case 'parts-listing': return <Settings className="w-8 h-8 text-green-500" />;
      case 'garage-listing': return <Wrench className="w-8 h-8 text-orange-500" />;
      default: return <CreditCard className="w-8 h-8 text-gray-500" />;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const processPayment = async () => {
    setIsProcessing(true);
    setCurrentStep('processing');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate mock payment reference
      const reference = `pi_${selectedPaymentMethod}_${Date.now()}`;
      setPaymentReference(reference);
      
      // Simulate success/failure (90% success rate)
      if (Math.random() > 0.1) {
        setCurrentStep('success');
        setTimeout(() => {
          onSuccess(reference);
        }, 2000);
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      setCurrentStep('error');
      setIsProcessing(false);
    }
  };

  const renderPaymentMethodSelection = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-[var(--sublimes-gold)]/10 rounded-full flex items-center justify-center">
          {getTypeIcon()}
        </div>
        <h2 className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-2">{config.title}</h2>
        <p className="text-gray-400">{config.description}</p>
      </div>

      {/* Price Summary */}
      <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[var(--sublimes-light-text)]">Listing Fee</span>
            <span className="text-[var(--sublimes-light-text)] font-medium">
              {formatAmount(config.amount, config.currency)}
            </span>
          </div>
          
          {config.duration && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Duration</span>
              <span className="text-gray-400">{config.duration} days</span>
            </div>
          )}

          <div className="border-t border-[var(--sublimes-border)] pt-4">
            <div className="flex items-center justify-between font-bold">
              <span className="text-[var(--sublimes-light-text)]">Total</span>
              <span className="text-[var(--sublimes-gold)] text-xl">
                {formatAmount(config.amount, config.currency)}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Features */}
      {config.features && config.features.length > 0 && (
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] p-6">
          <h3 className="font-medium text-[var(--sublimes-light-text)] mb-3">What's included:</h3>
          <ul className="space-y-2">
            {config.features.map((feature, index) => (
              <li key={index} className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-gray-400 text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Payment Methods */}
      <div className="space-y-3">
        <h3 className="font-medium text-[var(--sublimes-light-text)]">Choose Payment Method</h3>
        
        {/* Stripe/Card Payment */}
        <button
          onClick={() => setSelectedPaymentMethod('stripe')}
          className={`w-full flex items-center space-x-4 p-4 rounded-lg border transition-colors ${
            selectedPaymentMethod === 'stripe'
              ? 'border-[var(--sublimes-gold)] bg-[var(--sublimes-gold)]/5'
              : 'border-[var(--sublimes-border)] bg-[var(--sublimes-card-bg)] hover:border-[var(--sublimes-gold)]/50'
          }`}
        >
          <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-blue-500" />
          </div>
          <div className="flex-1 text-left">
            <div className="font-medium text-[var(--sublimes-light-text)]">Credit/Debit Card</div>
            <div className="text-sm text-gray-400">Visa, Mastercard, American Express</div>
          </div>
          <div className={`w-4 h-4 rounded-full border-2 ${
            selectedPaymentMethod === 'stripe'
              ? 'border-[var(--sublimes-gold)] bg-[var(--sublimes-gold)]'
              : 'border-gray-400'
          }`}>
            {selectedPaymentMethod === 'stripe' && (
              <div className="w-full h-full rounded-full bg-white scale-50"></div>
            )}
          </div>
        </button>

        {/* Apple Pay */}
        <button
          onClick={() => setSelectedPaymentMethod('apple-pay')}
          className={`w-full flex items-center space-x-4 p-4 rounded-lg border transition-colors ${
            selectedPaymentMethod === 'apple-pay'
              ? 'border-[var(--sublimes-gold)] bg-[var(--sublimes-gold)]/5'
              : 'border-[var(--sublimes-border)] bg-[var(--sublimes-card-bg)] hover:border-[var(--sublimes-gold)]/50'
          }`}
        >
          <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg"></span>
          </div>
          <div className="flex-1 text-left">
            <div className="font-medium text-[var(--sublimes-light-text)]">Apple Pay</div>
            <div className="text-sm text-gray-400">Touch ID or Face ID</div>
          </div>
          <div className={`w-4 h-4 rounded-full border-2 ${
            selectedPaymentMethod === 'apple-pay'
              ? 'border-[var(--sublimes-gold)] bg-[var(--sublimes-gold)]'
              : 'border-gray-400'
          }`}>
            {selectedPaymentMethod === 'apple-pay' && (
              <div className="w-full h-full rounded-full bg-white scale-50"></div>
            )}
          </div>
        </button>

        {/* Google Pay */}
        <button
          onClick={() => setSelectedPaymentMethod('google-pay')}
          className={`w-full flex items-center space-x-4 p-4 rounded-lg border transition-colors ${
            selectedPaymentMethod === 'google-pay'
              ? 'border-[var(--sublimes-gold)] bg-[var(--sublimes-gold)]/5'
              : 'border-[var(--sublimes-border)] bg-[var(--sublimes-card-bg)] hover:border-[var(--sublimes-gold)]/50'
          }`}
        >
          <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1 text-left">
            <div className="font-medium text-[var(--sublimes-light-text)]">Google Pay</div>
            <div className="text-sm text-gray-400">Quick and secure</div>
          </div>
          <div className={`w-4 h-4 rounded-full border-2 ${
            selectedPaymentMethod === 'google-pay'
              ? 'border-[var(--sublimes-gold)] bg-[var(--sublimes-gold)]'
              : 'border-gray-400'
          }`}>
            {selectedPaymentMethod === 'google-pay' && (
              <div className="w-full h-full rounded-full bg-white scale-50"></div>
            )}
          </div>
        </button>
      </div>

      {/* Security Notice */}
      <div className="flex items-center space-x-2 text-sm text-gray-400 bg-[var(--sublimes-card-bg)] p-3 rounded-lg">
        <Shield className="w-4 h-4 text-green-500" />
        <span>Your payment is secured with 256-bit SSL encryption</span>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1 border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button
          onClick={processPayment}
          disabled={isProcessing}
          className="flex-1 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/90"
        >
          Pay {formatAmount(config.amount, config.currency)}
        </Button>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 mx-auto">
        <Loader className="w-16 h-16 text-[var(--sublimes-gold)] animate-spin" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-[var(--sublimes-light-text)] mb-2">Processing Payment</h2>
        <p className="text-gray-400">Please wait while we process your payment...</p>
        <p className="text-gray-400 text-sm mt-2">Do not close this window</p>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-green-500" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-[var(--sublimes-light-text)] mb-2">Payment Successful!</h2>
        <p className="text-gray-400">Your listing has been submitted for approval</p>
        <p className="text-gray-400 text-sm mt-2">Reference: {paymentReference}</p>
      </div>
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
        <h3 className="font-medium text-green-500 mb-2">What happens next?</h3>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• Your listing is now in the approval queue</li>
          <li>• You'll be notified once it's reviewed (usually within 24 hours)</li>
          <li>• Once approved, your listing will go live immediately</li>
        </ul>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-[var(--sublimes-light-text)] mb-2">Payment Failed</h2>
        <p className="text-gray-400">There was an issue processing your payment</p>
        <p className="text-gray-400 text-sm mt-2">Please try again or use a different payment method</p>
      </div>
      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1 border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
        >
          Cancel
        </Button>
        <Button
          onClick={() => setCurrentStep('method')}
          className="flex-1 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/90"
        >
          Try Again
        </Button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {currentStep === 'method' && renderPaymentMethodSelection()}
          {currentStep === 'processing' && renderProcessing()}
          {currentStep === 'success' && renderSuccess()}
          {currentStep === 'error' && renderError()}
        </div>
      </div>
    </div>
  );
}