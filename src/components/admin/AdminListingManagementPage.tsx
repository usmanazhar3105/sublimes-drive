import { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, DollarSign, Calendar, Zap, Eye, Settings, Clock, Gift } from 'lucide-react';
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
import { DateRangeFilter } from './DateRangeFilter';
import { SelectableRow } from './BulkActionControls';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';

interface ListingFee {
  id: string;
  category: 'car' | 'car-parts' | 'garage';
  baseFee: number;
  currency: 'AED' | '%';
  active: boolean;
  description: string;
}

interface DurationSetting {
  id: string;
  category: 'car' | 'car-parts' | 'garage';
  duration: number; // days
  type: 'listing' | 'trial';
  active: boolean;
  description: string;
}

interface BoostPackage {
  id: string;
  name: string;
  duration: number; // days
  price: number;
  originalPrice?: number;
  features: string[];
  badge?: string;
  badgeColor?: string;
  popular?: boolean;
  active: boolean;
  category: 'car' | 'car-parts' | 'garage' | 'all';
  type: 'boost-addon';
  createdAt: string;
  updatedAt?: string;
}

export function AdminListingManagementPage() {
  // Base listing fees
  const [listingFees, setListingFees] = useState<ListingFee[]>([
    {
      id: 'car-listing-fee',
      category: 'car',
      baseFee: 52.5, // 50 AED + 5% VAT
      currency: 'AED',
      active: true,
      description: 'Basic car listing fee (50 AED + 5% VAT)'
    },
    {
      id: 'car-part-listing-fee',
      category: 'car-parts',
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

  // Duration settings (validity of listing life)
  const [durationSettings, setDurationSettings] = useState<DurationSetting[]>([
    // 60-day listings
    {
      id: 'car-60-listing',
      category: 'car',
      duration: 60,
      type: 'listing',
      active: true,
      description: 'Car listing live for 60 days'
    },
    {
      id: 'car-parts-60-listing',
      category: 'car-parts',
      duration: 60,
      type: 'listing',
      active: true,
      description: 'Car parts listing live for 60 days'
    },
    {
      id: 'garage-60-listing',
      category: 'garage',
      duration: 60,
      type: 'listing',
      active: true,
      description: 'Garage service listing live for 60 days'
    },
    // 90-day trial pass (submit for verification)
    {
      id: 'car-90-trial',
      category: 'car',
      duration: 90,
      type: 'trial',
      active: true,
      description: '90-day trial pass - submit car listing for verification'
    },
    {
      id: 'car-parts-90-trial',
      category: 'car-parts',
      duration: 90,
      type: 'trial',
      active: true,
      description: '90-day trial pass - submit car parts listing for verification'
    },
    {
      id: 'garage-90-trial',
      category: 'garage',
      duration: 90,
      type: 'trial',
      active: true,
      description: '90-day trial pass - submit garage service for verification'
    }
  ]);

  // Boost addon packages
  const [boostPackages, setBoostPackages] = useState<BoostPackage[]>([
    {
      id: 'boost-7',
      name: '7-Day Boost',
      duration: 7,
      price: 25,
      originalPrice: 35,
      features: [
        'Top search results for 7 days',
        'Featured badge on listing',
        'Priority customer support',
        'Enhanced visibility'
      ],
      badge: 'Popular',
      badgeColor: 'blue',
      popular: true,
      active: true,
      category: 'all',
      type: 'boost-addon',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'boost-14',
      name: '14-Day Boost',
      duration: 14,
      price: 45,
      originalPrice: 65,
      features: [
        'Top search results for 14 days',
        'Featured badge on listing',
        'Social media promotion',
        'Analytics dashboard access',
        'Priority customer support'
      ],
      badge: 'Best Value',
      badgeColor: 'green',
      popular: false,
      active: true,
      category: 'all',
      type: 'boost-addon',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'boost-30',
      name: '30-Day Premium Boost',
      duration: 30,
      price: 85,
      originalPrice: 120,
      features: [
        'Top search results for 30 days',
        'Premium featured badge',
        'Social media promotion',
        'Dedicated account manager',
        'Advanced analytics',
        'Custom marketing materials',
        'Priority customer support'
      ],
      badge: 'Premium',
      badgeColor: 'gold',
      popular: false,
      active: true,
      category: 'all',
      type: 'boost-addon',
      createdAt: '2024-01-15T10:00:00Z'
    }
  ]);

  const [activeTab, setActiveTab] = useState('base-fees');
  const [editingFee, setEditingFee] = useState<ListingFee | null>(null);
  const [editingDuration, setEditingDuration] = useState<DurationSetting | null>(null);
  const [editingBoost, setEditingBoost] = useState<BoostPackage | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createType, setCreateType] = useState<'duration' | 'boost'>('duration');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const [newDuration, setNewDuration] = useState<Partial<DurationSetting>>({
    category: 'car',
    duration: 60,
    type: 'listing',
    active: true,
    description: ''
  });

  const [newBoost, setNewBoost] = useState<Partial<BoostPackage>>({
    name: '',
    duration: 7,
    price: 0,
    originalPrice: 0,
    features: [''],
    badge: '',
    badgeColor: 'blue',
    popular: false,
    active: true,
    category: 'all',
    type: 'boost-addon'
  });

  // Utility functions
  const getBadgeColorClass = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-green-500';
      case 'gold': return 'bg-[var(--sublimes-gold)]';
      case 'red': return 'bg-red-500';
      case 'purple': return 'bg-purple-500';
      default: return 'bg-blue-500';
    }
  };

  const addFeature = (features: string[], setFeatures: (features: string[]) => void) => {
    setFeatures([...features, '']);
  };

  const updateFeature = (index: number, value: string, features: string[], setFeatures: (features: string[]) => void) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const removeFeature = (index: number, features: string[], setFeatures: (features: string[]) => void) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  // CRUD operations
  const handleUpdateFee = (id: string, updatedFee: ListingFee) => {
    setListingFees(prev => prev.map(fee => fee.id === id ? updatedFee : fee));
    setEditingFee(null);
    toast.success('Listing fee updated successfully');
  };

  const handleUpdateDuration = (id: string, updatedDuration: DurationSetting) => {
    setDurationSettings(prev => prev.map(d => d.id === id ? updatedDuration : d));
    setEditingDuration(null);
    toast.success('Duration setting updated successfully');
  };

  const handleCreateDuration = () => {
    if (!newDuration.description || !newDuration.duration) {
      toast.error('Please fill in all required fields');
      return;
    }

    const duration: DurationSetting = {
      id: `${newDuration.category}-${newDuration.duration}-${newDuration.type}-${Date.now()}`,
      category: newDuration.category as 'car' | 'car-parts' | 'garage',
      duration: newDuration.duration!,
      type: newDuration.type as 'listing' | 'trial',
      active: newDuration.active!,
      description: newDuration.description
    };

    setDurationSettings(prev => [...prev, duration]);
    setNewDuration({
      category: 'car',
      duration: 60,
      type: 'listing',
      active: true,
      description: ''
    });
    setIsCreateDialogOpen(false);
    toast.success('Duration setting created successfully');
  };

  const handleCreateBoost = () => {
    if (!newBoost.name || !newBoost.price || !newBoost.features?.some(f => f.trim())) {
      toast.error('Please fill in all required fields');
      return;
    }

    const boost: BoostPackage = {
      id: `boost-${Date.now()}`,
      name: newBoost.name,
      duration: newBoost.duration!,
      price: newBoost.price!,
      originalPrice: newBoost.originalPrice,
      features: newBoost.features!.filter(f => f.trim()),
      badge: newBoost.badge,
      badgeColor: newBoost.badgeColor,
      popular: newBoost.popular!,
      active: newBoost.active!,
      category: newBoost.category as 'car' | 'car-parts' | 'garage' | 'all',
      type: 'boost-addon',
      createdAt: new Date().toISOString()
    };

    setBoostPackages(prev => [...prev, boost]);
    setNewBoost({
      name: '',
      duration: 7,
      price: 0,
      originalPrice: 0,
      features: [''],
      badge: '',
      badgeColor: 'blue',
      popular: false,
      active: true,
      category: 'all',
      type: 'boost-addon'
    });
    setIsCreateDialogOpen(false);
    toast.success('Boost package created successfully');
  };

  const handleDeleteDuration = (id: string) => {
    setDurationSettings(prev => prev.filter(d => d.id !== id));
    toast.success('Duration setting deleted successfully');
  };

  const handleDeleteBoost = (id: string) => {
    setBoostPackages(prev => prev.filter(b => b.id !== id));
    toast.success('Boost package deleted successfully');
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
    const currentItems = activeTab === 'base-fees' ? listingFees : 
                        activeTab === 'duration-settings' ? durationSettings : 
                        boostPackages;
    
    if (selectAll) {
      setSelectedItems(currentItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  // Export functionality
  const handleExportData = (selectedIds: string[], dateRange: { from: string; to: string }) => {
    const currentItems = activeTab === 'base-fees' ? listingFees : 
                        activeTab === 'duration-settings' ? durationSettings : 
                        boostPackages;

    const itemsToExport = selectedIds.length > 0 
      ? currentItems.filter(item => selectedIds.includes(item.id))
      : currentItems;

    // Apply date filter if provided (for boost packages)
    let filteredItems = itemsToExport;
    if ((dateRange?.from || dateRange?.to) && activeTab === 'boost-packages') {
      filteredItems = itemsToExport.filter(item => {
        const itemDate = new Date((item as BoostPackage).createdAt);
        const fromDate = dateRange.from ? new Date(dateRange.from) : null;
        const toDate = dateRange.to ? new Date(dateRange.to) : null;
        
        if (fromDate && itemDate < fromDate) return false;
        if (toDate && itemDate > toDate) return false;
        return true;
      });
    }

    // Create CSV content
    let headers: string[] = [];
    let csvRows: string[] = [];

    if (activeTab === 'base-fees') {
      headers = ['ID', 'Category', 'Base Fee', 'Currency', 'Status', 'Description'];
      csvRows = filteredItems.map(item => {
        const fee = item as ListingFee;
        return [
          fee.id,
          fee.category,
          fee.baseFee.toString(),
          fee.currency,
          fee.active ? 'Active' : 'Inactive',
          `"${fee.description}"`
        ].join(',');
      });
    } else if (activeTab === 'duration-settings') {
      headers = ['ID', 'Category', 'Duration (Days)', 'Type', 'Status', 'Description'];
      csvRows = filteredItems.map(item => {
        const duration = item as DurationSetting;
        return [
          duration.id,
          duration.category,
          duration.duration.toString(),
          duration.type,
          duration.active ? 'Active' : 'Inactive',
          `"${duration.description}"`
        ].join(',');
      });
    } else {
      headers = ['ID', 'Name', 'Duration (Days)', 'Price (AED)', 'Category', 'Status', 'Popular', 'Created At'];
      csvRows = filteredItems.map(item => {
        const boost = item as BoostPackage;
        return [
          boost.id,
          `"${boost.name}"`,
          boost.duration.toString(),
          boost.price.toString(),
          boost.category,
          boost.active ? 'Active' : 'Inactive',
          boost.popular ? 'Yes' : 'No',
          boost.createdAt || 'N/A'
        ].join(',');
      });
    }

    const csvContent = [headers.join(','), ...csvRows].join('\\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success(`Exported ${filteredItems.length} items successfully`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)]">Listing & Boost Management</h1>
          <p className="text-gray-400">Manage listing fees, duration pricing, and boost packages</p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New
        </Button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-[var(--sublimes-light-text)]">AED 15,420</p>
                <p className="text-sm text-gray-400">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-[var(--sublimes-gold)]" />
              <div>
                <p className="text-2xl font-bold text-[var(--sublimes-light-text)]">{boostPackages.filter(b => b.active).length}</p>
                <p className="text-sm text-gray-400">Active Boosts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-[var(--sublimes-light-text)]">{durationSettings.filter(d => d.active).length}</p>
                <p className="text-sm text-gray-400">Duration Settings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Gift className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-[var(--sublimes-light-text)]">156</p>
                <p className="text-sm text-gray-400">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date Range Filter with Bulk Actions */}
      <DateRangeFilter
        selectedItems={selectedItems}
        onSelectItem={handleSelectItem}
        onSelectAll={handleSelectAll}
        allItems={activeTab === 'base-fees' ? listingFees : 
                 activeTab === 'duration-settings' ? durationSettings : 
                 boostPackages}
        onExportData={handleExportData}
        title={activeTab === 'base-fees' ? 'Listing Fees' : 
               activeTab === 'duration-settings' ? 'Duration Settings' : 
               'Boost Packages'}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[var(--sublimes-card-bg)]">
          <TabsTrigger value="base-fees">Base Listing Fees</TabsTrigger>
          <TabsTrigger value="duration-settings">Duration Settings</TabsTrigger>
          <TabsTrigger value="boost-packages">Boost Addons</TabsTrigger>
        </TabsList>

        <TabsContent value="base-fees" className="space-y-6">
          {/* Base Listing Fees */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {listingFees.map((fee) => (
              <SelectableRow
                key={fee.id}
                id={fee.id}
                isSelected={selectedItems.includes(fee.id)}
                onSelect={handleSelectItem}
              >
                <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="capitalize">{fee.category.replace('-', ' ')} Listings</CardTitle>
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
              </SelectableRow>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="duration-settings" className="space-y-6">
          {/* Duration Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {durationSettings.map((duration) => (
              <SelectableRow
                key={duration.id}
                id={duration.id}
                isSelected={selectedItems.includes(duration.id)}
                onSelect={handleSelectItem}
              >
                <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="capitalize">
                          {duration.category.replace('-', ' ')} - {duration.duration} Days
                        </CardTitle>
                        <Badge className={duration.type === 'trial' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}>
                          {duration.type === 'trial' ? 'Trial Pass' : 'Live Listing'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingDuration(duration)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteDuration(duration.id)}
                          className="text-red-500 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[var(--sublimes-gold)]">
                          {duration.duration} Days
                        </div>
                        <p className="text-sm text-gray-400 mt-2">{duration.description}</p>
                      </div>
                      
                      <div className="flex items-center justify-center">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          duration.active 
                            ? 'bg-green-500/10 text-green-500' 
                            : 'bg-gray-500/10 text-gray-500'
                        }`}>
                          {duration.active ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </SelectableRow>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="boost-packages" className="space-y-6">
          {/* Boost Packages */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boostPackages.map((pkg) => (
              <SelectableRow
                key={pkg.id}
                id={pkg.id}
                isSelected={selectedItems.includes(pkg.id)}
                onSelect={handleSelectItem}
              >
                <Card className={`relative ${!pkg.active ? 'opacity-60' : ''} bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]`}>
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
                            Popular
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingBoost(pkg)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteBoost(pkg.id)}
                          className="text-red-500 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-[var(--sublimes-light-text)]">{pkg.name}</h3>
                        <div className="flex items-center justify-center space-x-2 mt-2">
                          <span className="text-2xl font-bold text-[var(--sublimes-gold)]">AED {pkg.price}</span>
                          {pkg.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">AED {pkg.originalPrice}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">{pkg.duration} days boost</p>
                      </div>
                      
                      <div className="space-y-2">
                        {pkg.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-[var(--sublimes-gold)] rounded-full"></div>
                            <span className="text-sm text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-center">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          pkg.active 
                            ? 'bg-green-500/10 text-green-500' 
                            : 'bg-gray-500/10 text-gray-500'
                        }`}>
                          {pkg.active ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </SelectableRow>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create New Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-light-text)]">Create New Item</DialogTitle>
            <DialogDescription>
              Create a new duration setting or boost package
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Type</Label>
              <Select value={createType} onValueChange={(value: 'duration' | 'boost') => setCreateType(value)}>
                <SelectTrigger className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="duration">Duration Setting</SelectItem>
                  <SelectItem value="boost">Boost Package</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {createType === 'duration' ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select value={newDuration.category} onValueChange={(value: 'car' | 'car-parts' | 'garage') => setNewDuration(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="car">Car</SelectItem>
                        <SelectItem value="car-parts">Car Parts</SelectItem>
                        <SelectItem value="garage">Garage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select value={newDuration.type} onValueChange={(value: 'listing' | 'trial') => setNewDuration(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="listing">Live Listing</SelectItem>
                        <SelectItem value="trial">Trial Pass</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Duration (Days)</Label>
                  <Input
                    type="number"
                    value={newDuration.duration}
                    onChange={(e) => setNewDuration(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newDuration.description}
                    onChange={(e) => setNewDuration(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]"
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newDuration.active}
                    onCheckedChange={(checked) => setNewDuration(prev => ({ ...prev, active: checked }))}
                  />
                  <Label>Active</Label>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Package Name</Label>
                    <Input
                      value={newBoost.name}
                      onChange={(e) => setNewBoost(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., 7-Day Boost"
                      className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]"
                    />
                  </div>
                  <div>
                    <Label>Duration (Days)</Label>
                    <Input
                      type="number"
                      value={newBoost.duration}
                      onChange={(e) => setNewBoost(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Price (AED)</Label>
                    <Input
                      type="number"
                      value={newBoost.price}
                      onChange={(e) => setNewBoost(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                      className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]"
                    />
                  </div>
                  <div>
                    <Label>Original Price (AED) - Optional</Label>
                    <Input
                      type="number"
                      value={newBoost.originalPrice}
                      onChange={(e) => setNewBoost(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) }))}
                      className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]"
                    />
                  </div>
                </div>
                <div>
                  <Label>Features</Label>
                  <div className="space-y-2">
                    {newBoost.features?.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value, newBoost.features!, (features) => setNewBoost(prev => ({ ...prev, features })))}
                          placeholder="Enter feature"
                          className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFeature(index, newBoost.features!, (features) => setNewBoost(prev => ({ ...prev, features })))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addFeature(newBoost.features!, (features) => setNewBoost(prev => ({ ...prev, features })))}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Feature
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Badge Text (Optional)</Label>
                    <Input
                      value={newBoost.badge}
                      onChange={(e) => setNewBoost(prev => ({ ...prev, badge: e.target.value }))}
                      placeholder="e.g., Popular"
                      className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]"
                    />
                  </div>
                  <div>
                    <Label>Badge Color</Label>
                    <Select value={newBoost.badgeColor} onValueChange={(value) => setNewBoost(prev => ({ ...prev, badgeColor: value }))}>
                      <SelectTrigger className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blue">Blue</SelectItem>
                        <SelectItem value="green">Green</SelectItem>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="red">Red</SelectItem>
                        <SelectItem value="purple">Purple</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={newBoost.category} onValueChange={(value: 'car' | 'car-parts' | 'garage' | 'all') => setNewBoost(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="car">Car</SelectItem>
                      <SelectItem value="car-parts">Car Parts</SelectItem>
                      <SelectItem value="garage">Garage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newBoost.popular}
                      onCheckedChange={(checked) => setNewBoost(prev => ({ ...prev, popular: checked }))}
                    />
                    <Label>Popular</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newBoost.active}
                      onCheckedChange={(checked) => setNewBoost(prev => ({ ...prev, active: checked }))}
                    />
                    <Label>Active</Label>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={createType === 'duration' ? handleCreateDuration : handleCreateBoost}
                className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]"
              >
                <Save className="w-4 h-4 mr-2" />
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Fee Dialog */}
      {editingFee && (
        <Dialog open={!!editingFee} onOpenChange={() => setEditingFee(null)}>
          <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <DialogHeader>
              <DialogTitle className="text-[var(--sublimes-light-text)]">Edit Listing Fee</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Base Fee</Label>
                <Input
                  type="number"
                  value={editingFee.baseFee}
                  onChange={(e) => setEditingFee({ ...editingFee, baseFee: parseFloat(e.target.value) })}
                  className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editingFee.description}
                  onChange={(e) => setEditingFee({ ...editingFee, description: e.target.value })}
                  className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingFee.active}
                  onCheckedChange={(checked) => setEditingFee({ ...editingFee, active: checked })}
                />
                <Label>Active</Label>
              </div>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setEditingFee(null)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleUpdateFee(editingFee.id, editingFee)}
                  className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Duration Dialog */}
      {editingDuration && (
        <Dialog open={!!editingDuration} onOpenChange={() => setEditingDuration(null)}>
          <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <DialogHeader>
              <DialogTitle className="text-[var(--sublimes-light-text)]">Edit Duration Setting</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Duration (Days)</Label>
                <Input
                  type="number"
                  value={editingDuration.duration}
                  onChange={(e) => setEditingDuration({ ...editingDuration, duration: parseInt(e.target.value) })}
                  className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editingDuration.description}
                  onChange={(e) => setEditingDuration({ ...editingDuration, description: e.target.value })}
                  className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingDuration.active}
                  onCheckedChange={(checked) => setEditingDuration({ ...editingDuration, active: checked })}
                />
                <Label>Active</Label>
              </div>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setEditingDuration(null)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleUpdateDuration(editingDuration.id, editingDuration)}
                  className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Boost Dialog */}
      {editingBoost && (
        <Dialog open={!!editingBoost} onOpenChange={() => setEditingBoost(null)}>
          <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-[var(--sublimes-light-text)]">Edit Boost Package</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Package Name</Label>
                  <Input
                    value={editingBoost.name}
                    onChange={(e) => setEditingBoost({ ...editingBoost, name: e.target.value })}
                    className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]"
                  />
                </div>
                <div>
                  <Label>Duration (Days)</Label>
                  <Input
                    type="number"
                    value={editingBoost.duration}
                    onChange={(e) => setEditingBoost({ ...editingBoost, duration: parseInt(e.target.value) })}
                    className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price (AED)</Label>
                  <Input
                    type="number"
                    value={editingBoost.price}
                    onChange={(e) => setEditingBoost({ ...editingBoost, price: parseFloat(e.target.value) })}
                    className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]"
                  />
                </div>
                <div>
                  <Label>Original Price (AED)</Label>
                  <Input
                    type="number"
                    value={editingBoost.originalPrice || ''}
                    onChange={(e) => setEditingBoost({ ...editingBoost, originalPrice: parseFloat(e.target.value) })}
                    className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]"
                  />
                </div>
              </div>
              <div>
                <Label>Features</Label>
                <div className="space-y-2">
                  {editingBoost.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...editingBoost.features];
                          newFeatures[index] = e.target.value;
                          setEditingBoost({ ...editingBoost, features: newFeatures });
                        }}
                        className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newFeatures = editingBoost.features.filter((_, i) => i !== index);
                          setEditingBoost({ ...editingBoost, features: newFeatures });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingBoost({ ...editingBoost, features: [...editingBoost.features, ''] })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Feature
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Badge Text</Label>
                  <Input
                    value={editingBoost.badge || ''}
                    onChange={(e) => setEditingBoost({ ...editingBoost, badge: e.target.value })}
                    className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]"
                  />
                </div>
                <div>
                  <Label>Badge Color</Label>
                  <Select value={editingBoost.badgeColor} onValueChange={(value) => setEditingBoost({ ...editingBoost, badgeColor: value })}>
                    <SelectTrigger className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingBoost.popular}
                    onCheckedChange={(checked) => setEditingBoost({ ...editingBoost, popular: checked })}
                  />
                  <Label>Popular</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingBoost.active}
                    onCheckedChange={(checked) => setEditingBoost({ ...editingBoost, active: checked })}
                  />
                  <Label>Active</Label>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setEditingBoost(null)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    setBoostPackages(prev => prev.map(b => b.id === editingBoost.id ? { ...editingBoost, updatedAt: new Date().toISOString() } : b));
                    setEditingBoost(null);
                    toast.success('Boost package updated successfully');
                  }}
                  className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}