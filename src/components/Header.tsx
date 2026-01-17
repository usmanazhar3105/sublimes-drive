import { Search, Sun, Moon, User, Bell, Copy, Share2, Settings, LogOut, ChevronDown, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Logo } from './ui/Logo';
import { LanguageSwitcher } from './ui/LanguageSwitcher';
import { useState, useEffect } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useProfile } from '../hooks/useProfile';
import { useNotifications } from '../hooks/useNotifications';
import { useReferrals } from '../hooks/useReferrals';
import { copyToClipboard as safeCopyToClipboard } from '../utils/clipboard';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase/client';

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
  onProfileClick?: () => void;
  onNavigate?: (page: string) => void;
}

export function Header({ isDark, toggleTheme, onProfileClick, onNavigate }: HeaderProps) {
  const [searchValue, setSearchValue] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  
  // 🔥 GET REAL USER DATA FROM DATABASE
  const { profile, loading: profileLoading } = useProfile();
  const { unreadCount } = useNotifications();
  
  // 🔥 GET REFERRAL DATA FROM DATABASE (UNIFIED SYSTEM)
  const { referralCode, referralStats } = useReferrals(profile?.id);
  
  // Use real user data from database
  const currentUser = profile ? {
    name: profile.display_name || profile.email || 'User',
    username: `@${profile.display_name?.toLowerCase().replace(/\s+/g, '_') || 'user'}`,
    avatar: profile.avatar_url || '',
    role: profile.role || 'user',
    badgeType: 'green',
    verified: true
  } : null;

  // Unified referral data from database
  const referralData = {
    referralCode: referralCode || 'Loading...',
    referralLink: referralCode ? `https://sublimesdrive.com/invite/${referralCode}` : 'Loading...'
  };

  const handleSearch = () => {
    if (searchValue.trim()) {
      onNavigate?.('search');
      // Pass search query through URL params or state management
      // For now, we'll handle it in the search page
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const copyToClipboard = async (text: string) => {
    const success = await safeCopyToClipboard(text);
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

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      onNavigate?.('welcome');
    } catch (e) {
      console.error('Sign out failed', e);
    }
  };

  return (
    <header className="bg-card border-b border-border p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Logo size="sm" />
      </div>
      
      <div className="flex items-center space-x-3">
        {/* Desktop Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer" onClick={handleSearch} />
          <Input
            placeholder="Search cars, communities, garages..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 w-64"
          />
        </div>
        
        {/* Mobile Search */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={() => setShowMobileSearch(!showMobileSearch)}
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Mobile Search Input */}
        {showMobileSearch && (
          <div className="absolute top-16 left-4 right-4 z-50 md:hidden">
            <div className="relative bg-card border border-border rounded-lg shadow-lg p-2">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer" onClick={handleSearch} />
              <Input
                placeholder="Search cars, communities, garages..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 pr-10"
                autoFocus
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowMobileSearch(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative" 
          onClick={() => onNavigate?.('notifications')}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
        
        {/* Language Switcher */}
        <LanguageSwitcher />
        
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        
        {/* Desktop Profile Dropdown */}
        {currentUser ? (
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback>{currentUser.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{currentUser.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">{currentUser.role.replace(/[_-]/g, ' ')}</span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-4">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback>{currentUser.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{currentUser.name}</span>
                      {currentUser.verified && (
                        <div className={`w-4 h-4 rounded-full ${
                          currentUser.badgeType === 'yellow' ? 'bg-yellow-500' :
                          currentUser.badgeType === 'green' ? 'bg-green-500' :
                          'bg-blue-500'
                        } flex items-center justify-center`}>
                          <span className="text-xs text-white">✓</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{currentUser.username}</p>
                    <p className="text-xs text-muted-foreground capitalize">{currentUser.role.replace(/[_-]/g, ' ')}</p>
                  </div>
                </div>

              <DropdownMenuSeparator />

              {/* Referral Link Section */}
              <div className="py-3">
                <div className="text-sm font-medium text-muted-foreground mb-3">Your Referral Link</div>
                <div className="bg-card/50 p-3 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1 mr-2">
                      <div className="text-sm font-mono text-[var(--sublimes-gold)] break-all">
                        {referralData.referralLink}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(referralData.referralLink)}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={shareReferralLink}
                        className="h-8 w-8 p-0"
                      >
                        <Share2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Earn {currentUser.role !== 'garage-owner' ? '5 XP' : '1 Free Bid Credit'} per referral
                  </div>
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* Menu Items */}
              <DropdownMenuItem onClick={() => onNavigate?.('profile')} className="flex items-center gap-2 cursor-pointer">
                <User className="h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => onNavigate?.('profile-settings')} className="flex items-center gap-2 cursor-pointer">
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 cursor-pointer text-destructive">
                <LogOut className="h-4 w-4" />
                Sign Out
              </DropdownMenuItem>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-border">
                <div className="text-xs text-muted-foreground text-center">
                  Powered by Sublimes Drive © 2025
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        ) : (
          <div className="hidden md:block">
            <Button variant="ghost" className="flex items-center gap-2 px-3" onClick={() => onNavigate?.('login')}>
              <User className="h-5 w-5" />
              <span className="text-sm">Sign In</span>
            </Button>
          </div>
        )}
        
        {/* Mobile Profile Button */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={currentUser ? onProfileClick : () => onNavigate?.('login')}>
          <User className="h-5 w-5 text-[var(--sublimes-gold)]" />
        </Button>
      </div>
    </header>
  );
}