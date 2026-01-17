import { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, DollarSign, Calendar, Zap, Eye, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface BoostPackage {
  id: string;
  name: string;
  duration: number;
  price: number;
  originalPrice?: number;
  features: string[];
  badge?: string;
  badgeColor?: string;
  popular?: boolean;
  active: boolean;
  category: 'marketplace' | 'garage' | 'both';
  createdAt?: string;
  updatedAt?: string;
}

interface ListingFee {
  id: string;
  category: 'marketplace' | 'garage';
  baseFee: number;
  currency: 'AED' | '%';
  active: boolean;
  description: string;
}

export function AdminBoostPackagesPage() {
  const [boostPackages, setBoostPackages] = useState<BoostPackage[]>([
    {
      id: 'boost-7',
      name: '7-Day Boost',
      duration: 7,
      price: 49,
      originalPrice: 70,
      features: [
        'Top search results for 7 days',
        'Featured badge on listing',
        'Push notifications to followers',
        '3x more visibility',
        'Priority customer support'
      ],
      badge: 'STARTER',
      badgeColor: 'blue',
      popular: false,
      active: true,
      category: 'both',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: 'boost-14',
      name: '14-Day Boost',
      duration: 14,
      price: 89,
      originalPrice: 140,
      features: [
        'Top search results for 14 days', 
        'Featured badge on listing',
        'Push notifications to followers',
        '5x more visibility',
        'Priority customer support',
        'Social media promotion',
        'Weekly performance report'
      ],
      badge: 'POPULAR',
      badgeColor: 'gold',
      popular: true,
      active: true,
      category: 'both',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20'
    },
    {
      id: 'boost-30',
      name: '30-Day Boost',
      duration: 30,
      price: 149,
      originalPrice: 280,
      features: [
        'Top search results for 30 days',
        'Featured badge on listing',
        'Push notifications to followers', 
        '10x more visibility',
        'Priority customer support',
        'Social media promotion',
        'Weekly performance reports',
        'Dedicated account manager',
        'Premium listing design'
      ],
      badge: 'PREMIUM',
      badgeColor: 'purple',
      popular: false,
      active: true,
      category: 'both',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    }
  ]);

  const [listingFees, setListingFees] = useState<ListingFee[]>([
    {
      id: 'car-listing-fee',
      category: 'marketplace',
      baseFee: 52.5, // 50 AED + 5% VAT
      currency: 'AED',
      active: true,
      description: 'Basic car listing fee (50 AED + 5% VAT)'
    },
    {
      id: 'car-part-listing-fee',
      category: 'marketplace',
      baseFee: 8, // 8% of listing price
      currency: '%',
      active: true,
      description: 'Basic car part listing fee (8% of user listing price inclusive of VAT)'
    },
    {
      id: 'garage-listing-fee',
      category: 'garage',
      baseFee: 105, // 100 AED + 5% VAT
      currency: 'AED',
      active: true,
      description: 'Basic garage listing fee (100 AED + 5% VAT)'
    }
  ]);

  const [editingPackage, setEditingPackage] = useState<BoostPackage | null>(null);
  const [editingFee, setEditingFee] = useState<ListingFee | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isFeeDialogOpen, setIsFeeDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('packages');

  const [newPackage, setNewPackage] = useState<Partial<BoostPackage>>({
    name: '',
    duration: 7,
    price: 0,
    originalPrice: 0,
    features: [''],
    badge: '',
    badgeColor: 'blue',
    popular: false,
    active: true,
    category: 'both'
  });

  const handleCreatePackage = () => {
    if (newPackage.name && newPackage.price) {
      const packageToAdd: BoostPackage = {
        id: 'boost-' + Date.now(),
        name: newPackage.name!,
        duration: newPackage.duration || 7,
        price: newPackage.price!,
        originalPrice: newPackage.originalPrice,
        features: newPackage.features?.filter(f => f.trim()) || [],
        badge: newPackage.badge,
        badgeColor: newPackage.badgeColor || 'blue',
        popular: newPackage.popular || false,
        active: newPackage.active !== false,
        category: newPackage.category || 'both',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };

      setBoostPackages(prev => [...prev, packageToAdd]);
      setNewPackage({
        name: '',
        duration: 7,
        price: 0,
        originalPrice: 0,
        features: [''],
        badge: '',
        badgeColor: 'blue',
        popular: false,
        active: true,
        category: 'both'
      });
      setIsCreateDialogOpen(false);
    }
  };

  const handleUpdatePackage = (id: string, updatedPackage: Partial<BoostPackage>) => {
    setBoostPackages(prev => prev.map(pkg => 
      pkg.id === id 
        ? { ...pkg, ...updatedPackage, updatedAt: new Date().toISOString().split('T')[0] }
        : pkg
    ));
    setEditingPackage(null);
  };

  const handleDeletePackage = (id: string) => {
    setBoostPackages(prev => prev.filter(pkg => pkg.id !== id));
  };

  const handleUpdateFee = (id: string, updatedFee: Partial<ListingFee>) => {
    setListingFees(prev => prev.map(fee => 
      fee.id === id ? { ...fee, ...updatedFee } : fee
    ));
    setEditingFee(null);
  };

  const getBadgeColorClass = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-500',
      gold: 'bg-[var(--sublimes-gold)]',
      purple: 'bg-purple-600',
      green: 'bg-green-500',
      red: 'bg-red-500'
    };
    return colors[color] || 'bg-blue-500';
  };

  const addFeature = (features: string[], setFeatures: (features: string[]) => void) => {
    setFeatures([...features, '']);
  };

  const removeFeature = (index: number, features: string[], setFeatures: (features: string[]) => void) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const updateFeature = (index: number, value: string, features: string[], setFeatures: (features: string[]) => void) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Boost Packages Management</h1>
          <p className="text-muted-foreground">Manage listing fees and boost packages</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsFeeDialogOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Manage Fees
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Package
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="packages">Boost Packages</TabsTrigger>
          <TabsTrigger value="fees">Base Listing Fees</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="space-y-6">
          {/* Boost Packages */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boostPackages.map((pkg) => (
              <Card key={pkg.id} className={`relative ${!pkg.active ? 'opacity-60' : ''}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {pkg.badge && (
                        <Badge className={`${getBadgeColorClass(pkg.badgeColor || 'blue')} text-white px-2 py-1 text-xs`}>
                          {pkg.badge}
                        </Badge>
                      )}
                      {pkg.popular && (
                        <Badge className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] px-2 py-1 text-xs">
                          POPULAR
                        </Badge>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingPackage(pkg)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeletePackage(pkg.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-[var(--sublimes-gold)]">
                        AED {pkg.price}
                      </span>
                      {pkg.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          AED {pkg.originalPrice}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{pkg.duration} days</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Category</Label>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {pkg.category}
                      </Badge>
                    </div>
                    
                    <div>
                      <Label className="text-xs">Features</Label>
                      <div className="space-y-1 mt-1">
                        {pkg.features.slice(0, 3).map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <span className="w-1 h-1 bg-[var(--sublimes-gold)] rounded-full" />
                            <span className="text-xs">{feature}</span>
                          </div>
                        ))}
                        {pkg.features.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{pkg.features.length - 3} more features
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <span>Status: {pkg.active ? 'Active' : 'Inactive'}</span>
                      <span>Updated: {pkg.updatedAt}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="fees" className="space-y-6">
          {/* Base Listing Fees */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {listingFees.map((fee) => (
              <Card key={fee.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="capitalize">{fee.category} Listings</CardTitle>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingFee(fee)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[var(--sublimes-gold)]">
                        {fee.currency === '%' ? `${fee.baseFee}%` : `AED ${fee.baseFee}`}
                      </div>
                      <p className="text-sm text-muted-foreground">Base listing fee</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs">Description</Label>
                      <p className="text-sm">{fee.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status</span>
                      <Badge variant={fee.active ? "default" : "secondary"}>
                        {fee.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">AED 15,420</p>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-[var(--sublimes-gold)]" />
                  <div>
                    <p className="text-2xl font-bold">127</p>
                    <p className="text-sm text-muted-foreground">Boost Purchases</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">73%</p>
                    <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">14-Day</p>
                    <p className="text-sm text-muted-foreground">Most Popular</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Package Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Boost Package</DialogTitle>
            <DialogDescription>
              Create a new boost package to help users increase visibility for their listings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Package Name</Label>
                <Input
                  value={newPackage.name || ''}
                  onChange={(e) => setNewPackage(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., 7-Day Boost"
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (days)</Label>
                <Input
                  type="number"
                  value={newPackage.duration || 7}
                  onChange={(e) => setNewPackage(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (AED)</Label>
                <Input
                  type="number"
                  value={newPackage.price || ''}
                  onChange={(e) => setNewPackage(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Original Price (Optional)</Label>
                <Input
                  type="number"
                  value={newPackage.originalPrice || ''}
                  onChange={(e) => setNewPackage(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Features</Label>
              {(newPackage.features || ['']).map((feature, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value, newPackage.features || [''], (features) => setNewPackage(prev => ({ ...prev, features })))}
                    placeholder="Enter feature"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => removeFeature(index, newPackage.features || [''], (features) => setNewPackage(prev => ({ ...prev, features })))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => addFeature(newPackage.features || [''], (features) => setNewPackage(prev => ({ ...prev, features })))}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Feature
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Badge Text</Label>
                <Input
                  value={newPackage.badge || ''}
                  onChange={(e) => setNewPackage(prev => ({ ...prev, badge: e.target.value }))}
                  placeholder="e.g., STARTER"
                />
              </div>
              <div className="space-y-2">
                <Label>Badge Color</Label>
                <Select value={newPackage.badgeColor} onValueChange={(value) => setNewPackage(prev => ({ ...prev, badgeColor: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newPackage.category} onValueChange={(value: 'marketplace' | 'garage' | 'both') => setNewPackage(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marketplace">Marketplace</SelectItem>
                    <SelectItem value="garage">Garage</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newPackage.popular || false}
                  onCheckedChange={(checked) => setNewPackage(prev => ({ ...prev, popular: checked }))}
                />
                <Label>Mark as Popular</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newPackage.active !== false}
                  onCheckedChange={(checked) => setNewPackage(prev => ({ ...prev, active: checked }))}
                />
                <Label>Active</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePackage}>
                <Save className="mr-2 h-4 w-4" />
                Create Package
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Package Dialog */}
      {editingPackage && (
        <Dialog open={!!editingPackage} onOpenChange={() => setEditingPackage(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Boost Package</DialogTitle>
              <DialogDescription>
                Modify the details of this boost package.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Package Name</Label>
                  <Input
                    value={editingPackage.name}
                    onChange={(e) => setEditingPackage(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration (days)</Label>
                  <Input
                    type="number"
                    value={editingPackage.duration}
                    onChange={(e) => setEditingPackage(prev => prev ? ({ ...prev, duration: parseInt(e.target.value) }) : null)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (AED)</Label>
                  <Input
                    type="number"
                    value={editingPackage.price}
                    onChange={(e) => setEditingPackage(prev => prev ? ({ ...prev, price: parseFloat(e.target.value) }) : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Original Price (Optional)</Label>
                  <Input
                    type="number"
                    value={editingPackage.originalPrice || ''}
                    onChange={(e) => setEditingPackage(prev => prev ? ({ ...prev, originalPrice: parseFloat(e.target.value) }) : null)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingPackage.popular}
                    onCheckedChange={(checked) => setEditingPackage(prev => prev ? ({ ...prev, popular: checked }) : null)}
                  />
                  <Label>Mark as Popular</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingPackage.active}
                    onCheckedChange={(checked) => setEditingPackage(prev => prev ? ({ ...prev, active: checked }) : null)}
                  />
                  <Label>Active</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingPackage(null)}>
                  Cancel
                </Button>
                <Button onClick={() => handleUpdatePackage(editingPackage.id, editingPackage)}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Fee Dialog */}
      {editingFee && (
        <Dialog open={!!editingFee} onOpenChange={() => setEditingFee(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit {editingFee.category} Base Fee</DialogTitle>
              <DialogDescription>
                Update the base listing fee for {editingFee.category} listings.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Base Fee (AED)</Label>
                <Input
                  type="number"
                  value={editingFee.baseFee}
                  onChange={(e) => setEditingFee(prev => prev ? ({ ...prev, baseFee: parseFloat(e.target.value) }) : null)}
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingFee.description}
                  onChange={(e) => setEditingFee(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingFee.active}
                  onCheckedChange={(checked) => setEditingFee(prev => prev ? ({ ...prev, active: checked }) : null)}
                />
                <Label>Active</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingFee(null)}>
                  Cancel
                </Button>
                <Button onClick={() => handleUpdateFee(editingFee.id, editingFee)}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Manage Fees Dialog */}
      <Dialog open={isFeeDialogOpen} onOpenChange={setIsFeeDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Basic Listing Fees</DialogTitle>
            <DialogDescription>
              Configure the basic fees for different types of listings. These are the base fees before any boost packages.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {listingFees.map((fee) => (
                <Card key={fee.id} className="border-[var(--sublimes-border)]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="capitalize">{fee.id.replace('-', ' ')}</CardTitle>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingFee(fee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-[var(--sublimes-gold)]">
                          {fee.currency === '%' ? `${fee.baseFee}%` : `AED ${fee.baseFee}`}
                        </div>
                        <p className="text-sm text-gray-400 mt-2">{fee.description}</p>
                      </div>
                      
                      <div className="flex items-center justify-center">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          fee.active 
                            ? 'bg-green-500/10 text-green-500' 
                            : 'bg-gray-500/10 text-gray-500'
                        }`}>
                          {fee.active ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg p-4">
              <h3 className="font-medium text-[var(--sublimes-light-text)] mb-2">Fee Structure Information</h3>
              <div className="text-sm text-gray-400 space-y-1">
                <p>• <strong>Car Listings:</strong> Fixed fee of 50 AED + 5% VAT = 52.5 AED total</p>
                <p>• <strong>Car Parts:</strong> 8% of the user's listing price (inclusive of VAT)</p>
                <p>• <strong>Garage Services:</strong> Fixed fee of 100 AED + 5% VAT = 105 AED total</p>
                <p className="mt-2 text-xs text-[var(--sublimes-gold)]">
                  Note: These are basic listing fees. Boost packages are additional features on top of these base fees.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}