import { Wrench, Clock, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

interface MaintenancePageProps {
  estimatedTime?: string;
  message?: string;
}

export default function MaintenancePage({ 
  estimatedTime = '30 minutes',
  message = 'We\'re performing scheduled maintenance to improve your experience.'
}: MaintenancePageProps) {
  return (
    <div className="min-h-screen bg-[#0B1426] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="p-8 bg-[#1A2332] rounded-full border-2 border-[#D4AF37] shadow-lg">
            <Wrench className="w-20 h-20 text-[#D4AF37]" />
          </div>
        </div>
        
        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-bold text-[#E8EAED] mb-4">
          Under Maintenance
        </h1>
        
        {/* Message */}
        <p className="text-[#9CA3AF] text-lg mb-8 max-w-lg mx-auto">
          {message}
        </p>
        
        {/* Estimated Time */}
        {estimatedTime && (
          <div className="flex items-center justify-center gap-2 mb-8">
            <Clock className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-[#E8EAED]">
              Estimated time: <span className="text-[#D4AF37] font-semibold">{estimatedTime}</span>
            </span>
          </div>
        )}
        
        {/* Status Updates */}
        <div className="bg-[#1A2332] border border-[#2A3441] rounded-lg p-6 mb-8 max-w-md mx-auto">
          <h3 className="text-[#E8EAED] font-semibold mb-3">
            What's being updated?
          </h3>
          <ul className="text-[#9CA3AF] text-sm space-y-2 text-left">
            <li className="flex items-start gap-2">
              <span className="text-[#D4AF37] mt-0.5">•</span>
              <span>Database optimization for better performance</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D4AF37] mt-0.5">•</span>
              <span>Enhanced security measures</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D4AF37] mt-0.5">•</span>
              <span>New features and improvements</span>
            </li>
          </ul>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => window.location.reload()}
            className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A137]"
          >
            Refresh Page
          </Button>
          
          <Button
            variant="outline"
            className="border-[#2A3441] text-[#E8EAED] hover:bg-[#2A3441]"
            asChild
          >
            <a href="https://twitter.com/sublimesdrive" target="_blank" rel="noopener noreferrer">
              Check Status Updates
            </a>
          </Button>
        </div>
        
        {/* Contact */}
        <p className="text-[#9CA3AF] text-sm mt-8">
          Need urgent help? Contact us at{' '}
          <a href="mailto:support@sublimesdrive.com" className="text-[#D4AF37] hover:underline">
            support@sublimesdrive.com
          </a>
        </p>
      </div>
    </div>
  );
}
