import { X, Calendar, MapPin, Wrench, Car, Copy, Share2, Gift, Shield, Youtube, Facebook, Instagram, Mail, UserCircle, Tag, Bot } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { useRole } from '../hooks/useRole';

interface MoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

// Referral data
const referralData = {
  referralCode: 'AHMED2024',
  referralLink: 'https://app.sublimesdrive.com/invite/AHMED2024'
};

export function MoreModal({ isOpen, onClose, onNavigate }: MoreModalProps) {
  // MUST call hooks before any conditional returns
  const { role, isAdmin, isEditor, isGarageOwner } = useRole();
  
  // Only show admin panel for admin and editor roles (broadened checks)
  const canAccessAdmin = isAdmin || isEditor || role === 'admin' || role === 'editor';
  const currentUserRole = isGarageOwner ? 'garage-owner' : 'car-owner';

  if (!isOpen) return null;

  const copyToClipboard = async (text: string) => {
    const { copyToClipboard: safeCopy } = await import('../utils/clipboard');
    const { toast } = await import('sonner');
    const success = await safeCopy(text);
    if (success) {
      toast.success('Copied to clipboard!');
    } else {
      toast.error('Failed to copy. Please copy manually.');
    }
  };

  const shareReferralLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join Sublimes Drive',
        text: 'Join me on Sublimes Drive - the ultimate car enthusiast community in the UAE!',
        url: referralData.referralLink,
      });
    } else {
      copyToClipboard(referralData.referralLink);
    }
  };

  const moreOptions = [
    {
      id: 'profile',
      title: 'My Profile',
      description: 'View and edit your profile',
      icon: UserCircle,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      id: 'garage-hub',
      title: 'Garage Hub',
      description: 'Find verified garages & services',
      icon: Wrench,
      color: 'text-[var(--sublimes-gold)]',
      bgColor: 'bg-[var(--sublimes-gold)]/10'
    },
    {
      id: 'offers',
      title: 'Offers',
      description: 'Exclusive deals & discounts',
      icon: Tag,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      id: 'events',
      title: 'Events',
      description: 'Discover car events near you',
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      id: 'meetup',
      title: 'Instant Meetup',
      description: 'Connect with nearby enthusiasts',
      icon: MapPin,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      id: 'repair-bid',
      title: 'Repair Bidding',
      description: 'Get quotes from garages',
      icon: Wrench,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      id: 'import-car',
      title: 'Import Your Car',
      description: 'Import your car from overseas',
      icon: Car,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      id: 'my-listings',
      title: 'My Listings',
      description: 'Manage your marketplace listings',
      icon: Copy,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      id: 'ai-chat-assistant',
      title: 'AI Chat Assistant',
      description: 'Get instant help & answers',
      icon: Bot,
      color: 'text-[var(--sublimes-gold)]',
      bgColor: 'bg-[var(--sublimes-gold)]/10'
    },
    ...(canAccessAdmin ? [{
      id: 'admin',
      title: 'Admin Panel',
      description: 'Manage platform and users',
      icon: Shield,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    }] : [])
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="md:hidden fixed bottom-20 left-2 right-2 top-auto translate-x-0 translate-y-0 max-w-none w-auto rounded-t-3xl border-t border-border animate-in slide-in-from-bottom duration-300 max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">More Options</DialogTitle>
          <DialogDescription>
            Access additional features and tools for your car enthusiast experience.
          </DialogDescription>
        </DialogHeader>
        
        {/* Referral Link Section */}
        <div className="mb-4">
          <Card className="border-2 border-dashed border-[var(--sublimes-gold)]/30 bg-[var(--sublimes-gold)]/5">
            <CardContent className="p-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-[var(--sublimes-gold)]/20 flex items-center justify-center flex-shrink-0">
                  <Gift className="h-4 w-4 text-[var(--sublimes-gold)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[var(--sublimes-gold)] text-sm">Your Referral Link</h3>
                  <p className="text-xs text-muted-foreground">
                    Earn {currentUserRole !== 'garage-owner' ? '5 XP' : '1 Free Bid Credit'} per referral
                  </p>
                </div>
              </div>
              
              <div className="bg-background/50 p-2 rounded-lg border border-border">
                <div className="text-xs font-mono text-[var(--sublimes-gold)] break-all word-break-all overflow-hidden mb-2">
                  {referralData.referralLink}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-xs px-2 h-8"
                    onClick={() => copyToClipboard(referralData.referralLink)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-xs px-2 h-8"
                    onClick={shareReferralLink}
                  >
                    <Share2 className="h-3 w-3 mr-1" />
                    Share
                  </Button>
                </div>
                
                {/* Social Media Icons */}
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2 text-center">Follow Us</p>
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => window.open('https://www.tiktok.com/@sublimes.drive', '_blank')}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => window.open('https://www.youtube.com/@sublimesdrive', '_blank')}
                    >
                      <Youtube className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => window.open('http://facebook.com/sublimesdrive', '_blank')}
                    >
                      <Facebook className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => window.open('http://instagram.com/sublimesdrive', '_blank')}
                    >
                      <Instagram className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => window.open('mailto:info@sublimesdrive.com', '_blank')}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Options */}
        <div className="space-y-3 pb-4">
          {moreOptions.map((option) => (
            <Card
              key={option.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-border"
              onClick={() => {
                onNavigate(option.id);
                onClose();
              }}
            >
              <CardContent className="p-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full ${option.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <option.icon className={`h-5 w-5 ${option.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium mb-1 text-sm">{option.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">{option.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Footer */}
        <div className="pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            Powered by Sublimes Drive © 2025
          </div>
        </div>
        
        {/* Handle indicator */}
        <div className="w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto mt-2" />
      </DialogContent>
    </Dialog>
  );
}