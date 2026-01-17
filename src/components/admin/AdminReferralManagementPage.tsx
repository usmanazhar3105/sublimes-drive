/**
 * Admin Referral Management Page
 * Re-exports the complete database-connected implementation
 */

// Re-export the complete implementation
export { AdminReferralManagement_Complete as AdminReferralManagementPage } from './AdminReferralManagement_Complete';
export { AdminReferralManagement_Complete as default } from './AdminReferralManagement_Complete';

// ============================================================================
// LEGACY IMPLEMENTATION BELOW - KEPT FOR REFERENCE ONLY
// The active implementation is in AdminReferralManagement_Complete.tsx
// ============================================================================

import { useState } from 'react';
import { DateRangeFilter } from './DateRangeFilter';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { 
  Search, 
  Download, 
  Users,
  UserPlus,
  TrendingUp,
  Settings,
  Eye,
  Edit,
  MoreVertical,
  Award,
  Target,
  Bell,
  Calendar,
  Gift,
  Zap,
  ChevronRight,
  Filter,
  SortDesc,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Star,
  Trophy,
  Share,
  Link,
  CreditCard,
  BarChart3,
  TrendingDown,
  Activity,
  DollarSign,
  Users2,
  Building
} from 'lucide-react';

interface Referral {
  id: string;
  referrerId: string;
  referrerName: string;
  referrerType: 'car_owner' | 'garage_owner';
  referrerEmail: string;
  referredUserId: string;
  referredUserName: string;
  referredUserEmail: string;
  referredUserType: 'car_owner' | 'garage_owner';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  rewardType: 'xp' | 'bid_credits';
  rewardAmount: number;
  rewardAwarded: boolean;
  createdAt: Date;
  approvedAt?: Date;
  completedAt?: Date;
  referralCode: string;
  notes?: string;
}

interface ReferralStats {
  totalReferrals: number;
  pendingApproval: number;
  completed: number;
  totalXPAwarded: number;
  totalCreditsAwarded: number;
  carOwnerReferrals: number;
  garageOwnerReferrals: number;
  conversionRate: number;
  topReferrer: string;
}

interface ReferralSettings {
  carOwnerXPReward: number;
  garageOwnerCreditReward: number;
  requireApproval: boolean;
  autoApprove: boolean;
  autoApproveAfterDays: number;
  enableReferralCodes: boolean;
  maxReferralsPerUser: number;
  enableReferralNotifications: boolean;
  referralValidityDays: number;
}

interface TopReferrer {
  id: string;
  name: string;
  type: 'car_owner' | 'garage_owner';
  totalReferrals: number;
  successfulReferrals: number;
  totalRewards: number;
  rewardType: 'xp' | 'bid_credits';
  avatar?: string;
}

