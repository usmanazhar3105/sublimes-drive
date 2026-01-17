import { Home, Users, MapPin, ShoppingBag, Wrench, User, Star, Trophy, Zap, Tag, Plus, Hammer, Car, Copy, Share2, Shield, Calendar, Youtube, Facebook, Instagram, Mail, Wallet, Target, FileText } from 'lucide-react';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { useRole } from '../hooks/useRole';
import { useXP, useProfile } from '../hooks/useProfile';
import { useReferrals } from '../hooks/useReferrals';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export function Sidebar({ currentPage, setCurrentPage }: SidebarProps) {
  const { t } = useTranslation();
  
  // Use real role and profile data from database
  const { role, isAdmin, isEditor, isGarageOwner, loading } = useRole();
  
  // Get profile and XP data from hooks
  const { profile } = useProfile();
  const { totalXP, xpEvents } = useXP();
  
  // 🔥 GET REFERRAL DATA FROM DATABASE (UNIFIED SYSTEM)
  const { referralCode, referralStats } = useReferrals(profile?.id);
  
  // Unified referral data from database
  const referralData = {
    referralCode: referralCode || 'Loading...',
    referralLink: referralCode ? `https://sublimesdrive.com/invite/${referralCode}` : 'Loading...'
  };
  
  // Only show admin tab for admin and editor roles (broadened checks)
  const canAccessAdmin = (
    isAdmin ||
    isEditor ||
    profile?.role === 'admin' ||
    (profile as any)?.role === 'admin' ||
    (profile as any)?.is_admin === true
  );

  const navigation = [
    { id: 'home', label: t('nav.home', 'Home'), icon: Home },
    { id: 'communities', label: t('nav.communities', 'Communities'), icon: Users },
    { id: 'leaderboard', label: t('nav.leaderboard', 'Leaderboard'), icon: Trophy },
    { id: 'challenges', label: 'Daily Challenges', icon: Target },
    { id: 'events', label: t('nav.events', 'Events'), icon: Calendar },
    // 🔥 ROLE RESTRICTION: Garage owners CANNOT access Instant Meetup
    ...(!isGarageOwner ? [{ id: 'meetup', label: 'Instant Meetup', icon: MapPin }] : []),
    { id: 'service-log', label: 'Service Log', icon: FileText },
    { id: 'marketplace', label: t('nav.marketplace', 'Marketplace'), icon: ShoppingBag },
    { id: 'offers', label: t('nav.offers', 'Offers'), icon: Tag },
    { id: 'place-ad', label: 'Place your Ad', icon: Plus },
    { id: 'my-listings', label: 'My Listings', icon: Copy },
    { id: 'garage-hub', label: t('nav.garageHub', 'Garage Hub'), icon: Wrench },
    { id: 'repair-bid', label: 'Repair Bid', icon: Hammer },
    { id: 'import-car', label: 'Import Your Car', icon: Car },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    // Only show Admin Panel for admin and editor roles
    ...(canAccessAdmin ? [{ id: 'admin', label: t('nav.admin', 'Admin Panel'), icon: Shield }] : []),
    { id: 'profile', label: t('nav.profile', 'Profile'), icon: User }
  ];

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

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border h-full flex flex-col">
      {/* Navigation - No Logo */}
      <nav className="flex-1 p-4 pt-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start ${
                isActive 
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              }`}
              onClick={() => {
                console.log('Navigating to:', item.id);
                setCurrentPage(item.id);
              }}
            >
              <Icon className="mr-3 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      {/* User Profile Card - Compact - NOW DYNAMIC */}
      <div className="mt-auto border-t border-sidebar-border">
        <div className="p-3">
          {profile ? (
            <>
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={profile.avatar_url || ''} />
                  <AvatarFallback className="text-xs">
                    {profile.display_name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <p className="font-semibold text-sidebar-foreground text-sm truncate">
                      {profile.display_name || profile.email || 'User'}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    @{profile.display_name?.toLowerCase().replace(/\s+/g, '_') || 'user'}
                  </p>
                </div>
              </div>
              
              {/* Badges Row - Dynamic based on role */}
              <div className="flex items-center space-x-1 mt-2 ml-11 flex-wrap gap-1">
                {isAdmin && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-[var(--sublimes-gold)] text-black">
                    <Star className="w-2.5 h-2.5 mr-0.5" />
                    Admin
                  </Badge>
                )}
                {isEditor && !isAdmin && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-purple-500 text-white">
                    <Star className="w-2.5 h-2.5 mr-0.5" />
                    Editor
                  </Badge>
                )}
                {isGarageOwner && !isAdmin && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 border-green-500 text-green-400">
                    <Wrench className="w-2.5 h-2.5 mr-0.5" />
                    Garage Owner
                  </Badge>
                )}
                {!isAdmin && !isEditor && !isGarageOwner && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 border-blue-500 text-blue-400">
                    <Trophy className="w-2.5 h-2.5 mr-0.5" />
                    Car Owner
                  </Badge>
                )}
              </div>
              
              {/* Stats Row - Dynamic XP */}
              <div className="flex items-center justify-between mt-2 ml-11 text-xs">
                <div className="flex items-center text-muted-foreground">
                  <Zap className="w-3 h-3 mr-1 text-[var(--sublimes-gold)]" />
                  <span>{totalXP?.toLocaleString() || 0} XP</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <span>🔥 {xpEvents?.length || 0} events</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-sidebar-accent animate-pulse"></div>
              <div className="flex-1">
                <div className="h-3 w-24 bg-sidebar-accent rounded animate-pulse mb-1"></div>
                <div className="h-2 w-16 bg-sidebar-accent rounded animate-pulse"></div>
              </div>
            </div>
          )}
        </div>

        {/* Referral Link Section */}
        <div className="border-t border-sidebar-border p-3">
          <div className="mb-2">
            <p className="text-xs text-muted-foreground">Your Referral Link</p>
          </div>
          <div className="bg-sidebar-accent rounded-lg p-2">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-2">
                <p className="text-xs font-mono text-[var(--sublimes-gold)] truncate">
                  {referralData.referralLink}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-sidebar-border"
                  onClick={() => copyToClipboard(referralData.referralLink)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-sidebar-border"
                  onClick={shareReferralLink}
                >
                  <Share2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Social Media Icons */}
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-2">Follow Us</p>
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-sidebar-border"
                onClick={() => window.open('https://www.tiktok.com/@sublimes.drive', '_blank')}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-sidebar-border"
                onClick={() => window.open('https://www.youtube.com/@sublimesdrive', '_blank')}
              >
                <Youtube className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-sidebar-border"
                onClick={() => window.open('http://facebook.com/sublimesdrive', '_blank')}
              >
                <Facebook className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-sidebar-border"
                onClick={() => window.open('http://instagram.com/sublimesdrive', '_blank')}
              >
                <Instagram className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-sidebar-border"
                onClick={() => window.open('mailto:info@sublimesdrive.com', '_blank')}
              >
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3">
          <p className="text-xs text-muted-foreground text-center">
            Powered by Sublimes Drive © 2025
          </p>
        </div>
      </div>
    </div>
  );
}