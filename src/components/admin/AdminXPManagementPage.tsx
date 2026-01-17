/**
 * Admin XP Management Page
 * Re-exports the complete database-connected implementation
 */

// Re-export the complete implementation
export { AdminXPManagement_Complete as AdminXPManagementPage } from './AdminXPManagement_Complete';
export { AdminXPManagement_Complete as default } from './AdminXPManagement_Complete';

// ============================================================================
// LEGACY IMPLEMENTATION BELOW - KEPT FOR REFERENCE ONLY
// The active implementation is in AdminXPManagement_Complete.tsx
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
  Star,
  Trophy,
  Users,
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
  RefreshCw
} from 'lucide-react';

interface XPUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  xpPoints: number;
  lastXPEarned: Date;
  milestone: number;
  progress: number;
  isActive: boolean;
  avatar: string;
  position?: number;
  location?: string;
}

interface MilestoneReward {
  id: string;
  xpThreshold: number;
  rewardTitle: string;
  rewardDescription: string;
  isActive: boolean;
  claimsCount: number;
}

interface XPSettings {
  xpPerPost: number;
  maxDailyXP: number;
  requireImageForXP: boolean;
  milestoneValidityMonths: number;
  enableStreakTracking: boolean;
  enableLeaderboards: boolean;
  enableXPNotifications: boolean;
  dailyReminderTime: number;
}

interface GiftReward {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  xpEarned: number;
  rewardType: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  claimedAt: Date;
  trackingNumber?: string;
}