// Legacy function - not exported, kept for reference
function AdminReferralManagementPage_Legacy() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReferral, setEditingReferral] = useState<Referral | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Mock referral data
  const [referrals, setReferrals] = useState<Referral[]>([
    {
      id: '1',
      referrerId: 'user_1',
      referrerName: 'Ahmed Hassan',
      referrerType: 'car_owner',
      referrerEmail: 'ahmed@example.com',
      referredUserId: 'user_5',
      referredUserName: 'Mohammed Ali',
      referredUserEmail: 'mohammed@example.com',
      referredUserType: 'car_owner',
      status: 'completed',
      rewardType: 'xp',
      rewardAmount: 5,
      rewardAwarded: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      referralCode: 'AHMED2024'
    },
    {
      id: '2',
      referrerId: 'garage_1',
      referrerName: 'Dubai Auto Center',
      referrerType: 'garage_owner',
      referrerEmail: 'dubai.auto@example.com',
      referredUserId: 'garage_5',
      referredUserName: 'Sharjah Motors',
      referredUserEmail: 'sharjah.motors@example.com',
      referredUserType: 'garage_owner',
      status: 'pending',
      rewardType: 'bid_credits',
      rewardAmount: 10,
      rewardAwarded: false,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      referralCode: 'DUBAI_GARAGE2024'
    },
    {
      id: '3',
      referrerId: 'user_2',
      referrerName: 'Sara Al-Rashid',
      referrerType: 'car_owner',
      referrerEmail: 'sara@example.com',
      referredUserId: 'user_6',
      referredUserName: 'Fatima Ahmed',
      referredUserEmail: 'fatima@example.com',
      referredUserType: 'car_owner',
      status: 'approved',
      rewardType: 'xp',
      rewardAmount: 5,
      rewardAwarded: false,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      referralCode: 'SARA2024'
    }
  ]);

  const [referralSettings, setReferralSettings] = useState<ReferralSettings>({
    carOwnerXPReward: 5,
    garageOwnerCreditReward: 10,
    requireApproval: true,
    autoApprove: false,
    autoApproveAfterDays: 7,
    enableReferralCodes: true,
    maxReferralsPerUser: 50,
    enableReferralNotifications: true,
    referralValidityDays: 30
  });

  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([
    {
      id: 'user_1',
      name: 'Ahmed Hassan',
      type: 'car_owner',
      totalReferrals: 12,
      successfulReferrals: 10,
      totalRewards: 50,
      rewardType: 'xp'
    },
    {
      id: 'garage_1',
      name: 'Dubai Auto Center',
      type: 'garage_owner',
      totalReferrals: 8,
      successfulReferrals: 6,
      totalRewards: 60,
      rewardType: 'bid_credits'
    },
    {
      id: 'user_2',
      name: 'Sara Al-Rashid',
      type: 'car_owner',
      totalReferrals: 7,
      successfulReferrals: 5,
      totalRewards: 25,
      rewardType: 'xp'
    }
  ]);

  // Calculate statistics
  const stats: ReferralStats = {
    totalReferrals: referrals.length,
    pendingApproval: referrals.filter(r => r.status === 'pending').length,
    completed: referrals.filter(r => r.status === 'completed').length,
    totalXPAwarded: referrals.filter(r => r.rewardType === 'xp' && r.rewardAwarded).reduce((sum, r) => sum + r.rewardAmount, 0),
    totalCreditsAwarded: referrals.filter(r => r.rewardType === 'bid_credits' && r.rewardAwarded).reduce((sum, r) => sum + r.rewardAmount, 0),
    carOwnerReferrals: referrals.filter(r => r.referrerType === 'car_owner').length,
    garageOwnerReferrals: referrals.filter(r => r.referrerType === 'garage_owner').length,
    conversionRate: referrals.length > 0 ? Math.round((referrals.filter(r => r.status === 'completed').length / referrals.length) * 100) : 0,
    topReferrer: topReferrers.length > 0 ? topReferrers[0].name : 'N/A'
  };

  const filteredReferrals = referrals.filter(referral => {
    const matchesSearch = referral.referrerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         referral.referredUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         referral.referrerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         referral.referredUserEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         referral.referralCode.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || referral.status === statusFilter;
    const matchesType = typeFilter === 'all' || referral.referrerType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSelectAll = () => {
    if (selectedItems.length === filteredReferrals.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredReferrals.map(referral => referral.id));
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleExportData = (selectedIds: string[], dateRange: { from: string; to: string }) => {
    const referralsToExport = selectedIds.length > 0 
      ? filteredReferrals.filter(referral => selectedIds.includes(referral.id))
      : filteredReferrals;
    
    // Apply date filter if provided
    let filteredReferrals_export = referralsToExport;
    if (dateRange?.from || dateRange?.to) {
      filteredReferrals_export = referralsToExport.filter(referral => {
        const referralDate = new Date(referral.createdAt);
        const fromDate = dateRange.from ? new Date(dateRange.from) : null;
        const toDate = dateRange.to ? new Date(dateRange.to) : null;
        
        if (fromDate && referralDate < fromDate) return false;
        if (toDate && referralDate > toDate) return false;
        return true;
      });
    }

    // Create CSV content
    const headers = ['ID', 'Referrer Name', 'Referrer Type', 'Referrer Email', 'Referred User', 'Referred User Email', 'Status', 'Reward Type', 'Reward Amount', 'Reward Awarded', 'Referral Code', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...filteredReferrals_export.map(referral => [
        referral.id,
        `"${referral.referrerName}"`,
        referral.referrerType,
        referral.referrerEmail,
        `"${referral.referredUserName}"`,
        referral.referredUserEmail,
        referral.status,
        referral.rewardType,
        referral.rewardAmount,
        referral.rewardAwarded ? 'Yes' : 'No',
        referral.referralCode,
        referral.createdAt.toISOString().split('T')[0]
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `referrals_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toast.success(`✅ Exported ${filteredReferrals_export.length} referrals to CSV!`);
  };

  const handleApproveReferral = (referralId: string) => {
    setReferrals(prev => prev.map(referral => 
      referral.id === referralId 
        ? { ...referral, status: 'approved' as const, approvedAt: new Date() }
        : referral
    ));
    toast.success('✅ Referral approved successfully!');
  };

  const handleRejectReferral = (referralId: string) => {
    setReferrals(prev => prev.map(referral => 
      referral.id === referralId 
        ? { ...referral, status: 'rejected' as const }
        : referral
    ));
    toast.success('✅ Referral rejected successfully!');
  };

  const handleAwardReward = (referralId: string) => {
    setReferrals(prev => prev.map(referral => 
      referral.id === referralId 
        ? { ...referral, rewardAwarded: true, status: 'completed' as const, completedAt: new Date() }
        : referral
    ));
    toast.success('✅ Reward awarded successfully!');
  };

  const handleBulkApprove = () => {
    const selectedReferrals = referrals.filter(r => selectedItems.includes(r.id) && r.status === 'pending');
    setReferrals(prev => prev.map(referral => 
      selectedItems.includes(referral.id) && referral.status === 'pending'
        ? { ...referral, status: 'approved' as const, approvedAt: new Date() }
        : referral
    ));
    setSelectedItems([]);
    toast.success(`✅ Approved ${selectedReferrals.length} referrals!`);
  };

  const handleBulkReject = () => {
    const selectedReferrals = referrals.filter(r => selectedItems.includes(r.id) && r.status === 'pending');
    setReferrals(prev => prev.map(referral => 
      selectedItems.includes(referral.id) && referral.status === 'pending'
        ? { ...referral, status: 'rejected' as const }
        : referral
    ));
    setSelectedItems([]);
    toast.success(`✅ Rejected ${selectedReferrals.length} referrals!`);
  };

  const handleBulkAwardRewards = () => {
    const selectedReferrals = referrals.filter(r => selectedItems.includes(r.id) && r.status === 'approved' && !r.rewardAwarded);
    setReferrals(prev => prev.map(referral => 
      selectedItems.includes(referral.id) && referral.status === 'approved' && !referral.rewardAwarded
        ? { ...referral, rewardAwarded: true, status: 'completed' as const, completedAt: new Date() }
        : referral
    ));
    setSelectedItems([]);
    toast.success(`✅ Awarded rewards for ${selectedReferrals.length} referrals!`);
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-400">Total Referrals</p>
              <p className="text-2xl font-bold text-blue-400">{stats.totalReferrals}</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-400">Pending Approval</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.pendingApproval}</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] p-6">
          <div className="flex items-center">
            <div className="p-2 bg-[var(--sublimes-gold)]/20 rounded-lg">
              <Star className="w-6 h-6 text-[var(--sublimes-gold)]" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-400">Total XP Awarded</p>
              <p className="text-2xl font-bold text-[var(--sublimes-gold)]">{stats.totalXPAwarded}</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <CreditCard className="w-6 h-6 text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-400">Total Credits Awarded</p>
              <p className="text-2xl font-bold text-purple-400">{stats.totalCreditsAwarded}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Car Owner Referrals</p>
              <p className="text-xl font-bold text-[var(--sublimes-light-text)]">{stats.carOwnerReferrals}</p>
            </div>
            <Users2 className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Garage Owner Referrals</p>
              <p className="text-xl font-bold text-[var(--sublimes-light-text)]">{stats.garageOwnerReferrals}</p>
            </div>
            <Building className="w-8 h-8 text-orange-400" />
          </div>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Conversion Rate</p>
              <p className="text-xl font-bold text-[var(--sublimes-light-text)]">{stats.conversionRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Top Referrer</p>
              <p className="text-sm font-bold text-[var(--sublimes-light-text)]">{stats.topReferrer}</p>
            </div>
            <Trophy className="w-8 h-8 text-[var(--sublimes-gold)]" />
          </div>
        </div>
      </div>

      {/* Referral Log */}
      <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)]">
        <div className="p-6 border-b border-[var(--sublimes-border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Share className="w-5 h-5 text-[var(--sublimes-gold)]" />
              <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Referral Log</h3>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, email, or referral code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
            >
              <option value="all">All Types</option>
              <option value="car_owner">Car Owners</option>
              <option value="garage_owner">Garage Owners</option>
            </select>
            
            <DateRangeFilter onExport={handleExportData} selectedItems={selectedItems} />
          </div>

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="mb-4 p-4 bg-[var(--sublimes-gold)]/10 border border-[var(--sublimes-gold)]/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--sublimes-light-text)]">
                  {selectedItems.length} referral(s) selected
                </span>
                <div className="flex space-x-2">
                  <button 
                    onClick={handleBulkApprove}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Bulk Approve
                  </button>
                  <button 
                    onClick={handleBulkReject}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Bulk Reject
                  </button>
                  <button 
                    onClick={handleBulkAwardRewards}
                    className="px-3 py-1 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] rounded text-sm hover:bg-[var(--sublimes-gold)]/90"
                  >
                    Award Rewards
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--sublimes-border)]">
                  <th className="text-left p-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredReferrals.length && filteredReferrals.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)] text-[var(--sublimes-gold)]"
                    />
                  </th>
                  <th className="text-left p-4 text-[var(--sublimes-light-text)]">Date</th>
                  <th className="text-left p-4 text-[var(--sublimes-light-text)]">Referrer</th>
                  <th className="text-left p-4 text-[var(--sublimes-light-text)]">Referred User</th>
                  <th className="text-left p-4 text-[var(--sublimes-light-text)]">Status</th>
                  <th className="text-left p-4 text-[var(--sublimes-light-text)]">Reward</th>
                  <th className="text-left p-4 text-[var(--sublimes-light-text)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReferrals.map((referral) => (
                  <tr key={referral.id} className="border-b border-[var(--sublimes-border)] hover:bg-[var(--sublimes-dark-bg)]/30">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(referral.id)}
                        onChange={() => handleSelectItem(referral.id)}
                        className="rounded border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)] text-[var(--sublimes-gold)]"
                      />
                    </td>
                    <td className="p-4">
                      <span className="text-gray-400">
                        {referral.createdAt.toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          referral.referrerType === 'car_owner' 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : 'bg-orange-500/20 text-orange-400'
                        }`}>
                          {referral.referrerType === 'car_owner' ? <Users2 className="w-4 h-4" /> : <Building className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--sublimes-light-text)]">{referral.referrerName}</p>
                          <p className="text-xs text-gray-400">{referral.referrerEmail}</p>
                          <p className="text-xs text-gray-500">Code: {referral.referralCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-[var(--sublimes-light-text)]">{referral.referredUserName}</p>
                        <p className="text-xs text-gray-400">{referral.referredUserEmail}</p>
                        <p className="text-xs text-gray-500 capitalize">{referral.referredUserType.replace('_', ' ')}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        referral.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        referral.status === 'approved' ? 'bg-blue-500/20 text-blue-400' :
                        referral.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {referral.rewardType === 'xp' ? (
                          <Star className="w-4 h-4 text-[var(--sublimes-gold)]" />
                        ) : (
                          <CreditCard className="w-4 h-4 text-purple-400" />
                        )}
                        <span className={`font-bold ${
                          referral.rewardType === 'xp' ? 'text-[var(--sublimes-gold)]' : 'text-purple-400'
                        }`}>
                          {referral.rewardAmount} {referral.rewardType === 'xp' ? 'XP' : 'Credits'}
                        </span>
                        {referral.rewardAwarded && (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {referral.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveReferral(referral.id)}
                              className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRejectReferral(referral.id)}
                              className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <AlertCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {referral.status === 'approved' && !referral.rewardAwarded && (
                          <button
                            onClick={() => handleAwardReward(referral.id)}
                            className="p-2 text-[var(--sublimes-gold)] hover:bg-[var(--sublimes-gold)]/10 rounded-lg transition-colors"
                            title="Award Reward"
                          >
                            <Gift className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingReferral(referral);
                            setShowEditModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-[var(--sublimes-gold)] hover:bg-[var(--sublimes-gold)]/10 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredReferrals.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No referrals found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTopReferrersTab = () => (
    <div className="space-y-6">
      <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)]">
        <div className="p-6 border-b border-[var(--sublimes-border)]">
          <div className="flex items-center space-x-3">
            <Trophy className="w-5 h-5 text-[var(--sublimes-gold)]" />
            <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Top Referrers</h3>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {topReferrers.map((referrer, index) => (
              <div key={referrer.id} className="flex items-center justify-between p-4 bg-[var(--sublimes-dark-bg)] rounded-lg border border-[var(--sublimes-border)]">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-gray-400 text-black' :
                    index === 2 ? 'bg-orange-600 text-white' :
                    'bg-[var(--sublimes-border)] text-gray-400'
                  }`}>
                    #{index + 1}
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    referrer.type === 'car_owner' 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {referrer.type === 'car_owner' ? <Users2 className="w-5 h-5" /> : <Building className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--sublimes-light-text)]">{referrer.name}</p>
                    <p className="text-sm text-gray-400 capitalize">{referrer.type.replace('_', ' ')}</p>
                    <p className="text-xs text-gray-500">
                      {referrer.successfulReferrals}/{referrer.totalReferrals} successful
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    {referrer.rewardType === 'xp' ? (
                      <Star className="w-4 h-4 text-[var(--sublimes-gold)]" />
                    ) : (
                      <CreditCard className="w-4 h-4 text-purple-400" />
                    )}
                    <span className={`font-bold ${
                      referrer.rewardType === 'xp' ? 'text-[var(--sublimes-gold)]' : 'text-purple-400'
                    }`}>
                      {referrer.totalRewards} {referrer.rewardType === 'xp' ? 'XP' : 'Credits'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{referrer.totalReferrals} referrals</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Weekly Referrals</p>
              <p className="text-2xl font-bold text-blue-400">24</p>
              <p className="text-xs text-green-400">↑ 12% from last week</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Monthly Growth</p>
              <p className="text-2xl font-bold text-green-400">18%</p>
              <p className="text-xs text-green-400">↑ 5% from last month</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg. Time to Complete</p>
              <p className="text-2xl font-bold text-yellow-400">3.2</p>
              <p className="text-xs text-gray-400">days</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Referrers</p>
              <p className="text-2xl font-bold text-purple-400">156</p>
              <p className="text-xs text-green-400">↑ 8% this month</p>
            </div>
            <Activity className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] p-6">
          <h4 className="text-lg font-semibold text-[var(--sublimes-light-text)] mb-4">Referral Trends</h4>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-2" />
              <p>Chart visualization would go here</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] p-6">
          <h4 className="text-lg font-semibold text-[var(--sublimes-light-text)] mb-4">Conversion Funnel</h4>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-2" />
              <p>Funnel visualization would go here</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)]">
        <div className="p-6 border-b border-[var(--sublimes-border)]">
          <h4 className="text-lg font-semibold text-[var(--sublimes-light-text)]">Performance Breakdown</h4>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h5 className="font-medium text-[var(--sublimes-light-text)] mb-3">By User Type</h5>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Car Owners</span>
                  <span className="text-sm font-medium text-blue-400">{stats.carOwnerReferrals}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Garage Owners</span>
                  <span className="text-sm font-medium text-orange-400">{stats.garageOwnerReferrals}</span>
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-[var(--sublimes-light-text)] mb-3">Rewards Distribution</h5>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">XP Points</span>
                  <span className="text-sm font-medium text-[var(--sublimes-gold)]">{stats.totalXPAwarded}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Bid Credits</span>
                  <span className="text-sm font-medium text-purple-400">{stats.totalCreditsAwarded}</span>
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-[var(--sublimes-light-text)] mb-3">Success Metrics</h5>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Conversion Rate</span>
                  <span className="text-sm font-medium text-green-400">{stats.conversionRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Completion Rate</span>
                  <span className="text-sm font-medium text-green-400">{Math.round((stats.completed / stats.totalReferrals) * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      {/* Auto Approval Quick Settings */}
      <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)]">
        <div className="p-6 border-b border-[var(--sublimes-border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-5 h-5 text-[var(--sublimes-gold)]" />
              <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Auto Approval Settings</h3>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="flex items-center justify-between p-4 bg-[var(--sublimes-dark-bg)] rounded-lg border border-[var(--sublimes-border)]">
              <div>
                <span className="text-[var(--sublimes-light-text)] font-medium">Auto Approve All Referrals</span>
                <p className="text-sm text-gray-400">Automatically approve all new referrals without manual review</p>
              </div>
              <input
                type="checkbox"
                checked={referralSettings.autoApprove}
                onChange={(e) => {
                  setReferralSettings({...referralSettings, autoApprove: e.target.checked});
                  toast.success(e.target.checked ? '✅ Auto approval enabled!' : '⚠️ Auto approval disabled!');
                }}
                className="rounded border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)] text-[var(--sublimes-gold)] w-5 h-5"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-[var(--sublimes-dark-bg)] rounded-lg border border-[var(--sublimes-border)]">
              <div>
                <span className="text-[var(--sublimes-light-text)] font-medium">Enhanced Filtering</span>
                <p className="text-sm text-gray-400">Enable advanced filtering and sorting options</p>
              </div>
              <input
                type="checkbox"
                checked={true}
                onChange={() => {}}
                className="rounded border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)] text-[var(--sublimes-gold)] w-5 h-5"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)]">
        <div className="p-6 border-b border-[var(--sublimes-border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5 text-[var(--sublimes-gold)]" />
              <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Detailed Referral Settings</h3>
            </div>
            <button
              onClick={() => {
                toast.success('✅ Referral settings saved successfully!');
              }}
              className="px-4 py-2 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] rounded-lg hover:bg-[var(--sublimes-gold)]/90"
            >
              Save Settings
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Reward Configuration */}
          <div>
            <h4 className="text-lg font-semibold text-[var(--sublimes-light-text)] mb-4">Reward Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                  Car Owner XP Reward
                </label>
                <input
                  type="number"
                  value={referralSettings.carOwnerXPReward}
                  onChange={(e) => setReferralSettings({...referralSettings, carOwnerXPReward: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
                />
                <p className="text-xs text-gray-400 mt-1">XP points awarded to car owners for successful referrals</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                  Garage Owner Credit Reward
                </label>
                <input
                  type="number"
                  value={referralSettings.garageOwnerCreditReward}
                  onChange={(e) => setReferralSettings({...referralSettings, garageOwnerCreditReward: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
                />
                <p className="text-xs text-gray-400 mt-1">Bid credits awarded to garage owners for successful referrals</p>
              </div>
            </div>
          </div>

          {/* Approval Settings */}
          <div>
            <h4 className="text-lg font-semibold text-[var(--sublimes-light-text)] mb-4">Approval Settings</h4>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-[var(--sublimes-dark-bg)] rounded-lg border border-[var(--sublimes-border)]">
                <div>
                  <span className="text-[var(--sublimes-light-text)]">Require Manual Approval</span>
                  <p className="text-sm text-gray-400">All referrals must be manually approved by admin</p>
                </div>
                <input
                  type="checkbox"
                  checked={referralSettings.requireApproval}
                  onChange={(e) => setReferralSettings({...referralSettings, requireApproval: e.target.checked})}
                  className="rounded border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)] text-[var(--sublimes-gold)]"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-[var(--sublimes-dark-bg)] rounded-lg border border-[var(--sublimes-border)]">
                <div>
                  <span className="text-[var(--sublimes-light-text)]">Auto Approve Referrals</span>
                  <p className="text-sm text-gray-400">Automatically approve all new referrals without manual review</p>
                </div>
                <input
                  type="checkbox"
                  checked={referralSettings.autoApprove}
                  onChange={(e) => setReferralSettings({...referralSettings, autoApprove: e.target.checked})}
                  className="rounded border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)] text-[var(--sublimes-gold)]"
                />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                    Auto-Approve After (Days)
                  </label>
                  <input
                    type="number"
                    value={referralSettings.autoApproveAfterDays}
                    onChange={(e) => setReferralSettings({...referralSettings, autoApproveAfterDays: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
                  />
                  <p className="text-xs text-gray-400 mt-1">Automatically approve referrals after this many days</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                    Referral Validity (Days)
                  </label>
                  <input
                    type="number"
                    value={referralSettings.referralValidityDays}
                    onChange={(e) => setReferralSettings({...referralSettings, referralValidityDays: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
                  />
                  <p className="text-xs text-gray-400 mt-1">How long referral links remain valid</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Settings */}
          <div>
            <h4 className="text-lg font-semibold text-[var(--sublimes-light-text)] mb-4">Feature Settings</h4>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-[var(--sublimes-dark-bg)] rounded-lg border border-[var(--sublimes-border)]">
                <div>
                  <span className="text-[var(--sublimes-light-text)]">Enable Referral Codes</span>
                  <p className="text-sm text-gray-400">Allow users to generate custom referral codes</p>
                </div>
                <input
                  type="checkbox"
                  checked={referralSettings.enableReferralCodes}
                  onChange={(e) => setReferralSettings({...referralSettings, enableReferralCodes: e.target.checked})}
                  className="rounded border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)] text-[var(--sublimes-gold)]"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-[var(--sublimes-dark-bg)] rounded-lg border border-[var(--sublimes-border)]">
                <div>
                  <span className="text-[var(--sublimes-light-text)]">Enable Referral Notifications</span>
                  <p className="text-sm text-gray-400">Send notifications for referral milestones and updates</p>
                </div>
                <input
                  type="checkbox"
                  checked={referralSettings.enableReferralNotifications}
                  onChange={(e) => setReferralSettings({...referralSettings, enableReferralNotifications: e.target.checked})}
                  className="rounded border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)] text-[var(--sublimes-gold)]"
                />
              </label>

              <div>
                <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                  Max Referrals Per User
                </label>
                <input
                  type="number"
                  value={referralSettings.maxReferralsPerUser}
                  onChange={(e) => setReferralSettings({...referralSettings, maxReferralsPerUser: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
                />
                <p className="text-xs text-gray-400 mt-1">Maximum number of referrals allowed per user (0 = unlimited)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Edit Referral Modal
  const EditReferralModal = () => {
    const [status, setStatus] = useState(editingReferral?.status || 'pending');
    const [notes, setNotes] = useState(editingReferral?.notes || '');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingReferral) {
        setReferrals(prev => prev.map(referral => 
          referral.id === editingReferral.id 
            ? { ...referral, status: status as any, notes }
            : referral
        ));
        setShowEditModal(false);
        setEditingReferral(null);
        toast.success('✅ Referral updated successfully!');
      }
    };

    return (
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-light-text)]">Edit Referral</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update referral status and add notes for {editingReferral?.referrerName}'s referral.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">Admin Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
                placeholder="Add any notes about this referral..."
              />
            </div>
            <DialogFooter className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] rounded-lg hover:bg-[var(--sublimes-gold)]/90"
              >
                Update Referral
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--sublimes-light-text)]">Referral Management</h1>
          <p className="text-gray-400">Approve, reject, and monitor user referrals and rewards.</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-[var(--sublimes-border)]">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview & Log', icon: Share },
            { id: 'top-referrers', label: 'Top Referrers', icon: Trophy },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-[var(--sublimes-gold)] text-[var(--sublimes-gold)]'
                  : 'border-transparent text-gray-400 hover:text-[var(--sublimes-light-text)] hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'top-referrers' && renderTopReferrersTab()}
      {activeTab === 'analytics' && renderAnalyticsTab()}
      {activeTab === 'settings' && renderSettingsTab()}

      {/* Modals */}
      <EditReferralModal />
    </div>
  );
}