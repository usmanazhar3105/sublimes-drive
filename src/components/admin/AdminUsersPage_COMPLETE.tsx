import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Users, Search, Download, UserPlus, Shield, Ban, CheckCircle, XCircle } from 'lucide-react';
import { useExport } from '../../hooks/useExport';

export function AdminUsersPage_COMPLETE() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const { exportUsers } = useExport();

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }

      if (statusFilter === 'verified') {
        query = query.eq('verification_status', 'approved');
      } else if (statusFilter === 'pending') {
        query = query.eq('verification_status', 'pending');
      } else if (statusFilter === 'banned') {
        query = query.eq('is_banned', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      toast.success('User role updated');
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  const toggleBanUser = async (userId: string, currentBanStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: !currentBanStatus })
        .eq('id', userId);

      if (error) throw error;
      toast.success(currentBanStatus ? 'User unbanned' : 'User banned');
      fetchUsers();
    } catch (error: any) {
      console.error('Error toggling ban:', error);
      toast.error('Failed to update user status');
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: users.length,
    verified: users.filter(u => u.verification_status === 'approved').length,
    pending: users.filter(u => u.verification_status === 'pending').length,
    banned: users.filter(u => u.is_banned).length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#E8EAED]">Users Management</h1>
        <Button onClick={() => exportUsers()} className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90">
          <Download className="w-4 h-4 mr-2" />
          Export Users
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8B92A7]">Total Users</p>
                <p className="text-2xl font-bold text-[#E8EAED]">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8B92A7]">Verified</p>
                <p className="text-2xl font-bold text-[#E8EAED]">{stats.verified}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8B92A7]">Pending</p>
                <p className="text-2xl font-bold text-[#E8EAED]">{stats.pending}</p>
              </div>
              <Shield className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8B92A7]">Banned</p>
                <p className="text-2xl font-bold text-[#E8EAED]">{stats.banned}</p>
              </div>
              <Ban className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-[#0F1829] border-[#1A2332]">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8B92A7]" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#1A2332] border-[#2A3342] text-[#E8EAED]"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48 bg-[#1A2332] border-[#2A3342] text-[#E8EAED]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="subscriber">Subscriber</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-[#1A2332] border-[#2A3342] text-[#E8EAED]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-[#8B92A7]">Loading...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-[#8B92A7]">No users found</div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-[#1A2332] rounded-lg hover:bg-[#2A3342] transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                      <span className="text-[#D4AF37] font-medium">
                        {user.full_name?.[0] || user.email?.[0] || 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#E8EAED]">{user.full_name || 'No name'}</p>
                      <p className="text-sm text-[#8B92A7]">{user.email}</p>
                    </div>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                    {user.verification_status === 'approved' && (
                      <Badge className="bg-green-500/20 text-green-500">Verified</Badge>
                    )}
                    {user.is_banned && (
                      <Badge className="bg-red-500/20 text-red-500">Banned</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={user.role}
                      onValueChange={(newRole) => updateUserRole(user.id, newRole)}
                    >
                      <SelectTrigger className="w-32 bg-[#0F1829] border-[#2A3342]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="subscriber">Subscriber</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant={user.is_banned ? 'default' : 'destructive'}
                      size="sm"
                      onClick={() => toggleBanUser(user.id, user.is_banned)}
                    >
                      {user.is_banned ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                    </Button>
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
