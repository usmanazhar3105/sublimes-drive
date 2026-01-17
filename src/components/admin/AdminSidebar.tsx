import { 
  ChevronDown,
  ChevronRight,
  Home, 
  Users, 
  Shield, 
  MessageSquare, 
  ShoppingCart, 
  CreditCard, 
  Tag, 
  Monitor, 
  Calendar, 
  Bell, 
  BarChart3, 
  FileText, 
  Palette, 
  History,
  Settings,
  Search,
  HelpCircle,
  Lock,
  Edit3,
  Wrench,
  Building,
  Zap,
  Target,
  Star,
  Share,
  Database
} from 'lucide-react';
import { useState } from 'react';

interface AdminSidebarProps {
  currentSection: string;
  setCurrentSection: (section: string) => void;
  userRole: string;
  onExitAdmin?: () => void;
  badges?: Record<string, number>;
}

interface AdminSection { id: string; title: string; icon: React.ElementType; adminOnly?: boolean }
interface AdminGroup { id: string; title: string; items: AdminSection[] }

export function AdminSidebar({ currentSection, setCurrentSection, userRole, onExitAdmin, badges = {} }: AdminSidebarProps) {
  
  const groups: AdminGroup[] = [
    { id: 'core', title: 'Dashboard', items: [
      { id: 'dashboard', title: 'Dashboard', icon: Home },
    ]},
    { id: 'users', title: 'User Management', items: [
      { id: 'users', title: 'All Users', icon: Users },
      { id: 'verification', title: 'Verification Queue', icon: Shield },
      { id: 'garage-verification', title: 'Garage Verification', icon: Building },
      { id: 'vendor-verification', title: 'Vendor Verification', icon: ShoppingCart },
    ]},
    { id: 'marketplace', title: 'Marketplace', items: [
      { id: 'marketplace', title: 'Listings', icon: ShoppingCart },
      { id: 'listings-approval', title: 'Listings Approval', icon: ShoppingCart, adminOnly: true },
      { id: 'offers', title: 'Offers Management', icon: Tag },
      { id: 'marketplace-settings', title: 'Settings', icon: Settings, adminOnly: true },
      { id: 'ads', title: 'Ads & Monetization', icon: Monitor, adminOnly: true },
    ]},
    { id: 'community', title: 'Community', items: [
      { id: 'community', title: 'Community', icon: MessageSquare },
    ]},
    { id: 'events', title: 'Events', items: [
      { id: 'events', title: 'Events', icon: Calendar },
    ]},
    { id: 'payments', title: 'Payments & Wallet', items: [
      { id: 'transactions', title: 'Transactions', icon: CreditCard, adminOnly: true },
      { id: 'refunds', title: 'Refunds', icon: CreditCard, adminOnly: true },
    ]},
    { id: 'boost', title: 'Boosting System', items: [
      { id: 'boost-management', title: 'Boost Management', icon: Zap },
      { id: 'listing-management', title: 'Listing & Boost Management', icon: CreditCard, adminOnly: true },
      { id: 'bid-management', title: 'Bid Repair Management', icon: Wrench, adminOnly: true },
      { id: 'repair-bid-credits', title: 'Repair Bid Credits', icon: CreditCard, adminOnly: true },
    ]},
    { id: 'xp', title: 'XP & Rewards', items: [
      { id: 'xp-management', title: 'XP Management', icon: Star },
      { id: 'daily-challenges', title: 'Daily Challenges', icon: Target },
      { id: 'referral-management', title: 'Referral System', icon: Share },
    ]},
    { id: 'notifications', title: 'Notifications', items: [
      { id: 'notifications', title: 'Notifications', icon: Bell },
    ]},
    { id: 'database', title: 'Database', items: [
      { id: 'supabase', title: 'Supabase', icon: Database },
    ]},
    { id: 'settings', title: 'Settings', items: [
      { id: 'security', title: 'Security Center', icon: Lock, adminOnly: true },
      { id: 'support', title: 'Support Center', icon: HelpCircle },
      { id: 'legal', title: 'Legal & Consent', icon: FileText, adminOnly: true },
      { id: 'logs', title: 'System Logs', icon: History },
    ]},
  ];
  const [open, setOpen] = useState<Record<string, boolean>>(() => Object.fromEntries(groups.map(g => [g.id, true])) as Record<string, boolean>);

  return (
    <div className="w-72 bg-[var(--sublimes-card-bg)] border-r border-[var(--sublimes-border)] flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[var(--sublimes-border)]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[var(--sublimes-gold)] rounded-lg flex items-center justify-center">
            <Settings className="w-6 h-6 text-[var(--sublimes-dark-bg)]" />
          </div>
          <div>
            <h1 className="font-bold text-[var(--sublimes-light-text)]">Admin Panel</h1>
            <p className="text-xs text-gray-400">Sublimes Drive Management</p>
          </div>
        </div>
      </div>

      {/* User Profile Section - REAL DATA */}
      <div className="hidden"></div>

      <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
        {groups.map((group) => {
          const expanded = open[group.id];
          return (
            <div key={group.id}>
              <button
                onClick={() => setOpen({ ...open, [group.id]: !expanded })}
                className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] uppercase tracking-wider text-gray-500 hover:text-[var(--sublimes-light-text)]"
              >
                <span>{group.title}</span>
                {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {expanded && (
                <div className="mt-1 space-y-0.5">
                  {group.items
                    .filter(item => !item.adminOnly || userRole === 'admin')
                    .map((item) => {
                      const Icon = item.icon;
                      const isActive = currentSection === item.id;
                      const badge = badges[item.id];
                      return (
                        <div key={item.id} className="ml-2">
                          <button
                            onClick={() => setCurrentSection(item.id)}
                            className={`w-full flex items-center justify-between pl-3 pr-3 py-1.5 rounded-lg text-left transition-colors text-[12px] ${
                              isActive
                                ? 'bg-[#0F1829] border border-[#1A2332] text-[#E8EAED] border-l-2 border-l-[var(--sublimes-gold)]'
                                : 'text-gray-400 hover:text-[var(--sublimes-light-text)] hover:bg-[var(--sublimes-dark-bg)]'
                            }`}
                          >
                            <span className="flex items-center space-x-3">
                              <Icon className="w-4 h-4 flex-shrink-0" />
                              <span className="font-medium">{item.title}</span>
                            </span>
                            {badge ? (
                              <span className="text-[10px] leading-none px-1.5 py-0.5 rounded-full bg-red-500 text-white">{badge}</span>
                            ) : null}
                          </button>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--sublimes-border)] space-y-3">
        <button
          onClick={onExitAdmin}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] hover:bg-[var(--sublimes-dark-bg)]/80"
        >
          <span>Exit to Main Site</span>
        </button>
        <div className="text-center">
          <p className="text-xs text-gray-500">Sublimes Drive Admin v1.0</p>
          <p className="text-xs text-gray-500 mt-1"> 2025 All rights reserved</p>
        </div>
      </div>
    </div>
  );
}