// Legacy function - not exported, kept for reference
function AdminXPManagementPage_Legacy() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<XPUser | null>(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [editingReward, setEditingReward] = useState<MilestoneReward | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Mock XP data (LEGACY - DO NOT USE)
  const [xpUsers, setXpUsers] = useState<XPUser[]>([
    {
      id: '1',
      fullName: '3rddesire',
      username: '@3rddesire',
      email: '3rddesire@gmail.com',
      xpPoints: 1,
      lastXPEarned: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000),
      milestone: 100,
      progress: 1,
      isActive: true,
      avatar: '/avatars/1.jpg',
      position: 1,
      location: 'Jetour • Dubai'
    },
    {
      id: '2',
      fullName: 'asif iqbal',
      username: '@asifiqbal',
      email: 'tech.asifs22@gmail.com',
      xpPoints: 1,
      lastXPEarned: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000),
      milestone: 100,
      progress: 1,
      isActive: true,
      avatar: '/avatars/2.jpg',
      position: 2
    },
    {
      id: '3',
      fullName: 'Mueed Ahmad',
      username: '@mueedahmad',
      email: 'ch.mueedahmad@gmail.com',
      xpPoints: 0,
      lastXPEarned: new Date(0),
      milestone: 100,
      progress: 0,
      isActive: false,
      avatar: '/avatars/3.jpg'
    }
  ]);

  const [milestoneRewards, setMilestoneRewards] = useState<MilestoneReward[]>([
    {
      id: '1',
      xpThreshold: 100,
      rewardTitle: 'Free car accessory',
      rewardDescription: 'Premium car accessory of choice',
      isActive: true,
      claimsCount: 12
    },
    {
      id: '2',
      xpThreshold: 200,
      rewardTitle: 'Premium profile badge',
      rewardDescription: 'Exclusive verified badge for profile',
      isActive: true,
      claimsCount: 5
    },
    {
      id: '3',
      xpThreshold: 365,
      rewardTitle: 'Annual recognition award',
      rewardDescription: 'Special trophy and certificate',
      isActive: true,
      claimsCount: 2
    }
  ]);

  const [xpSettings, setXpSettings] = useState<XPSettings>({
    xpPerPost: 1,
    maxDailyXP: 1,
    requireImageForXP: true,
    milestoneValidityMonths: 6,
    enableStreakTracking: true,
    enableLeaderboards: true,
    enableXPNotifications: true,
    dailyReminderTime: 20
  });

  const [giftRewards, setGiftRewards] = useState<GiftReward[]>([
    {
      id: '1',
      userId: '1',
      userName: '3rddesire',
      userEmail: '3rddesire@gmail.com',
      xpEarned: 100,
      rewardType: 'Free car accessory',
      status: 'pending',
      claimedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      userId: '2',
      userName: 'asif iqbal',
      userEmail: 'tech.asifs22@gmail.com',
      xpEarned: 100,
      rewardType: 'Free car accessory',
      status: 'shipped',
      claimedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      trackingNumber: 'TRK123456789'
    }
  ]);

  // Calculate statistics
  const activeXPUsers = xpUsers.filter(user => user.isActive).length;
  const totalXPEarned = xpUsers.reduce((sum, user) => sum + user.xpPoints, 0);
  const users100Plus = xpUsers.filter(user => user.xpPoints >= 100).length;
  const averageXP = xpUsers.length > 0 ? Math.round(totalXPEarned / xpUsers.length) : 0;

  const filteredUsers = xpUsers.filter(user =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const leaderboardUsers = [...xpUsers]
    .sort((a, b) => b.xpPoints - a.xpPoints)
    .slice(0, 10);

  const handleSelectAll = () => {
    if (selectedItems.length === filteredUsers.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredUsers.map(user => user.id));
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
    const usersToExport = selectedIds.length > 0 
      ? filteredUsers.filter(user => selectedIds.includes(user.id))
      : filteredUsers;
    
    // Create CSV content
    const headers = ['ID', 'Full Name', 'Username', 'Email', 'XP Points', 'Last XP Earned', 'Milestone', 'Progress %', 'Status'];
    const csvContent = [
      headers.join(','),
      ...usersToExport.map(user => [
        user.id,
        `"${user.fullName}"`,
        user.username,
        user.email,
        user.xpPoints,
        user.lastXPEarned.toISOString().split('T')[0],
        user.milestone,
        user.progress,
        user.isActive ? 'Active' : 'Inactive'
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `xp_users_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toast.success(`✅ Exported ${usersToExport.length} XP users to CSV!`);
  };

  const handleAdjustXP = (userId: string, newXP: number) => {
    setXpUsers(prev => prev.map(user => 
      user.id === userId 
        ? { 
            ...user, 
            xpPoints: newXP,
            progress: Math.round((newXP / user.milestone) * 100),
            lastXPEarned: new Date()
          }
        : user
    ));
    toast.success('✅ XP points updated successfully!');
  };

  const handleSaveSettings = (newSettings: XPSettings) => {
    setXpSettings(newSettings);
    toast.success('✅ XP settings saved successfully!');
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-400">Active XP Users</p>
              <p className="text-2xl font-bold text-blue-400">{activeXPUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-400">Total XP Earned</p>
              <p className="text-2xl font-bold text-green-400">{totalXPEarned}</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Trophy className="w-6 h-6 text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-400">100+ XP Users</p>
              <p className="text-2xl font-bold text-purple-400">{users100Plus}</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)] p-6">
          <div className="flex items-center">
            <div className="p-2 bg-[var(--sublimes-gold)]/20 rounded-lg">
              <Star className="w-6 h-6 text-[var(--sublimes-gold)]" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-400">Average XP</p>
              <p className="text-2xl font-bold text-[var(--sublimes-gold)]">{averageXP}</p>
            </div>
          </div>
        </div>
      </div>

      {/* User XP Management Table */}
      <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)]">
        <div className="p-6 border-b border-[var(--sublimes-border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Star className="w-5 h-5 text-[var(--sublimes-gold)]" />
              <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">User XP Management</h3>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users by name, email, or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
              />
            </div>
            
            <DateRangeFilter onExport={handleExportData} selectedItems={selectedItems} />
          </div>

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="mb-4 p-4 bg-[var(--sublimes-gold)]/10 border border-[var(--sublimes-gold)]/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--sublimes-light-text)]">
                  {selectedItems.length} user(s) selected
                </span>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                    Bulk Adjust XP
                  </button>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                    Send Notification
                  </button>
                  <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                    Reset XP
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
                      checked={selectedItems.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)] text-[var(--sublimes-gold)]"
                    />
                  </th>
                  <th className="text-left p-4 text-[var(--sublimes-light-text)]">User</th>
                  <th className="text-left p-4 text-[var(--sublimes-light-text)]">XP Points</th>
                  <th className="text-left p-4 text-[var(--sublimes-light-text)]">Last XP Earned</th>
                  <th className="text-left p-4 text-[var(--sublimes-light-text)]">Progress</th>
                  <th className="text-left p-4 text-[var(--sublimes-light-text)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-[var(--sublimes-border)] hover:bg-[var(--sublimes-dark-bg)]/30">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(user.id)}
                        onChange={() => handleSelectItem(user.id)}
                        className="rounded border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)] text-[var(--sublimes-gold)]"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[var(--sublimes-gold)] to-yellow-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-[var(--sublimes-dark-bg)]">
                            {user.fullName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-[var(--sublimes-light-text)]">{user.fullName}</p>
                          <p className="text-sm text-gray-400">{user.username}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          {user.location && (
                            <p className="text-xs text-gray-500">{user.location}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-[var(--sublimes-gold)]" />
                        <span className="font-bold text-[var(--sublimes-gold)]">{user.xpPoints}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-400">
                        {user.lastXPEarned.getTime() === 0 ? 'Never' : 
                         `${Math.floor((Date.now() - user.lastXPEarned.getTime()) / (1000 * 60 * 60 * 24))} days ago`}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="w-32">
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                          <span>{user.progress}/100</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-[var(--sublimes-gold)] h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${Math.min(user.progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setShowEditModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-[var(--sublimes-gold)] hover:bg-[var(--sublimes-gold)]/10 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRewardsTab = () => (
    <div className="space-y-6">
      {/* Milestone Rewards Management */}
      <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)]">
        <div className="p-6 border-b border-[var(--sublimes-border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Trophy className="w-5 h-5 text-[var(--sublimes-gold)]" />
              <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Milestone Rewards</h3>
            </div>
            <button className="px-4 py-2 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] rounded-lg hover:bg-[var(--sublimes-gold)]/90">
              Add Reward
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {milestoneRewards.map((reward) => (
              <div key={reward.id} className="flex items-center justify-between p-4 bg-[var(--sublimes-dark-bg)] rounded-lg border border-[var(--sublimes-border)]">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[var(--sublimes-gold)]/20 rounded-lg flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-[var(--sublimes-gold)]" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-[var(--sublimes-gold)]">{reward.xpThreshold} XP</span>
                      <span className="text-[var(--sublimes-light-text)]">→</span>
                      <span className="font-medium text-[var(--sublimes-light-text)]">{reward.rewardTitle}</span>
                    </div>
                    <p className="text-sm text-gray-400">{reward.rewardDescription}</p>
                    <p className="text-xs text-gray-500">{reward.claimsCount} claims</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    reward.isActive 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {reward.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => {
                      setEditingReward(reward);
                      setShowRewardModal(true);
                    }}
                    className="p-2 text-gray-400 hover:text-[var(--sublimes-gold)] hover:bg-[var(--sublimes-gold)]/10 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gift Reward Fulfillment */}
      <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)]">
        <div className="p-6 border-b border-[var(--sublimes-border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Gift className="w-5 h-5 text-[var(--sublimes-gold)]" />
              <div>
                <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Gift Reward Fulfillment</h3>
                <p className="text-sm text-gray-400">Track and manage gift fulfillment for users who reach the 100 XP milestone within a 6-month period.</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Export List
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
              />
            </div>
          </div>

          {/* Fulfillment Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--sublimes-border)]">
                  <th className="text-left p-4 text-[var(--sublimes-light-text)]">User</th>
                  <th className="text-left p-4 text-[var(--sublimes-light-text)]">XP</th>
                  <th className="text-left p-4 text-[var(--sublimes-light-text)]">Contact</th>
                  <th className="text-left p-4 text-[var(--sublimes-light-text)]">Reward Status</th>
                  <th className="text-left p-4 text-[var(--sublimes-light-text)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {giftRewards.map((gift) => (
                  <tr key={gift.id} className="border-b border-[var(--sublimes-border)] hover:bg-[var(--sublimes-dark-bg)]/30">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-[var(--sublimes-light-text)]">{gift.userName}</p>
                        <p className="text-sm text-gray-400">{gift.userEmail}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-[var(--sublimes-gold)]" />
                        <span className="font-bold text-[var(--sublimes-gold)]">{gift.xpEarned}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-400">{gift.userEmail}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          gift.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          gift.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                          gift.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {gift.status.charAt(0).toUpperCase() + gift.status.slice(1)}
                        </span>
                        {gift.trackingNumber && (
                          <span className="text-xs text-gray-500">#{gift.trackingNumber}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-[var(--sublimes-gold)] hover:bg-[var(--sublimes-gold)]/10 rounded-lg">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLeaderboardTab = () => (
    <div className="space-y-6">
      <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)]">
        <div className="p-6 border-b border-[var(--sublimes-border)]">
          <div className="flex items-center space-x-3">
            <Trophy className="w-5 h-5 text-[var(--sublimes-gold)]" />
            <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">XP Leaderboard</h3>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {leaderboardUsers.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-[var(--sublimes-dark-bg)] rounded-lg border border-[var(--sublimes-border)]">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-gray-400 text-black' :
                    index === 2 ? 'bg-orange-600 text-white' :
                    'bg-[var(--sublimes-border)] text-gray-400'
                  }`}>
                    #{index + 1}
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-[var(--sublimes-gold)] to-yellow-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-[var(--sublimes-dark-bg)]">
                      {user.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-[var(--sublimes-light-text)]">{user.fullName}</p>
                    <p className="text-sm text-gray-400">{user.username}</p>
                    {user.location && (
                      <p className="text-xs text-gray-500">{user.location}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-[var(--sublimes-gold)]" />
                  <span className="font-bold text-[var(--sublimes-gold)]">{user.xpPoints} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-[var(--sublimes-card-bg)] rounded-lg border border-[var(--sublimes-border)]">
        <div className="p-6 border-b border-[var(--sublimes-border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5 text-[var(--sublimes-gold)]" />
              <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">XP Rules & Configuration</h3>
            </div>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="px-4 py-2 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] rounded-lg hover:bg-[var(--sublimes-gold)]/90"
            >
              Save Settings
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Basic Rules */}
          <div>
            <h4 className="text-lg font-semibold text-[var(--sublimes-light-text)] mb-4">Basic Rules</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">XP Per Post</label>
                <input
                  type="number"
                  value={xpSettings.xpPerPost}
                  onChange={(e) => setXpSettings({...xpSettings, xpPerPost: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">Max Daily XP</label>
                <input
                  type="number"
                  value={xpSettings.maxDailyXP}
                  onChange={(e) => setXpSettings({...xpSettings, maxDailyXP: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={xpSettings.requireImageForXP}
                  onChange={(e) => setXpSettings({...xpSettings, requireImageForXP: e.target.checked})}
                  className="rounded border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)] text-[var(--sublimes-gold)]"
                />
                <div>
                  <span className="text-[var(--sublimes-light-text)]">Require Image for XP</span>
                  <p className="text-sm text-gray-400">Posts must include an image to earn XP</p>
                </div>
              </label>
            </div>
          </div>

          {/* Milestone Rewards Configuration */}
          <div>
            <h4 className="text-lg font-semibold text-[var(--sublimes-light-text)] mb-4">Milestone Rewards</h4>
            <div className="space-y-4">
              {milestoneRewards.map((reward) => (
                <div key={reward.id} className="p-4 bg-[var(--sublimes-dark-bg)] rounded-lg border border-[var(--sublimes-border)]">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-1">
                        {reward.xpThreshold} XP Reward
                      </label>
                      <input
                        type="text"
                        value={reward.rewardTitle}
                        className="w-full px-3 py-2 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                  Milestone Validity (Months)
                </label>
                <input
                  type="number"
                  value={xpSettings.milestoneValidityMonths}
                  onChange={(e) => setXpSettings({...xpSettings, milestoneValidityMonths: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
                />
                <p className="text-sm text-gray-400 mt-1">How long users have to claim rewards</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-lg font-semibold text-[var(--sublimes-light-text)] mb-4">Features</h4>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-[var(--sublimes-dark-bg)] rounded-lg border border-[var(--sublimes-border)]">
                <div>
                  <span className="text-[var(--sublimes-light-text)]">Enable Streak Tracking</span>
                  <p className="text-sm text-gray-400">Track consecutive daily posting</p>
                </div>
                <input
                  type="checkbox"
                  checked={xpSettings.enableStreakTracking}
                  onChange={(e) => setXpSettings({...xpSettings, enableStreakTracking: e.target.checked})}
                  className="rounded border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)] text-[var(--sublimes-gold)]"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-[var(--sublimes-dark-bg)] rounded-lg border border-[var(--sublimes-border)]">
                <div>
                  <span className="text-[var(--sublimes-light-text)]">Enable Leaderboards</span>
                  <p className="text-sm text-gray-400">Show public XP rankings</p>
                </div>
                <input
                  type="checkbox"
                  checked={xpSettings.enableLeaderboards}
                  onChange={(e) => setXpSettings({...xpSettings, enableLeaderboards: e.target.checked})}
                  className="rounded border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)] text-[var(--sublimes-gold)]"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-[var(--sublimes-dark-bg)] rounded-lg border border-[var(--sublimes-border)]">
                <div>
                  <span className="text-[var(--sublimes-light-text)]">Enable XP Notifications</span>
                  <p className="text-sm text-gray-400">Send milestone and reminder notifications</p>
                </div>
                <input
                  type="checkbox"
                  checked={xpSettings.enableXPNotifications}
                  onChange={(e) => setXpSettings({...xpSettings, enableXPNotifications: e.target.checked})}
                  className="rounded border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)] text-[var(--sublimes-gold)]"
                />
              </label>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h4 className="text-lg font-semibold text-[var(--sublimes-light-text)] mb-4">Notifications</h4>
            <div>
              <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                Daily Reminder Time (Hours)
              </label>
              <input
                type="number"
                min="0"
                max="23"
                value={xpSettings.dailyReminderTime}
                onChange={(e) => setXpSettings({...xpSettings, dailyReminderTime: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
              />
              <p className="text-sm text-gray-400 mt-1">24-hour format (e.g., 20 = 8 PM)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Edit User XP Modal
  const EditUserXPModal = () => {
    const [newXP, setNewXP] = useState(editingUser?.xpPoints || 0);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingUser) {
        handleAdjustXP(editingUser.id, newXP);
        setShowEditModal(false);
        setEditingUser(null);
      }
    };

    return (
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-light-text)]">Adjust XP Points</DialogTitle>
            <DialogDescription className="text-gray-400">
              Modify XP points for {editingUser?.fullName}. This will update their progress and milestone status.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">XP Points</label>
              <input
                type="number"
                min="0"
                value={newXP}
                onChange={(e) => setNewXP(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
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
                Update XP
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
          <h1 className="text-2xl font-bold text-[var(--sublimes-light-text)]">XP Management & Rewards</h1>
          <p className="text-gray-400">Manage user experience points, rewards, and gamification settings.</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-[var(--sublimes-border)]">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'XP Overview', icon: Star },
            { id: 'rewards', label: 'Rewards', icon: Trophy },
            { id: 'leaderboard', label: 'Leaderboard', icon: Award },
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
      {activeTab === 'rewards' && renderRewardsTab()}
      {activeTab === 'leaderboard' && renderLeaderboardTab()}
      {activeTab === 'settings' && renderSettingsTab()}

      {/* Modals */}
      <EditUserXPModal />
    </div>
  );
}