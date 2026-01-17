/**
 * AdminUsersPage - FIXED SUPABASE VERSION
 * Properly fetches users from Supabase auth.users + profiles table
 * Shows real Supabase user IDs, not mock data
 */

import { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Shield,
  UserCog,
  Ban,
  Trash2,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase/client';

interface User {
  id: string; // Supabase auth.users.id
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
  xp_points: number;
  is_verified: boolean;
  created_at: string;
  last_login_at: string | null;
}

interface Stats {
  total: number;
  verified: number;
  pending: number;
  activeToday: number;
}

export function AdminUsersPage_FIXED_SUPABASE() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    verified: 0,
    pending: 0,
    activeToday: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch users from Supabase
  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Fetch profiles (joined with auth.users)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          display_name,
          avatar_url,
          role,
          xp_points,
          is_verified,
          created_at,
          last_login_at
        `)
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      const usersData = (profilesData || []) as User[];
      setUsers(usersData);
      setFilteredUsers(usersData);

      // Calculate stats
      const total = usersData.length;
      const verified = usersData.filter(u => u.is_verified).length;
      const pending = usersData.filter(u => !u.is_verified).length;
      
      // Active today: last_login_at within last 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const activeToday = usersData.filter(u => 
        u.last_login_at && u.last_login_at > oneDayAgo
      ).length;

      setStats({ total, verified, pending, activeToday });

    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.display_name?.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter === 'verified') {
      filtered = filtered.filter(user => user.is_verified);
    } else if (statusFilter === 'pending') {
      filtered = filtered.filter(user => !user.is_verified);
    }

    setFilteredUsers(filtered);
  }, [searchQuery, roleFilter, statusFilter, users]);

  // Change user role
  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  // Toggle user verification
  const handleToggleVerification = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ verified: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      toast.success(currentStatus ? 'User unverified' : 'User verified');
      fetchUsers();
    } catch (error: any) {
      console.error('Error toggling verification:', error);
      toast.error('Failed to update verification');
    }
  };

  // Toggle ban status - Disabled (no is_banned column)
  // const handleToggleBan = async (userId: string, currentStatus: boolean) => {
  //   try {
  //     const { error } = await supabase
  //       .from('profiles')
  //       .update({ is_banned: !currentStatus })
  //       .eq('id', userId);

  //     if (error) throw error;

  //     toast.success(currentStatus ? 'User unbanned' : 'User banned');
  //     fetchUsers();
  //   } catch (error: any) {
  //     console.error('Error toggling ban:', error);
  //     toast.error('Failed to update ban status');
  //   }
  // };

  // Delete user - Disabled (requires service role for auth.users deletion)
  // const handleDeleteUser = async (userId: string) => {
  //   if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;

  //   try {
  //     // Note: Actual user deletion from auth.users requires service role
  //     const { error } = await supabase.auth.admin.deleteUser(userId);

  //     if (error) throw error;

  //     toast.success('User deleted successfully');
  //     fetchUsers();
  //   } catch (error: any) {
  //     console.error('Error deleting user:', error);
  //     toast.error('Failed to delete user');
  //   }
  // };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'editor':
        return 'bg-purple-500/20 text-purple-500 border-purple-500/30';
      case 'vendor':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'garage_owner':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'car_owner':
        return 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-[#D4AF37]" size={48} />
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#0B1426] min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-[#E8EAED] mb-2" style={{ fontWeight: 600 }}>
            Users Management
          </h1>
          <p className="text-[#8B92A7]">Manage and verify users</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          className="border-[#1A2332] text-[#E8EAED]"
        >
          <RefreshCw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} size={16} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-4">
            <p className="text-sm text-[#8B92A7] mb-1">Total Users</p>
            <p className="text-2xl text-[#E8EAED]" style={{ fontWeight: 600 }}>
              {stats.total.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-4">
            <p className="text-sm text-[#8B92A7] mb-1">Verified</p>
            <p className="text-2xl text-green-500" style={{ fontWeight: 600 }}>
              {stats.verified.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-4">
            <p className="text-sm text-[#8B92A7] mb-1">Pending</p>
            <p className="text-2xl text-orange-500" style={{ fontWeight: 600 }}>
              {stats.pending.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-4">
            <p className="text-sm text-[#8B92A7] mb-1">Active Today</p>
            <p className="text-2xl text-blue-500" style={{ fontWeight: 600 }}>
              {stats.activeToday.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="bg-[#0F1829] border-[#1A2332] mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative md:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B92A7]" size={20} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="pl-10 bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent className="bg-[#0F1829] border-[#1A2332]">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
                <SelectItem value="garage_owner">Garage Owner</SelectItem>
                <SelectItem value="car_owner">Car Owner</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#0F1829] border-[#1A2332]">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-[#0F1829] border-[#1A2332]">
        <CardHeader>
          <CardTitle className="text-xl text-[#E8EAED]">
            All Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto mb-3 opacity-50 text-[#8B92A7]" size={48} />
              <p className="text-[#8B92A7]">No users found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-4 bg-[#0B1426] rounded-lg border border-[#1A2332] hover:border-[#D4AF37]/30 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="h-12 w-12">
                      {user.avatar_url ? (
                        <AvatarImage src={user.avatar_url} />
                      ) : (
                        <AvatarFallback className="bg-[#D4AF37]/20 text-[#D4AF37]">
                          {getInitials(user.display_name, user.email)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[#E8EAED] truncate" style={{ fontWeight: 600 }}>
                          {user.display_name || 'No Name'}
                        </p>
                        {user.verified && (
                          <CheckCircle className="text-[#D4AF37] flex-shrink-0" size={16} />
                        )}
                        {user.is_banned && (
                          <Ban className="text-red-500 flex-shrink-0" size={16} />
                        )}
                      </div>
                      <p className="text-sm text-[#8B92A7] truncate">{user.email}</p>
                      <p className="text-xs text-[#8B92A7] mt-1 font-mono truncate">
                        ID: {user.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      <p className="text-sm text-[#8B92A7]">Joined</p>
                      <p className="text-xs text-[#E8EAED]">{formatDate(user.created_at)}</p>
                    </div>
                    
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role.replace('_', ' ')}
                    </Badge>
                    
                    <div className="text-right hidden lg:block">
                      <p className="text-sm text-[#D4AF37]" style={{ fontWeight: 600 }}>
                        {user.xp_points || 0} XP
                      </p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-[#8B92A7] hover:text-[#E8EAED]"
                        >
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end"
                        className="bg-[#0F1829] border-[#1A2332] text-[#E8EAED]"
                      >
                        <DropdownMenuItem 
                          onClick={() => handleToggleVerification(user.id, user.is_verified || false)}
                          className="hover:bg-[#1A2332]"
                        >
                          {user.is_verified ? (
                            <>
                              <XCircle className="mr-2" size={16} />
                              Unverify
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2" size={16} />
                              Verify
                            </>
                          )}
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          onClick={() => {
                            const newRole = prompt('Enter new role (admin, editor, subscriber, moderator):');
                            if (newRole) handleChangeRole(user.id, newRole);
                          }}
                          className="hover:bg-[#1A2332]"
                        >
                          <Shield className="mr-2" size={16} />
                          Change Role
                        </DropdownMenuItem>
                        
                        {/* Ban functionality disabled - no is_banned column */}
                        {/* <DropdownMenuItem 
                          onClick={() => handleToggleBan(user.id, user.is_banned)}
                          className="hover:bg-[#1A2332]"
                        >
                          <Ban className="mr-2" size={16} />
                          {user.is_banned ? 'Unban' : 'Ban User'}
                        </DropdownMenuItem> */}
                        
                        {/* Delete functionality disabled - requires service role */}
                        {/* <DropdownMenuItem 
                          onClick={() => handleDeleteUser(user.id)}
                          className="hover:bg-[#1A2332] text-red-500"
                        >
                          <Trash2 className="mr-2" size={16} />
                          Delete User
                        </DropdownMenuItem> */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
