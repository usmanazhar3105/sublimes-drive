import { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';
import { Button } from './ui/button';

export function ConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show banner after 1 second
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookie-consent', 'all');
    setShow(false);
  };

  const acceptEssential = () => {
    localStorage.setItem('cookie-consent', 'essential');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 animate-in slide-in-from-bottom">
      <div className="max-w-6xl mx-auto bg-[#1A2332] border border-[#2A3441] rounded-lg shadow-2xl p-6">
        <div className="flex items-start gap-4">
          <Cookie className="w-6 h-6 text-[#D4AF37] flex-shrink-0 mt-1" />
          
          <div className="flex-1">
            <h3 className="text-[#E8EAED] font-semibold mb-2">
              We value your privacy
            </h3>
            <p className="text-[#9CA3AF] text-sm mb-4">
              We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
              By clicking "Accept All", you consent to our use of cookies. 
              <a href="/legal/privacy" className="text-[#D4AF37] hover:underline ml-1">
                Read our Privacy Policy
              </a>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={acceptAll}
                className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A137]"
              >
                Accept All
              </Button>
              <Button
                onClick={acceptEssential}
                variant="outline"
                className="border-[#2A3441] text-[#E8EAED] hover:bg-[#2A3441]"
              >
                Essential Only
              </Button>
              <Button
                variant="ghost"
                className="text-[#9CA3AF] hover:text-[#E8EAED] hover:bg-[#2A3441]"
                asChild
              >
                <a href="/legal/privacy#cookies">Manage Preferences</a>
              </Button>
            </div>
          </div>
          
          <button
            onClick={() => setShow(false)}
            className="text-[#9CA3AF] hover:text-[#E8EAED] transition-colors"
            aria-label="Close banner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
