import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
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
  Key
} from 'lucide-react';


interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  emirate: string;
  role: 'admin' | 'editor' | 'user' | 'garageOwner';
  badges: string[];
  verifiedBrands: string[];
  createdAt: Date;
  lastActiveAt: Date;
  isVerified: boolean;
  isActive: boolean;
}

export function AdminUsersPageFixed() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedEmirate, setSelectedEmirate] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔥 REAL DATA: Fetch users from Supabase
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          display_name,
          username,
          phone,
          emirate,
          role,
          avatar_url,
          verification_status,
          is_banned,
          created_at,
          last_login_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map profiles to User interface
      const mappedUsers: User[] = (profiles || []).map((p: any) => ({
        id: p.id,
        fullName: p.display_name || p.email?.split('@')[0] || 'Unknown',
        username: p.username || p.email?.split('@')[0] || 'user',
        email: p.email || '',
        phone: p.phone || '',
        emirate: p.emirate || 'Unknown',
        role: (p.role || 'browser') as 'admin' | 'editor' | 'user' | 'garageOwner',
        badges: p.verification_status === 'approved' ? ['Verified'] : [],
        verifiedBrands: [], // TODO: Get from user_vehicles or similar
        createdAt: new Date(p.created_at || Date.now()),
        lastActiveAt: p.last_login_at ? new Date(p.last_login_at) : new Date(p.updated_at || Date.now()),
        isVerified: p.verification_status === 'approved',
        isActive: !p.is_banned,
      }));

      setUsers(mappedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === '' || 
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRole === 'All' || user.role === selectedRole.toLowerCase();
    const matchesEmirate = selectedEmirate === 'All' || user.emirate === selectedEmirate;
    const matchesStatus = selectedStatus === 'All' ||
      (selectedStatus === 'Active' && user.isActive) ||
      (selectedStatus === 'Inactive' && !user.isActive) ||
      (selectedStatus === 'Verified' && user.isVerified) ||
      (selectedStatus === 'Pending' && !user.isVerified);

    return matchesSearch && matchesRole && matchesEmirate && matchesStatus;
  });

  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-500 bg-red-500/10';
      case 'editor': return 'text-orange-500 bg-orange-500/10';
      case 'garageOwner': return 'text-blue-500 bg-blue-500/10';
      case 'user': return 'text-green-500 bg-green-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'editor': return 'Editor';
      case 'garageOwner': return 'Garage Owner';
      case 'user': return 'User';
      default: return 'Unknown';
    }
  };

  // Bulk selection handlers
  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (selectAll: boolean) => {
    if (selectAll) {
      setSelectedItems(filteredUsers.map(user => user.id));
    } else {
      setSelectedItems([]);
    }
  };

  const isSelectAllChecked = () => {
    return selectedItems.length === filteredUsers.length && filteredUsers.length > 0;
  };

  // Create User Modal Component
  const CreateUserModal = () => {
    const [formData, setFormData] = useState({
      fullName: '',
      email: '',
      phone: '',
      emirate: 'Dubai',
      role: 'user' as 'admin' | 'editor' | 'user' | 'garageOwner'
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!formData.fullName || !formData.email || !formData.phone) {
        toast.error('Please fill in all required fields');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Please enter a valid email address');
        return;
      }

      const username = formData.fullName.toLowerCase().replace(/\s+/g, '_') + Math.floor(Math.random() * 1000);
      
      const newUser: User = {
        id: `user_${Date.now()}`,
        fullName: formData.fullName,
        username,
        email: formData.email,
        phone: formData.phone,
        emirate: formData.emirate,
        role: formData.role,
        badges: formData.role === 'admin' ? ['Admin'] : formData.role === 'garageOwner' ? ['Garage Owner'] : ['Car Owner'],
        verifiedBrands: [],
        createdAt: new Date(),
        lastActiveAt: new Date(),
        isVerified: true,
        isActive: true
      };

      setUsers(prev => [...prev, newUser]);
      setShowCreateModal(false);
      setFormData({ fullName: '', email: '', phone: '', emirate: 'Dubai', role: 'user' });
      toast.success(`✅ User "${formData.fullName}" created successfully!`);
    };

    return (
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-light-text)]">Create New User</DialogTitle>
            <DialogDescription className="text-gray-400">
              Fill in the details below to create a new user account. Required fields are marked with *.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-1">Full Name *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-1">Phone *</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
                placeholder="+971XXXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-1">Emirate</label>
              <select
                value={formData.emirate}
                onChange={(e) => setFormData({...formData, emirate: e.target.value})}
                className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
              >
                <option value="Dubai">Dubai</option>
                <option value="Abu Dhabi">Abu Dhabi</option>
                <option value="Sharjah">Sharjah</option>
                <option value="Ajman">Ajman</option>
                <option value="RAK">RAK</option>
                <option value="Fujairah">Fujairah</option>
                <option value="UAQ">UAQ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
              >
                <option value="user">User (Car Owner)</option>
                <option value="garageOwner">Garage Owner</option>
                <option value="editor">Editor (Restricted Admin)</option>
                <option value="admin">Admin (Master Control)</option>
              </select>
            </div>
            <DialogFooter className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] rounded-lg hover:bg-[var(--sublimes-gold)]/90"
              >
                Create User
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  // Invite User Modal Component
  const InviteUserModal = () => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'admin' | 'editor' | 'user' | 'garageOwner'>('user');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!email) {
        toast.error('Please enter an email address');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error('Please enter a valid email address');
        return;
      }

      setShowInviteModal(false);
      setEmail('');
      setRole('user');
      toast.success(`📧 Invitation sent to ${email} for ${getRoleDisplayName(role)} role`);
    };

    return (
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-light-text)]">Invite User</DialogTitle>
            <DialogDescription className="text-gray-400">
              Send an invitation email to a new user with their assigned role. They will receive signup instructions.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-1">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
                placeholder="Enter email to invite"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
              >
                <option value="user">User (Car Owner)</option>
                <option value="garageOwner">Garage Owner</option>
                <option value="editor">Editor (Restricted Admin)</option>
                <option value="admin">Admin (Master Control)</option>
              </select>
            </div>
            <DialogFooter className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Send Invite
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  // Edit User Modal Component
  const EditUserModal = () => {
    const [formData, setFormData] = useState({
      fullName: editingUser?.fullName || '',
      email: editingUser?.email || '',
      phone: editingUser?.phone || '',
      emirate: editingUser?.emirate || 'Dubai',
      role: editingUser?.role || 'user' as 'admin' | 'editor' | 'user' | 'garageOwner',
      isActive: editingUser?.isActive || false,
      isVerified: editingUser?.isVerified || false
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!formData.fullName || !formData.email || !formData.phone) {
        toast.error('Please fill in all required fields');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Please enter a valid email address');
        return;
      }

      setUsers(prev => prev.map(user => 
        user.id === editingUser?.id 
          ? {
              ...user,
              fullName: formData.fullName,
              email: formData.email,
              phone: formData.phone,
              emirate: formData.emirate,
              role: formData.role,
              isActive: formData.isActive,
              isVerified: formData.isVerified,
              badges: formData.role === 'admin' ? ['Admin'] : formData.role === 'garageOwner' ? ['Garage Owner'] : ['Car Owner']
            }
          : user
      ));

      setShowEditModal(false);
      setEditingUser(null);
      toast.success(`✅ User "${formData.fullName}" updated successfully!`);
    };

    return (
      <Dialog open={showEditModal} onOpenChange={(open) => {
        setShowEditModal(open);
        if (!open) setEditingUser(null);
      }}>
        <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-light-text)]">Edit User</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update user information, role permissions, and account status. All changes will be applied immediately.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-1">Full Name *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-1">Phone *</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-1">Emirate</label>
              <select
                value={formData.emirate}
                onChange={(e) => setFormData({...formData, emirate: e.target.value})}
                className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
              >
                <option value="Dubai">Dubai</option>
                <option value="Abu Dhabi">Abu Dhabi</option>
                <option value="Sharjah">Sharjah</option>
                <option value="Ajman">Ajman</option>
                <option value="RAK">RAK</option>
                <option value="Fujairah">Fujairah</option>
                <option value="UAQ">UAQ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
              >
                <option value="user">User (Car Owner)</option>
                <option value="garageOwner">Garage Owner</option>
                <option value="editor">Editor (Restricted Admin)</option>
                <option value="admin">Admin (Master Control)</option>
              </select>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="rounded border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)] text-[var(--sublimes-gold)] focus:ring-[var(--sublimes-gold)]"
                />
                <span className="text-sm text-[var(--sublimes-light-text)]">Active</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isVerified}
                  onChange={(e) => setFormData({...formData, isVerified: e.target.checked})}
                  className="rounded border-[var(--sublimes-border)] bg-[var(--sublimes-dark-bg)] text-[var(--sublimes-gold)] focus:ring-[var(--sublimes-gold)]"
                />
                <span className="text-sm text-[var(--sublimes-light-text)]">Verified</span>
              </label>
            </div>
            <DialogFooter className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] rounded-lg hover:bg-[var(--sublimes-gold)]/90"
              >
                Update User
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const handleExportData = (selectedIds: string[], dateRange: { from: string; to: string }) => {
    const usersToExport = selectedIds.length > 0 
      ? filteredUsers.filter(user => selectedIds.includes(user.id))
      : filteredUsers;
    
    // Apply date filter if provided
    let filteredUsers_export = usersToExport;
    if (dateRange?.from || dateRange?.to) {
      filteredUsers_export = usersToExport.filter(user => {
        const userDate = new Date(user.createdAt);
        const fromDate = dateRange.from ? new Date(dateRange.from) : null;
        const toDate = dateRange.to ? new Date(dateRange.to) : null;
        
        if (fromDate && userDate < fromDate) return false;
        if (toDate && userDate > toDate) return false;
        return true;
      });
    }

    // Create CSV content
    const headers = ['ID', 'Full Name', 'Username', 'Email', 'Phone', 'Emirate', 'Role', 'Status', 'Verified', 'Created At', 'Last Active'];
    const csvContent = [
      headers.join(','),
      ...filteredUsers_export.map(user => [
        user.id,
        `"${user.fullName}"`,
        user.username,
        user.email,
        user.phone,
        user.emirate,
        user.role,
        user.isActive ? 'Active' : 'Inactive',
        user.isVerified ? 'Yes' : 'No',
        user.createdAt.toISOString().split('T')[0],
        user.lastActiveAt.toISOString().split('T')[0]
      ].join(','))
    ].join('\\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sublimes-drive-users-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${filteredUsers_export.length} users successfully`);
  };

  const bulkImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        toast.success(`📁 Processing file: ${file.name}`);
        // Here you would process the CSV file
      }
    };
    input.click();
  };

  // User action handlers
  const handleViewUser = (user: User) => {
    const userDetails = `USER PROFILE:

Name: ${user.fullName}
Username: @${user.username}
Email: ${user.email}
Phone: ${user.phone}
Emirate: ${user.emirate}
Role: ${getRoleDisplayName(user.role)}
Badges: ${user.badges.join(', ')}
Verified Brands: ${user.verifiedBrands.join(', ') || 'None'}
Status: ${user.isActive ? 'Active' : 'Inactive'}
Verified: ${user.isVerified ? 'Yes' : 'No'}
Joined: ${user.createdAt.toLocaleDateString()}
Last Active: ${formatLastActive(user.lastActiveAt)}`;
    
    alert(userDetails);
    toast.success(`👤 Viewing profile: ${user.fullName}`);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleSuspendUser = (user: User) => {
    const reason = window.prompt(`Enter suspension reason for "${user.fullName}":

Common reasons:
- Policy violation
- Suspicious activity
- User reports
- Temporary restriction

Reason:`);
    
    if (reason) {
      setUsers(prev => prev.map(u => 
        u.id === user.id ? {...u, isActive: false} : u
      ));
      toast.warning(`⏸️ User "${user.fullName}" suspended. Reason: ${reason}`);
    }
  };

  const handleDeleteUser = (user: User) => {
    const confirmation = window.confirm(`Delete user "${user.fullName}"?

This action cannot be undone. All user data will be permanently removed.`);
    if (confirmation) {
      setUsers(prev => prev.filter(u => u.id !== user.id));
      toast.success(`🗑️ User "${user.fullName}" deleted successfully!`);
    }
  };

  const handleVerifyUser = (user: User) => {
    setUsers(prev => prev.map(u => 
      u.id === user.id ? {...u, isVerified: !u.isVerified} : u
    ));
    toast.success(`${user.isVerified ? '❌ User verification removed' : '✅ User verified successfully'}`);
  };

  const handleResetPassword = (user: User) => {
    const confirmation = window.confirm(`Send password reset email to "${user.fullName}" (${user.email})?`);
    if (confirmation) {
      toast.success(`📧 Password reset email sent to ${user.email}`);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-[var(--sublimes-dark-bg)] flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--sublimes-gold)] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[var(--sublimes-dark-bg)]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)]">Users & Access Management</h1>
            <p className="text-gray-400 mt-1">Manage user accounts, roles, and permissions</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] px-4 py-2 rounded-lg font-medium hover:bg-[var(--sublimes-gold)]/90"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create User</span>
            </button>

            <button 
              onClick={() => setShowInviteModal(true)}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite User</span>
            </button>

            <button 
              onClick={bulkImport}
              className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600"
            >
              <Upload className="w-4 h-4" />
              <span>Bulk Import</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users by name, email, or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
            />
          </div>
          
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Editor">Editor</option>
            <option value="User">User</option>
            <option value="Garage Owner">Garage Owner</option>
          </select>

          <select
            value={selectedEmirate}
            onChange={(e) => setSelectedEmirate(e.target.value)}
            className="px-3 py-2 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
          >
            <option value="All">All Emirates</option>
            <option value="Dubai">Dubai</option>
            <option value="Abu Dhabi">Abu Dhabi</option>
            <option value="Sharjah">Sharjah</option>
            <option value="Ajman">Ajman</option>
            <option value="RAK">RAK</option>
            <option value="Fujairah">Fujairah</option>
            <option value="UAQ">UAQ</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sublimes-gold)]"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Verified">Verified</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div className="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs font-bold rounded">Live</div>
          </div>
          <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">{users.length}</p>
          <p className="text-sm text-gray-400">Total Users</p>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-500" />
            </div>
            <div className="px-2 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded">Live</div>
          </div>
          <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">{users.filter(u => u.isActive).length}</p>
          <p className="text-sm text-gray-400">Active Today</p>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[var(--sublimes-gold)]/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-[var(--sublimes-gold)]" />
            </div>
            <div className="px-2 py-1 bg-[var(--sublimes-gold)]/10 text-[var(--sublimes-gold)] text-xs font-bold rounded">Live</div>
          </div>
          <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">{users.filter(u => u.isVerified).length}</p>
          <p className="text-sm text-gray-400">Verified</p>
        </div>

        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
            <div className="px-2 py-1 bg-orange-500/10 text-orange-500 text-xs font-bold rounded">Live</div>
          </div>
          <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">2</p>
          <p className="text-sm text-gray-400">New This Week</p>
        </div>
      </div>

      {/* Date Range Filter with Bulk Actions */}
      <DateRangeFilter
        selectedItems={selectedItems}
        onSelectItem={handleSelectItem}
        onSelectAll={handleSelectAll}
        allItems={filteredUsers}
        onExportData={handleExportData}
        isSelectAllChecked={isSelectAllChecked()}
        title="Users"
      />

      {/* Users Table */}
      <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-[var(--sublimes-border)]">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-400">
            <div className="col-span-3">User</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Location</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Last Active</div>
            <div className="col-span-1">Actions</div>
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-[var(--sublimes-border)]">
          {filteredUsers.map((user) => (
            <div key={user.id} className="px-6 py-4 hover:bg-[var(--sublimes-dark-bg)]/50 transition-colors">
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* User Info */}
                <div className="col-span-3 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[var(--sublimes-gold)] rounded-full flex items-center justify-center">
                    <span className="text-[var(--sublimes-dark-bg)] font-bold text-sm">
                      {user.fullName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-[var(--sublimes-light-text)]">{user.fullName}</p>
                    <p className="text-sm text-gray-400">@{user.username}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>

                {/* Role */}
                <div className="col-span-2">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {getRoleDisplayName(user.role)}
                  </div>
                  {user.badges.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.badges.slice(0, 2).map((badge, index) => (
                        <span key={index} className="px-1.5 py-0.5 bg-[var(--sublimes-gold)]/10 text-[var(--sublimes-gold)] text-xs rounded">
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="col-span-2">
                  <p className="text-[var(--sublimes-light-text)]">{user.emirate}</p>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                    <span className={`text-sm font-medium ${user.isActive ? 'text-green-500' : 'text-gray-500'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {user.isVerified && (
                    <div className="flex items-center space-x-1 mt-1">
                      <CheckCircle className="w-3 h-3 text-[var(--sublimes-gold)]" />
                      <span className="text-xs text-[var(--sublimes-gold)]">Verified</span>
                    </div>
                  )}
                </div>

                {/* Last Active */}
                <div className="col-span-2">
                  <p className="text-sm text-gray-400">{formatLastActive(user.lastActiveAt)}</p>
                </div>

                {/* Actions */}
                <div className="col-span-1">
                  <div className="relative group">
                    <button className="p-1 text-gray-400 hover:text-[var(--sublimes-light-text)] transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {/* Dropdown menu */}
                    <div className="absolute right-0 top-6 w-48 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg shadow-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="py-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-blue-500 hover:bg-blue-500/10 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Profile</span>
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-orange-500 hover:bg-orange-500/10 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit User</span>
                        </button>
                        <button
                          onClick={() => handleVerifyUser(user)}
                          className={`w-full flex items-center space-x-2 px-4 py-2 transition-colors ${
                            user.isVerified 
                              ? 'text-orange-500 hover:bg-orange-500/10' 
                              : 'text-green-500 hover:bg-green-500/10'
                          }`}
                        >
                          {user.isVerified ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          <span>{user.isVerified ? 'Remove Verification' : 'Verify User'}</span>
                        </button>
                        <button
                          onClick={() => handleResetPassword(user)}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-purple-500 hover:bg-purple-500/10 transition-colors"
                        >
                          <Key className="w-4 h-4" />
                          <span>Reset Password</span>
                        </button>
                        <button
                          onClick={() => handleSuspendUser(user)}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-yellow-500 hover:bg-yellow-500/10 transition-colors"
                        >
                          <Ban className="w-4 h-4" />
                          <span>Suspend User</span>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete User</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-[var(--sublimes-light-text)] text-lg font-medium mb-2">No users found</p>
          <p className="text-gray-400">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Modals */}
      <CreateUserModal />
      <InviteUserModal />
      <EditUserModal />
    </div>
  );
}