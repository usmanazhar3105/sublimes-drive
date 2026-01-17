import React, { useState } from 'react';
import { 
  Users, 
  Shield, 
  Settings, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  Edit,
  Ban,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { usePermissions } from '../../hooks/usePermissions';
import { BannerManagement } from './BannerManagement';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'subscriber' | 'editor' | 'admin';
  badge: 'browser' | 'car_owner' | 'garage_owner';
  is_verified: boolean;
  status: 'active' | 'suspended' | 'pending';
  created_at: string;
  last_active: string;
}

interface VerificationRequest {
  id: string;
  user_id: string;
  user_name: string;
  badge_requested: string;
  documents: string[];
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
}

interface SystemStats {
  total_users: number;
  active_users: number;
  verified_users: number;
  pending_verifications: number;
  total_repair_bids: number;
  active_chats: number;
  wallet_transactions: number;
}

/**
 * Comprehensive admin control panel
 */
export const AdminControlPanel: React.FC = () => {
  const permissions = usePermissions();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Mock data - in real app, this would come from API
  const [users] = useState<User[]>([
    {
      id: '1',
      name: 'Ahmed Hassan',
      email: 'ahmed@example.com',
      role: 'subscriber',
      badge: 'car_owner',
      is_verified: true,
      status: 'active',
      created_at: '2024-01-01',
      last_active: '2024-01-08'
    },
    {
      id: '2',
      name: 'Sarah Auto Lover',
      email: 'sarah@example.com',
      role: 'subscriber',
      badge: 'browser',
      is_verified: false,
      status: 'active',
      created_at: '2024-01-02',
      last_active: '2024-01-07'
    },
    {
      id: '3',
      name: 'Dubai Auto Center',
      email: 'dubai@example.com',
      role: 'subscriber',
      badge: 'garage_owner',
      is_verified: true,
      status: 'active',
      created_at: '2024-01-03',
      last_active: '2024-01-08'
    },
    {
      id: '4',
      name: 'John Smith',
      email: 'john@example.com',
      role: 'subscriber',
      badge: 'car_owner',
      is_verified: false,
      status: 'pending',
      created_at: '2024-01-04',
      last_active: '2024-01-06'
    }
  ]);

  const [verificationRequests] = useState<VerificationRequest[]>([
    {
      id: '1',
      user_id: '4',
      user_name: 'John Smith',
      badge_requested: 'car_owner',
      documents: ['mulkia_front.jpg', 'mulkia_back.jpg'],
      status: 'pending',
      submitted_at: '2024-01-06'
    },
    {
      id: '2',
      user_id: '5',
      user_name: 'Auto Garage LLC',
      badge_requested: 'garage_owner',
      documents: ['trade_license.pdf', 'utility_bill.pdf'],
      status: 'pending',
      submitted_at: '2024-01-07'
    }
  ]);

  const [systemStats] = useState<SystemStats>({
    total_users: 1247,
    active_users: 892,
    verified_users: 456,
    pending_verifications: 23,
    total_repair_bids: 156,
    active_chats: 89,
    wallet_transactions: 234
  });

  // Check admin permissions
  if (!permissions.canSeeAdmin) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <XCircle className="w-12 h-12 mx-auto text-red-600 mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Access Denied
          </h3>
          <p className="text-red-700 text-sm">
            You don't have permission to access the admin panel.
          </p>
        </CardContent>
      </Card>
    );
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserAction = (action: string, userId: string) => {
    console.log(`Action: ${action} on user: ${userId}`);
    // Implement user actions
  };

  const handleVerificationAction = (action: string, requestId: string) => {
    console.log(`Verification action: ${action} on request: ${requestId}`);
    // Implement verification actions
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'suspended': return <Ban className="w-4 h-4 text-red-600" />;
      case 'pending': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default: return <XCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'suspended': return 'red';
      case 'pending': return 'yellow';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Admin Control Panel</h2>
          <p className="text-muted-foreground">
            Manage users, verifications, and system settings
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.total_users.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.active_users.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Online now</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Verified Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.verified_users.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">36.6% verification rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Verifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{systemStats.pending_verifications}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="verifications">Verifications</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  User Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">New Users (7 days)</span>
                    <span className="font-medium">+47</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">New Users (30 days)</span>
                    <span className="font-medium">+234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Verification Rate</span>
                    <span className="font-medium">36.6%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Database Status</span>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      Healthy
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">API Response Time</span>
                    <span className="font-medium">45ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Uptime</span>
                    <span className="font-medium">99.9%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import Users
            </Button>
          </div>

          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-5 h-5" />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{user.name}</h3>
                          {user.is_verified && (
                            <Shield className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {user.role}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {user.badge}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs text-${getStatusColor(user.status)}-600 border-${getStatusColor(user.status)}-200`}
                          >
                            {user.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Ban className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Verifications Tab */}
        <TabsContent value="verifications" className="space-y-4">
          <div className="space-y-4">
            {verificationRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{request.user_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Requesting {request.badge_requested} verification
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="text-yellow-600 border-yellow-200"
                    >
                      {request.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Submitted Documents:</h4>
                      <div className="flex gap-2">
                        {request.documents.map((doc, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {doc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleVerificationAction('approve', request.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleVerificationAction('reject', request.id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View Documents
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Banner Management Tab */}
        <TabsContent value="banners" className="space-y-4">
          <BannerManagement />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Verification Auto-Approval</label>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-muted-foreground">
                    Automatically approve verified documents
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">User Registration</label>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm text-muted-foreground">
                    Allow new user registrations
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Maintenance Mode</label>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-muted-foreground">
                    Enable maintenance mode
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
