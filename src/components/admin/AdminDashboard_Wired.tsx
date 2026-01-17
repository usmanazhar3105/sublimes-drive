/**
 * AdminDashboard_Wired - Database-connected Admin Dashboard
 * Uses: useProfile, useAnalytics
 */

import { useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { LogOut, ArrowLeft, Loader2, Shield } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useProfile, useAnalytics } from '../../src/hooks';
import { AdminSettingsProvider } from './AdminSettingsContext';

// Import ALL wired admin pages
import { AdminHome_Wired } from './AdminHome_Wired';
import { AdminMarketplaceSettingsPage_WIRED } from './AdminMarketplaceSettingsPage_WIRED';
import { AdminMarketplaceAnalyticsPage_WIRED } from './AdminMarketplaceAnalyticsPage_WIRED';
import { AdminMarketplacePageFixed_WIRED } from './AdminMarketplacePageFixed_WIRED';
import { AdminOffersPage_COMPLETE } from './AdminOffersPage_COMPLETE';
import { AdminUsersPage } from './AdminUsersPage';
import { AdminCommunityPage_Wired } from './AdminCommunityPage_Wired';
import { AdminEventsPage_Wired } from './AdminEventsPage_Wired';
import { AdminGarageVerificationPage_Wired } from './AdminGarageVerificationPage_Wired';
import { AdminVendorVerificationPage_Wired } from './AdminVendorVerificationPage_Wired';
import { AdminListingsApprovalPage_Wired } from './AdminListingsApprovalPage_Wired';
import { AdminPaymentsPage_Wired } from './AdminPaymentsPage_Wired';

// Import ALL remaining admin pages (FIXED)
import {
  AdminXPManagementPage_Wired,
  AdminReferralManagementPage_Wired,
  AdminAutoApprovalPage_Wired,
  AdminSupabasePage_Wired,
  AdminListingManagementPage_Wired,
  AdminBidManagementPage_Wired,
  AdminRepairBidPage_Wired,
  AdminRepairBidCreditsPage_Wired,
  AdminRefundsPage_Wired,
  AdminAdsPage_Wired,
  AdminSecurityCenter_Wired,
  AdminSupportCenter_Wired,
  AdminLegalPage_Wired,
  AdminBillingTariffPage_Wired,
  AdminTransactionsPage_Wired,
  AdminDailyChallengesPage_Wired,
  AdminLogsPage_Wired
} from './REMAINING_ADMIN_PAGES';

// Import unified admin pages
import { AdminVerificationUnified } from './AdminVerificationUnified';
import { AdminNotificationsUnified } from './AdminNotificationsUnified';
import { AdminBoostingUnified } from './AdminBoostingUnified';

interface AdminDashboardProps {
  onExitAdmin: () => void;
}

