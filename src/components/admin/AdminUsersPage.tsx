import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
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
  Upload, 
  UserPlus,
  MoreVertical,
  Eye,
  Edit,
  Ban,
  Trash2,
  Users,
  Activity,
  CheckCircle,
  Clock,
  XCircle,
  Key,
  Loader2
} from 'lucide-react';


interface User {
  id: string;
  email: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  banned_until: string | null;
}

export function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    banned: 0
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Use admin RPC function that bypasses RLS
      const { data: profiles, error: profilesError } = await supabase
        .rpc('admin_get_all_users');

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
        toast.error('Failed to load users: ' + profilesError.message);
        return;
      }

      // Calculate stats
      const total = profiles?.length || 0;
      const verified = profiles?.filter(p => p.email_confirmed_at).length || 0;
      const pending = total - verified;
      const banned = profiles?.filter(p => p.banned_until && new Date(p.banned_until) > new Date()).length || 0;

      setUsers(profiles || []);
      setStats({ total, verified, pending, banned });
      
      console.log(`✅ Loaded ${total} users from database`);
    } catch (error: any) {
      console.error('Error in loadUsers:', error);
      toast.error('Failed to load users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === '' || 
      (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.username?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRole === 'All' || user.role === selectedRole.toLowerCase();
    
    const matchesStatus = selectedStatus === 'All' ||
      (selectedStatus === 'Verified' && user.email_confirmed_at) ||
      (selectedStatus === 'Pending' && !user.email_confirmed_at) ||
      (selectedStatus === 'Banned' && user.banned_until && new Date(user.banned_until) > new Date());

    return matchesSearch && matchesRole && matchesStatus;
  });

  const formatLastActive = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 5) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-500/10 text-purple-500';
      case 'editor': return 'bg-blue-500/10 text-blue-500';
      case 'garage_owner': return 'bg-orange-500/10 text-orange-500';
      case 'car_owner': return 'bg-green-500/10 text-green-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const handleExport = async () => {
    try {
      const csv = [
        ['ID', 'Email', 'Name', 'Username', 'Role', 'Created At', 'Verified', 'Last Sign In'],
        ...filteredUsers.map(user => [
          user.id,
          user.email,
          user.full_name || '',
          user.username || '',
          user.role,
          new Date(user.created_at).toLocaleDateString(),
          user.email_confirmed_at ? 'Yes' : 'No',
          formatLastActive(user.last_sign_in_at)
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Users exported successfully');
    } catch (error: any) {
      toast.error('Export failed: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--sublimes-gold)] mx-auto mb-2" />
          <p className="text-gray-400">Loading users from database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--sublimes-light-text)]">Users Management</h1>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] rounded-lg font-medium hover:bg-[var(--sublimes-gold)]/90 transition-colors flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Export Users
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-[var(--sublimes-light-text)]">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Verified</p>
              <p className="text-3xl font-bold text-green-500">{stats.verified}</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Pending</p>
              <p className="text-3xl font-bold text-yellow-500">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Banned</p>
              <p className="text-3xl font-bold text-red-500">{stats.banned}</p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg">
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
              />
            </div>
          </div>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
          >
            <option value="All">All Roles</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="car_owner">Car Owner</option>
            <option value="garage_owner">Garage Owner</option>
            <option value="browser">Browser</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
          >
            <option value="All">All Status</option>
            <option value="Verified">Verified</option>
            <option value="Pending">Pending</option>
            <option value="Banned">Banned</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[var(--sublimes-border)]">
          <h3 className="text-lg font-semibold text-[var(--sublimes-light-text)]">
            Users ({filteredUsers.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--sublimes-dark-bg)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--sublimes-border)]">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[var(--sublimes-dark-bg)] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--sublimes-gold)]/20 flex items-center justify-center text-[var(--sublimes-gold)] font-semibold">
                        {(user.full_name || user.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-[var(--sublimes-light-text)]">
                          {user.full_name || 'No name'}
                        </div>
                        {user.username && (
                          <div className="text-sm text-gray-400">@{user.username}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.email_confirmed_at ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {formatLastActive(user.last_sign_in_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-400">No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
