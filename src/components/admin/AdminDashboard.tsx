import { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHome_Wired } from './AdminHome_Wired';
import { AdminUsersPage_COMPLETE } from './AdminUsersPage_COMPLETE';

// ✅ UNIFIED ADMIN PAGES (Tabs-based)
import { AdminVerificationUnified } from './AdminVerificationUnified';
import { AdminNotificationsUnified } from './AdminNotificationsUnified';
import { AdminBoostingUnified } from './AdminBoostingUnified';
import { AdminMarketplacePage_COMPLETE, AdminAnalyticsPage_COMPLETE } from './ALL_ADMIN_PAGES_WIRED';
import { AdminCommunityPageFixed } from './AdminCommunityPageFixed';
import { AdminPaymentsPage_Wired } from './AdminPaymentsPage_Wired';
import { AdminAdsPage_Wired } from './REMAINING_ADMIN_PAGES';
import { AdminEventsPage_Wired } from './AdminEventsPage_Wired';
import { AdminDailyChallengesPage } from './AdminDailyChallengesPage';
import { AdminTransactions_COMPLETE } from './AdminTransactions_COMPLETE';
import { AdminSystemLogs_COMPLETE } from './AdminSystemLogs_COMPLETE';
import { AdminOffersManagement_COMPLETE, AdminKnowledgeBase_COMPLETE } from './ALL_REMAINING_ADMIN_PAGES_COMPLETE';
import {
  AdminLegalPage_Wired,
  AdminBrandKitPage_Wired,
  AdminSecurityCenter_Wired,
  AdminSEOCenter_Wired,
  AdminSupportCenter_Wired,
  AdminContentManagement_Wired,
  AdminBidManagementPage_Wired,
  AdminAutoApprovalPage_Wired,
  AdminRepairBidCreditsPage_Wired,
  AdminListingManagementPage_Wired,
  AdminXPManagementPage_Wired,
  AdminReferralManagementPage_Wired,
  AdminSupabasePage_Wired,
  AdminBillingTariffPage_Wired,
  AdminRefundsPage_Wired
} from './REMAINING_ADMIN_PAGES';
import { AdminListingsApprovalPage_Wired } from './AdminListingsApprovalPage_Wired';
import { AdminSettingsProvider } from './AdminSettingsContext';
import { useRole } from '../../src/hooks';
import { LogOut, ArrowLeft, Bell, Search, User } from 'lucide-react';
import { Input } from '../ui/input';
// ✅ Freya AI Admin
import { AdminFreyaEnhanced } from '../../modules/freya/AdminFreyaEnhanced';

interface AdminDashboardProps {
  onExitAdmin: () => void;
}