export function AdminDashboard({ onExitAdmin }: AdminDashboardProps) {
  const [currentSection, setCurrentSection] = useState('dashboard');
  
  const { profile, loading } = useProfile();
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView('/admin/dashboard');
  }, []);

  // Check if user has admin access
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super-admin';
  const isEditor = profile?.role === 'editor';
  const hasAccess = isAdmin || isEditor;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1426] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  // Access denied
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[#0B1426] flex items-center justify-center p-4">
        <Card className="bg-[#0F1829] border-red-500/30 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl text-[#E8EAED] mb-2" style={{ fontWeight: 600 }}>
              Access Denied
            </h1>
            <p className="text-[#8B92A7] mb-6">
              You don't have permission to access the admin dashboard.
            </p>
            <Button
              onClick={onExitAdmin}
              className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A037]"
            >
              <ArrowLeft className="mr-2" size={20} />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <AdminSettingsProvider>
      <div className="min-h-screen bg-[#0B1426]">
        {/* Admin Header */}
        <div className="bg-[#0F1829] border-b border-[#1A2332] sticky top-0 z-50">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center">
                <Shield className="text-[#D4AF37]" size={24} />
              </div>
              <div>
              <h1 className="text-xl text-[#E8EAED]" style={{ fontWeight: 600 }}>
                Admin Dashboard
              </h1>
              <p className="text-sm text-[#8B92A7]">Sublimes Drive Management</p>
            </div>
          </div>
          <Button
            onClick={onExitAdmin}
            variant="outline"
            className="border-[#1A2332] text-[#E8EAED] hover:bg-[#1A2332]"
          >
            <LogOut className="mr-2" size={16} />
            Exit Admin
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        <AdminSidebar 
          currentSection={currentSection} 
          setCurrentSection={setCurrentSection}
          userRole={profile?.role || 'user'}
        />
        
        <main className="flex-1 p-6">
          {currentSection === 'dashboard' && <AdminHome_Wired />}
          
          {/* Users & Verification */}
          {currentSection === 'users' && <AdminUsersPage />}
          {currentSection === 'verification' && <AdminVerificationUnified />}
          {currentSection === 'garage-verification' && <AdminGarageVerificationPage_Wired />}
          {currentSection === 'vendor-verification' && <AdminVendorVerificationPage_Wired />}
          
          {/* Content Management */}
          {currentSection === 'community' && <AdminCommunityPage_Wired />}
          {currentSection === 'auto-approval' && <AdminAutoApprovalPage_Wired />}
          
          {/* XP & Gamification */}
          {currentSection === 'xp-management' && <AdminXPManagementPage_Wired />}
          {currentSection === 'referral-management' && <AdminReferralManagementPage_Wired />}
          {currentSection === 'daily-challenges' && <AdminDailyChallengesPage_Wired />}
          
          {/* Events */}
          {currentSection === 'events' && <AdminEventsPage_Wired />}
          
          {/* Marketplace */}
          {currentSection === 'marketplace' && <AdminMarketplacePageFixed_WIRED />}
          {currentSection === 'marketplace-settings' && <AdminMarketplaceSettingsPage_WIRED />}
          {currentSection === 'marketplace-analytics' && <AdminMarketplaceAnalyticsPage_WIRED />}
          {currentSection === 'listings-approval' && <AdminListingsApprovalPage_Wired />}
          {currentSection === 'listing-management' && <AdminListingManagementPage_Wired />}
          
          {/* Offers & Payments */}
          {currentSection === 'offers' && <AdminOffersPage_COMPLETE />}
          {currentSection === 'payments' && <AdminPaymentsPage_Wired />}
          {currentSection === 'transactions' && <AdminTransactionsPage_Wired />}
          {currentSection === 'refunds' && <AdminRefundsPage_Wired />}
          
          {/* Boost & Notifications */}
          {currentSection === 'boost' && <AdminBoostingUnified />}
          {currentSection === 'boost-management' && <AdminBoostingUnified />}
          {currentSection === 'notifications' && <AdminNotificationsUnified />}
          
          {/* Bid Repair */}
          {currentSection === 'bid-management' && <AdminBidManagementPage_Wired />}
          {currentSection === 'repair-bid-credits' && <AdminRepairBidCreditsPage_Wired />}
          
          {/* System & Settings */}
          {currentSection === 'supabase' && <AdminSupabasePage_Wired />}
          {currentSection === 'security' && <AdminSecurityCenter_Wired />}
          {currentSection === 'support' && <AdminSupportCenter_Wired />}
          {currentSection === 'ads' && <AdminAdsPage_Wired />}
          {currentSection === 'legal' && <AdminLegalPage_Wired />}
          {currentSection === 'billing-tariff' && <AdminBillingTariffPage_Wired />}
          
          {/* System Logs */}
          {currentSection === 'logs' && <AdminLogsPage_Wired />}
          
          {/* Fallback for truly unimplemented sections */}
          {!['dashboard', 'users', 'verification', 'garage-verification', 'vendor-verification', 
              'community', 'auto-approval',
              'xp-management', 'referral-management', 'daily-challenges',
              'events', 'marketplace', 'marketplace-settings', 'marketplace-analytics', 
              'listings-approval', 'listing-management',
              'offers', 'payments', 'transactions', 'refunds',
              'boost', 'boost-management', 'notifications',
              'bid-management', 'repair-bid-credits',
              'supabase', 'security', 'support', 'ads', 'legal', 'billing-tariff',
              'logs'].includes(currentSection) && (
            <div className="text-center py-16">
              <p className="text-[#8B92A7]">{currentSection} - Coming Soon</p>
              <p className="text-xs text-gray-500 mt-2">This module is being wired to the database</p>
            </div>
          )}
        </main>
      </div>
    </div>
    </AdminSettingsProvider>
  );
}
