import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  CreditCard,
  Wallet,
  ShoppingBag,
  Wrench,
  TrendingUp,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

// Types
interface PriceConfig {
  id: string;
  marketplace_car_base_fee_aed: number;
  marketplace_parts_base_fee_aed: number;
  garage_registration_fee_aed: number;
  is_marketplace_car_base_free: boolean;
  is_marketplace_parts_base_free: boolean;
  is_garage_registration_free: boolean;
  wallet_topup_presets_aed: number[];
  currency: string;
  created_at: string;
  updated_at: string;
}

interface BoostPackage {
  id: string;
  title: string;
  description: string;
  amount_aed: number;
  active: boolean;
  scope: 'car' | 'parts' | 'garage' | 'wallet';
  duration_days: number | null;
  features: any;
  sort_order: number;
  created_at: string;
}

interface Payment {
  id: string;
  user_id: string;
  purchase_type: 'listing' | 'garage_registration' | 'wallet_topup';
  entity_id: string;
  amount_aed: number;
  currency: string;
  status: 'initiated' | 'succeeded' | 'failed' | 'canceled' | 'refunded';
  stripe_payment_intent: string | null;
  stripe_session_id: string | null;
  created_at: string;
  updated_at: string;
}

export function AdminPaymentSystemComprehensive() {
  const [priceConfig, setPriceConfig] = useState<PriceConfig | null>(null);
  const [boostPackages, setBoostPackages] = useState<BoostPackage[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isBoostOpen, setIsBoostOpen] = useState(false);
  const [editingBoost, setEditingBoost] = useState<BoostPackage | null>(null);

  // Form states
  const [configForm, setConfigForm] = useState({
    marketplace_car_base_fee_aed: 0,
    marketplace_parts_base_fee_aed: 0,
    garage_registration_fee_aed: 0,
    is_marketplace_car_base_free: false,
    is_marketplace_parts_base_free: false,
    is_garage_registration_free: false,
    wallet_topup_presets_aed: [25, 50, 100, 250, 500],
    currency: 'AED'
  });

  const [boostForm, setBoostForm] = useState({
    title: '',
    description: '',
    amount_aed: 0,
    active: true,
    scope: 'car' as 'car' | 'parts' | 'garage' | 'wallet',
    duration_days: null as number | null,
    features: {},
    sort_order: 0
  });

  // Load data
  useEffect(() => {
    loadPriceConfig();
    loadBoostPackages();
    loadPayments();
  }, []);

  const loadPriceConfig = async () => {
    try {
      const response = await fetch('/api/admin/price-config');
      if (response.ok) {
        const data = await response.json();
        setPriceConfig(data);
        setConfigForm({
          marketplace_car_base_fee_aed: data.marketplace_car_base_fee_aed || 0,
          marketplace_parts_base_fee_aed: data.marketplace_parts_base_fee_aed || 0,
          garage_registration_fee_aed: data.garage_registration_fee_aed || 0,
          is_marketplace_car_base_free: data.is_marketplace_car_base_free || false,
          is_marketplace_parts_base_free: data.is_marketplace_parts_base_free || false,
          is_garage_registration_free: data.is_garage_registration_free || false,
          wallet_topup_presets_aed: data.wallet_topup_presets_aed || [25, 50, 100, 250, 500],
          currency: data.currency || 'AED'
        });
      }
    } catch (error) {
      console.error('Error loading price config:', error);
      toast.error('Failed to load price configuration');
    }
  };

  const loadBoostPackages = async () => {
    try {
      const response = await fetch('/api/admin/boost-packages');
      if (response.ok) {
        const data = await response.json();
        setBoostPackages(data);
      }
    } catch (error) {
      console.error('Error loading boost packages:', error);
      toast.error('Failed to load boost packages');
    }
  };

  const loadPayments = async () => {
    try {
      const response = await fetch('/api/admin/payments');
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Failed to load payments');
    }
  };

  // Save price configuration
  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/price-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configForm)
      });

      if (response.ok) {
        toast.success('Price configuration updated successfully');
        setIsConfigOpen(false);
        loadPriceConfig();
      } else {
        throw new Error('Failed to update price configuration');
      }
    } catch (error) {
      console.error('Error saving price config:', error);
      toast.error('Failed to update price configuration');
    } finally {
      setLoading(false);
    }
  };

  // Save boost package
  const handleSaveBoost = async () => {
    setLoading(true);
    try {
      const url = editingBoost ? `/api/admin/boost-packages/${editingBoost.id}` : '/api/admin/boost-packages';
      const method = editingBoost ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(boostForm)
      });

      if (response.ok) {
        toast.success(`Boost package ${editingBoost ? 'updated' : 'created'} successfully`);
        setIsBoostOpen(false);
        setEditingBoost(null);
        resetBoostForm();
        loadBoostPackages();
      } else {
        throw new Error(`Failed to ${editingBoost ? 'update' : 'create'} boost package`);
      }
    } catch (error) {
      console.error('Error saving boost package:', error);
      toast.error(`Failed to ${editingBoost ? 'update' : 'create'} boost package`);
    } finally {
      setLoading(false);
    }
  };

  // Delete boost package
  const handleDeleteBoost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this boost package?')) return;

    try {
      const response = await fetch(`/api/admin/boost-packages/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Boost package deleted successfully');
        loadBoostPackages();
      } else {
        throw new Error('Failed to delete boost package');
      }
    } catch (error) {
      console.error('Error deleting boost package:', error);
      toast.error('Failed to delete boost package');
    }
  };

  // Edit boost package
  const handleEditBoost = (boost: BoostPackage) => {
    setEditingBoost(boost);
    setBoostForm({
      title: boost.title,
      description: boost.description,
      amount_aed: boost.amount_aed,
      active: boost.active,
      scope: boost.scope,
      duration_days: boost.duration_days,
      features: boost.features,
      sort_order: boost.sort_order
    });
    setIsBoostOpen(true);
  };

  // Reset boost form
  const resetBoostForm = () => {
    setBoostForm({
      title: '',
      description: '',
      amount_aed: 0,
      active: true,
      scope: 'car',
      duration_days: null,
      features: {},
      sort_order: 0
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      initiated: { color: 'bg-yellow-500/10 text-yellow-500', text: 'Initiated' },
      succeeded: { color: 'bg-green-500/10 text-green-500', text: 'Succeeded' },
      failed: { color: 'bg-red-500/10 text-red-500', text: 'Failed' },
      canceled: { color: 'bg-gray-500/10 text-gray-500', text: 'Canceled' },
      refunded: { color: 'bg-blue-500/10 text-blue-500', text: 'Refunded' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.initiated;
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  // Get purchase type icon
  const getPurchaseTypeIcon = (type: string) => {
    switch (type) {
      case 'listing': return <ShoppingBag className="w-4 h-4" />;
      case 'garage_registration': return <Wrench className="w-4 h-4" />;
      case 'wallet_topup': return <Wallet className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--sublimes-light-text)]">Payment System</h1>
          <p className="text-gray-400">Manage pricing, boost packages, and payment flows</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsConfigOpen(true)} className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/90">
            <Settings className="w-4 h-4 mr-2" />
            Configure Pricing
          </Button>
          <Button onClick={() => setIsBoostOpen(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Boost Package
          </Button>
          <Button onClick={() => { loadPriceConfig(); loadBoostPackages(); loadPayments(); }} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
            <p className="text-xs text-muted-foreground">
              {payments.filter(p => p.status === 'succeeded').length} successful
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments
                .filter(p => p.status === 'succeeded')
                .reduce((sum, p) => sum + p.amount_aed, 0)
                .toFixed(0)} AED
            </div>
            <p className="text-xs text-muted-foreground">
              Total revenue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Boost Packages</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{boostPackages.length}</div>
            <p className="text-xs text-muted-foreground">
              {boostPackages.filter(b => b.active).length} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments.length > 0 
                ? Math.round((payments.filter(p => p.status === 'succeeded').length / payments.length) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Payment success rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <TabsTrigger value="payments" className="data-[state=active]:bg-[var(--sublimes-gold)] data-[state=active]:text-[var(--sublimes-dark-bg)]">
            <CreditCard className="w-4 h-4 mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="boost-packages" className="data-[state=active]:bg-[var(--sublimes-gold)] data-[state=active]:text-[var(--sublimes-dark-bg)]">
            <TrendingUp className="w-4 h-4 mr-2" />
            Boost Packages
          </TabsTrigger>
          <TabsTrigger value="pricing" className="data-[state=active]:bg-[var(--sublimes-gold)] data-[state=active]:text-[var(--sublimes-dark-bg)]">
            <DollarSign className="w-4 h-4 mr-2" />
            Pricing
          </TabsTrigger>
        </TabsList>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Recent Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getPurchaseTypeIcon(payment.purchase_type)}
                          <span className="capitalize">{payment.purchase_type.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">User {payment.user_id.slice(0, 8)}</div>
                          <div className="text-gray-500">{payment.entity_id.slice(0, 8)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{payment.amount_aed} {payment.currency}</div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(payment.created_at).toLocaleDateString()}</div>
                          <div className="text-gray-500">{new Date(payment.created_at).toLocaleTimeString()}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          {payment.status === 'succeeded' && (
                            <Button size="sm" variant="outline" className="text-red-500 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Boost Packages Tab */}
        <TabsContent value="boost-packages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Boost Packages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {boostPackages.map((boost) => (
                    <TableRow key={boost.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{boost.title}</div>
                          <div className="text-sm text-gray-500">{boost.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{boost.scope}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{boost.amount_aed} AED</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {boost.duration_days ? `${boost.duration_days} days` : 'Permanent'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={boost.active ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}>
                          {boost.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditBoost(boost)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteBoost(boost.id)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Current Pricing Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              {priceConfig && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Car Listing Fee (AED)</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={configForm.marketplace_car_base_fee_aed}
                          onChange={(e) => setConfigForm({ ...configForm, marketplace_car_base_fee_aed: parseFloat(e.target.value) || 0 })}
                          type="number"
                          step="0.01"
                        />
                        <Switch
                          checked={configForm.is_marketplace_car_base_free}
                          onCheckedChange={(checked) => setConfigForm({ ...configForm, is_marketplace_car_base_free: checked })}
                        />
                        <Label>Free</Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Parts Listing Fee (AED)</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={configForm.marketplace_parts_base_fee_aed}
                          onChange={(e) => setConfigForm({ ...configForm, marketplace_parts_base_fee_aed: parseFloat(e.target.value) || 0 })}
                          type="number"
                          step="0.01"
                        />
                        <Switch
                          checked={configForm.is_marketplace_parts_base_free}
                          onCheckedChange={(checked) => setConfigForm({ ...configForm, is_marketplace_parts_base_free: checked })}
                        />
                        <Label>Free</Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Garage Registration Fee (AED)</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={configForm.garage_registration_fee_aed}
                          onChange={(e) => setConfigForm({ ...configForm, garage_registration_fee_aed: parseFloat(e.target.value) || 0 })}
                          type="number"
                          step="0.01"
                        />
                        <Switch
                          checked={configForm.is_garage_registration_free}
                          onCheckedChange={(checked) => setConfigForm({ ...configForm, is_garage_registration_free: checked })}
                        />
                        <Label>Free</Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Wallet Top-up Presets (AED)</Label>
                      <Input
                        value={configForm.wallet_topup_presets_aed.join(', ')}
                        onChange={(e) => setConfigForm({ 
                          ...configForm, 
                          wallet_topup_presets_aed: e.target.value.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v))
                        })}
                        placeholder="25, 50, 100, 250, 500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSaveConfig} className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/90">
                      <Save className="w-4 h-4 mr-2" />
                      Save Configuration
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Boost Package Dialog */}
      <Dialog open={isBoostOpen} onOpenChange={setIsBoostOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingBoost ? 'Edit Boost Package' : 'Create Boost Package'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="boost-title">Title</Label>
                <Input
                  id="boost-title"
                  value={boostForm.title}
                  onChange={(e) => setBoostForm({ ...boostForm, title: e.target.value })}
                  placeholder="e.g., Featured Listing"
                />
              </div>
              <div>
                <Label htmlFor="boost-amount">Amount (AED)</Label>
                <Input
                  id="boost-amount"
                  type="number"
                  step="0.01"
                  value={boostForm.amount_aed}
                  onChange={(e) => setBoostForm({ ...boostForm, amount_aed: parseFloat(e.target.value) || 0 })}
                  placeholder="25.00"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="boost-description">Description</Label>
              <Textarea
                id="boost-description"
                value={boostForm.description}
                onChange={(e) => setBoostForm({ ...boostForm, description: e.target.value })}
                placeholder="Describe what this boost package offers"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="boost-scope">Scope</Label>
                <select
                  id="boost-scope"
                  value={boostForm.scope}
                  onChange={(e) => setBoostForm({ ...boostForm, scope: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] rounded-md"
                >
                  <option value="car">Car</option>
                  <option value="parts">Parts</option>
                  <option value="garage">Garage</option>
                  <option value="wallet">Wallet</option>
                </select>
              </div>
              <div>
                <Label htmlFor="boost-duration">Duration (days)</Label>
                <Input
                  id="boost-duration"
                  type="number"
                  value={boostForm.duration_days || ''}
                  onChange={(e) => setBoostForm({ ...boostForm, duration_days: parseInt(e.target.value) || null })}
                  placeholder="7"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="boost-active"
                checked={boostForm.active}
                onCheckedChange={(checked) => setBoostForm({ ...boostForm, active: checked })}
              />
              <Label htmlFor="boost-active">Active</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsBoostOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveBoost} className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/90">
                {editingBoost ? 'Update' : 'Create'} Boost Package
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