export function AdminDashboard({ onExitAdmin }: AdminDashboardProps) {
  const [currentSection, setCurrentSection] = useState('dashboard');
  const { loading, isAdmin, isAdminOrEditor } = useRole();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--sublimes-dark-bg)] flex items-center justify-center">
        <div className="text-center text-[var(--sublimes-light-text)]">Checking permissions...</div>
      </div>
    );
  }

  // Check if user has admin access
  if (!isAdminOrEditor) {
    return (
      <div className="min-h-screen bg-[var(--sublimes-dark-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m9-9a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-2">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access this area.</p>
          <button 
            onClick={onExitAdmin}
            className="mt-4 px-6 py-2 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] rounded-lg font-medium hover:bg-[var(--sublimes-gold)]/90 transition-colors"
          >
            Return to App
          </button>
        </div>
      </div>
    );
  }

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <AdminHome_Wired onNavigate={setCurrentSection} />;
      case 'supabase':
        return <AdminSupabasePage_Wired />;
      case 'users':
        return <AdminUsersPage_COMPLETE />;
      case 'verification':
        // ✅ UNIFIED: Single page with tabs for Car Owner, Garage, Vendor
        return <AdminVerificationUnified />;
      case 'garage-verification':
        // Legacy route, redirect to unified
        return <AdminVerificationUnified />;
      case 'vendor-verification':
        // Legacy route, redirect to unified
        return <AdminVerificationUnified />;
      case 'billing-tariff':
        return <AdminBillingTariffPage_Wired />;
      case 'transactions':
        return <AdminTransactions_COMPLETE />;
      case 'refunds':
        return <AdminRefundsPage_Wired />;
      case 'listings-approval':
        return <AdminListingsApprovalPage_Wired />;
      case 'community':
        return <AdminCommunityPageFixed />;
      case 'marketplace':
        return <AdminMarketplacePage_COMPLETE />;
      case 'payments':
        return <AdminPaymentsPage_Wired />;
      case 'offers':
        return <AdminOffersManagement_COMPLETE />;
      case 'ads':
        return <AdminAdsPage_Wired />;
      case 'events':
        return <AdminEventsPage_Wired />;
      case 'notifications':
        // ✅ UNIFIED: Single page with tabs for Push and Email
        return <AdminNotificationsUnified />;
      case 'legal':
        return <AdminLegalPage_Wired />;
      case 'logs':
        return <AdminSystemLogs_COMPLETE />;
      case 'security':
        return <AdminSecurityCenter_Wired />;
      case 'support':
        return <AdminSupportCenter_Wired />;
      case 'bid-management':
        return <AdminBidManagementPage_Wired />;
      case 'auto-approval':
        return <AdminAutoApprovalPage_Wired />;
      case 'listing-management':
        return <AdminListingManagementPage_Wired />;
      case 'daily-challenges':
        // ✅ FULL IMPLEMENTATION: Complete Daily Challenges admin page
        return <AdminDailyChallengesPage />;
      case 'xp-management':
        return <AdminXPManagementPage_Wired />;
      case 'referral-management':
        return <AdminReferralManagementPage_Wired />;
      case 'boost':
        // ✅ UNIFIED: Single page with tabs for Marketplace and Garage Hub boosts
        return <AdminBoostingUnified />;
      case 'boost-management':
        // Legacy route, redirect to unified
        return <AdminBoostingUnified />;
      case 'repair-bid-credits':
        return <AdminRepairBidCreditsPage_Wired />;
      case 'ai-assistant':
        // ✅ Freya AI Admin Panel
        return <AdminFreyaEnhanced />;
      default:
        return <AdminHome_Wired onNavigate={setCurrentSection} />;
    }
  };

  return (
    <AdminSettingsProvider>
      <div className="min-h-screen bg-[var(--sublimes-dark-bg)] flex flex-col">
        {/* Admin Header */}
        <div className="bg-[var(--sublimes-card-bg)] border-b border-[var(--sublimes-border)] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onExitAdmin}
              className="flex items-center space-x-2 px-3 py-2 text-gray-400 hover:text-[var(--sublimes-light-text)] hover:bg-[var(--sublimes-dark-bg)] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to App</span>
            </button>
            <div className="w-px h-6 bg-[var(--sublimes-border)]"></div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--sublimes-light-text)]">Admin Dashboard</h1>
              <p className="text-xs text-gray-400">Sublimes Drive Management</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Search..."
                  className="pl-9 w-72 bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] placeholder:text-gray-500"
                />
              </div>
            </div>

            <button className="relative p-2 rounded-lg hover:bg-[var(--sublimes-dark-bg)] text-gray-400 hover:text-[var(--sublimes-light-text)]">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 text-[10px] leading-none px-1.5 py-0.5 rounded-full bg-red-500 text-white">3</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)]">
              <div className="w-6 h-6 rounded-full bg-[var(--sublimes-gold)]/20 flex items-center justify-center">
                <User className="w-4 h-4 text-[var(--sublimes-gold)]" />
              </div>
              <div className="leading-tight">
                <div className="text-xs text-gray-400">{isAdmin ? 'admin' : 'editor'}</div>
                <div className="text-xs font-medium text-[var(--sublimes-light-text)]">Administrator</div>
              </div>
            </div>

            <div className="px-3 py-1 bg-[var(--sublimes-gold)]/10 text-[var(--sublimes-gold)] rounded-full text-sm font-medium">
              {isAdmin ? 'Super Admin' : 'Editor'}
            </div>
            <button
              onClick={onExitAdmin}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit Admin</span>
            </button>
          </div>
        </div>

        {/* Admin Body */}
        <div className="flex flex-1">
          {/* Admin Sidebar */}
          <AdminSidebar 
            currentSection={currentSection} 
            setCurrentSection={setCurrentSection}
            userRole={isAdmin ? 'admin' : 'editor'}
            onExitAdmin={onExitAdmin}
            badges={{ community: 12, notifications: 3 }}
          />
          
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto relative">
            {renderCurrentSection()}
          </div>
        </div>
      </div>
    </AdminSettingsProvider>
  );
}