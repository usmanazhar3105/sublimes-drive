import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { 
  Settings, 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  RefreshCw,
  AlertTriangle,
  Zap,
  Wallet
} from 'lucide-react';
import { toast } from 'sonner';

interface PriceConfig {
  id: string;
  marketplace_car_base_fee_aed: number;
  marketplace_parts_base_fee_aed: number;
  garage_registration_fee_aed: number;
  is_marketplace_car_base_free: boolean;
  is_marketplace_parts_base_free: boolean;
  is_garage_registration_free: boolean;
  wallet_topup_presets_aed: number[];
}

interface BoostPackage {
  id: string;
  title: string;
  description: string;
  amount_aed: number;
  duration_hours: number;
  scope: 'car' | 'parts' | 'both';
  active: boolean;
  sort_order: number;
}

export function AdminPaymentConfiguration() {
  const [priceConfig, setPriceConfig] = useState<PriceConfig | null>(null);
  const [boostPackages, setBoostPackages] = useState<BoostPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBoost, setEditingBoost] = useState<BoostPackage | null>(null);
  const [newPreset, setNewPreset] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch price configuration
      const configResponse = await fetch('/api/admin/price-config');
      const configData = await configResponse.json();
      setPriceConfig(configData);

      // Fetch boost packages
      const boostResponse = await fetch('/api/admin/boost-packages');
      const boostData = await boostResponse.json();
      setBoostPackages(boostData);
    } catch (error) {
      toast.error('Failed to load configuration');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePriceConfig = async () => {
    if (!priceConfig) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/price-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(priceConfig)
      });

      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }

      toast.success('Price configuration saved successfully');
    } catch (error) {
      toast.error('Failed to save configuration');
      console.error('Error saving config:', error);
    } finally {
      setSaving(false);
    }
  };

  const saveBoostPackage = async (boost: BoostPackage) => {
    try {
      const response = await fetch('/api/admin/boost-packages', {
        method: boost.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(boost)
      });

      if (!response.ok) {
        throw new Error('Failed to save boost package');
      }

      toast.success('Boost package saved successfully');
      setIsDialogOpen(false);
      setEditingBoost(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to save boost package');
      console.error('Error saving boost:', error);
    }
  };

  const deleteBoostPackage = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this boost package?')) return;

    try {
      const response = await fetch(`/api/admin/boost-packages/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete boost package');
      }

      toast.success('Boost package deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete boost package');
      console.error('Error deleting boost:', error);
    }
  };

  const addWalletPreset = () => {
    const value = parseFloat(newPreset);
    if (isNaN(value) || value <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!priceConfig) return;

    setPriceConfig({
      ...priceConfig,
      wallet_topup_presets_aed: [...priceConfig.wallet_topup_presets_aed, value].sort((a, b) => a - b)
    });
    setNewPreset('');
  };

  const removeWalletPreset = (index: number) => {
    if (!priceConfig) return;

    setPriceConfig({
      ...priceConfig,
      wallet_topup_presets_aed: priceConfig.wallet_topup_presets_aed.filter((_, i) => i !== index)
    });
  };

  const handleBoostEdit = (boost: BoostPackage | null) => {
    setEditingBoost(boost);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading configuration...</span>
      </div>
    );
  }

  if (!priceConfig) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Configuration Not Found</h3>
        <p className="text-gray-600 mb-4">Price configuration could not be loaded.</p>
        <Button onClick={fetchData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Settings className="w-6 h-6 mr-2" />
            Payment Configuration
          </h2>
          <p className="text-gray-600">Configure pricing and payment settings</p>
        </div>
        <Button onClick={savePriceConfig} disabled={saving}>
          {saving ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Configuration
        </Button>
      </div>

      <Tabs defaultValue="pricing" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="boosts">Boost Packages</TabsTrigger>
          <TabsTrigger value="wallet">Wallet Settings</TabsTrigger>
        </TabsList>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Base Fees
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Car Listing Fee */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="car-fee">Car Listing Fee (AED)</Label>
                  <Input
                    id="car-fee"
                    type="number"
                    step="0.01"
                    value={priceConfig.marketplace_car_base_fee_aed}
                    onChange={(e) => setPriceConfig({
                      ...priceConfig,
                      marketplace_car_base_fee_aed: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="car-free"
                    checked={priceConfig.is_marketplace_car_base_free}
                    onCheckedChange={(checked) => setPriceConfig({
                      ...priceConfig,
                      is_marketplace_car_base_free: checked
                    })}
                  />
                  <Label htmlFor="car-free">Free for car listings</Label>
                </div>
              </div>

              {/* Parts Listing Fee */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parts-fee">Parts Listing Fee (AED)</Label>
                  <Input
                    id="parts-fee"
                    type="number"
                    step="0.01"
                    value={priceConfig.marketplace_parts_base_fee_aed}
                    onChange={(e) => setPriceConfig({
                      ...priceConfig,
                      marketplace_parts_base_fee_aed: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="parts-free"
                    checked={priceConfig.is_marketplace_parts_base_free}
                    onCheckedChange={(checked) => setPriceConfig({
                      ...priceConfig,
                      is_marketplace_parts_base_free: checked
                    })}
                  />
                  <Label htmlFor="parts-free">Free for parts listings</Label>
                </div>
              </div>

              {/* Garage Registration Fee */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="garage-fee">Garage Registration Fee (AED)</Label>
                  <Input
                    id="garage-fee"
                    type="number"
                    step="0.01"
                    value={priceConfig.garage_registration_fee_aed}
                    onChange={(e) => setPriceConfig({
                      ...priceConfig,
                      garage_registration_fee_aed: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="garage-free"
                    checked={priceConfig.is_garage_registration_free}
                    onCheckedChange={(checked) => setPriceConfig({
                      ...priceConfig,
                      is_garage_registration_free: checked
                    })}
                  />
                  <Label htmlFor="garage-free">Free garage registration</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Boost Packages Tab */}
        <TabsContent value="boosts" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Boost Packages
              </CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleBoostEdit(null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Package
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingBoost ? 'Edit Boost Package' : 'Add Boost Package'}
                    </DialogTitle>
                  </DialogHeader>
                  <BoostPackageForm
                    boost={editingBoost}
                    onSave={saveBoostPackage}
                    onCancel={() => {
                      setIsDialogOpen(false);
                      setEditingBoost(null);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {boostPackages.map((boost) => (
                    <TableRow key={boost.id}>
                      <TableCell className="font-medium">{boost.title}</TableCell>
                      <TableCell>{boost.amount_aed} AED</TableCell>
                      <TableCell>{boost.duration_hours}h</TableCell>
                      <TableCell>
                        <Badge variant="outline">{boost.scope}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={boost.active ? 'default' : 'secondary'}>
                          {boost.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleBoostEdit(boost)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteBoostPackage(boost.id)}
                          >
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

        {/* Wallet Settings Tab */}
        <TabsContent value="wallet" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wallet className="w-5 h-5 mr-2" />
                Wallet Top-up Presets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Presets (AED)</Label>
                <div className="flex flex-wrap gap-2">
                  {priceConfig.wallet_topup_presets_aed.map((preset, index) => (
                    <Badge key={index} variant="outline" className="flex items-center">
                      {preset} AED
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeWalletPreset(index)}
                        className="ml-2 h-4 w-4 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={newPreset}
                  onChange={(e) => setNewPreset(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addWalletPreset()}
                />
                <Button onClick={addWalletPreset}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Boost Package Form Component
function BoostPackageForm({ 
  boost, 
  onSave, 
  onCancel 
}: { 
  boost: BoostPackage | null; 
  onSave: (boost: BoostPackage) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState<Partial<BoostPackage>>({
    title: '',
    description: '',
    amount_aed: 0,
    duration_hours: 24,
    scope: 'both',
    active: true,
    sort_order: 0
  });

  useEffect(() => {
    if (boost) {
      setFormData(boost);
    }
  }, [boost]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount_aed || !formData.duration_hours) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSave(formData as BoostPackage);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (AED) *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount_aed || 0}
            onChange={(e) => setFormData({ ...formData, amount_aed: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (hours) *</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration_hours || 24}
            onChange={(e) => setFormData({ ...formData, duration_hours: parseInt(e.target.value) || 24 })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="scope">Scope</Label>
          <select
            id="scope"
            value={formData.scope || 'both'}
            onChange={(e) => setFormData({ ...formData, scope: e.target.value as 'car' | 'parts' | 'both' })}
            className="w-full p-2 border rounded"
          >
            <option value="both">Both</option>
            <option value="car">Car Only</option>
            <option value="parts">Parts Only</option>
          </select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="active"
          checked={formData.active || false}
          onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
        />
        <Label htmlFor="active">Active</Label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {boost ? 'Update' : 'Create'} Package
        </Button>
      </DialogFooter>
    </form>
  );
}
