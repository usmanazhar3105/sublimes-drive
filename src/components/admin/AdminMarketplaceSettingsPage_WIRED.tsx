/**
 * AdminMarketplaceSettingsPage - WIRED to Supabase
 * 
 * WiringDoc (auto)
 * Entities: [marketplace_settings]
 * Reads: marketplace_settings (single row)
 * Writes: marketplace_settings UPDATE
 * RLS: admin_update_marketplace_settings (admin only)
 * Role UI: admin only
 * Telemetry: view:admin_marketplace_settings, action:update_marketplace_settings
 * Last Verified: 2025-01-31
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  DollarSign, 
  Clock, 
  Star,
  Zap,
  TrendingUp,
  Save,
  RefreshCw,
  CheckCircle,
  Loader2,
  Calendar,
  Percent,
  Gift
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase/client';

interface MarketplaceSettings {
  id: string;
  // Base listing fee
  base_listing_fee: number;
  listing_fee_enabled: boolean;
  listing_duration_days: number;
  
  // VAT
  vat_percentage: number;
  vat_enabled: boolean;
  
  // Boost pricing
  boost_7_days_price: number;
  boost_14_days_price: number;
  boost_30_days_price: number;
  
  // Free listing promotions
  free_listing_promotion: boolean;
  free_listing_start_date: string | null;
  free_listing_end_date: string | null;
  free_listing_message: string;
  
  // Featured carousel
  max_featured_listings: number;
  featured_auto_rotate: boolean;
  featured_rotation_seconds: number;
  
  // Overseas shipping
  overseas_shipping_enabled: boolean;
  overseas_shipping_fee: number;
  
  updated_at: string;
}

export function AdminMarketplaceSettingsPage_WIRED() {
  const [settings, setSettings] = useState<MarketplaceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('marketplace_settings')
        .select('*')
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('marketplace_settings')
        .update({
          base_listing_fee: settings.base_listing_fee,
          listing_fee_enabled: settings.listing_fee_enabled,
          listing_duration_days: settings.listing_duration_days,
          vat_percentage: settings.vat_percentage,
          vat_enabled: settings.vat_enabled,
          boost_7_days_price: settings.boost_7_days_price,
          boost_14_days_price: settings.boost_14_days_price,
          boost_30_days_price: settings.boost_30_days_price,
          free_listing_promotion: settings.free_listing_promotion,
          free_listing_start_date: settings.free_listing_start_date,
          free_listing_end_date: settings.free_listing_end_date,
          free_listing_message: settings.free_listing_message,
          max_featured_listings: settings.max_featured_listings,
          featured_auto_rotate: settings.featured_auto_rotate,
          featured_rotation_seconds: settings.featured_rotation_seconds,
          overseas_shipping_enabled: settings.overseas_shipping_enabled,
          overseas_shipping_fee: settings.overseas_shipping_fee,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id);

      if (error) throw error;

      toast.success('Settings saved successfully');
      
      // Track analytics
      await supabase.from('analytics_events').insert({
        event_type: 'admin_action',
        event_name: 'update_marketplace_settings',
        metadata: { settings_id: settings.id }
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const calculateTotalFee = () => {
    if (!settings) return '0.00';
    if (!settings.listing_fee_enabled) return '0.00 (FREE)';
    
    const base = settings.base_listing_fee;
    const vat = settings.vat_enabled ? base * (settings.vat_percentage / 100) : 0;
    return `${(base + vat).toFixed(2)} AED`;
  };

  const isPromotionActive = () => {
    if (!settings?.free_listing_promotion) return false;
    if (!settings.free_listing_start_date || !settings.free_listing_end_date) return false;
    
    const now = new Date();
    const start = new Date(settings.free_listing_start_date);
    const end = new Date(settings.free_listing_end_date);
    
    return now >= start && now <= end;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1426] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-[#0B1426] p-6">
        <Card className="bg-[#1A1F2E] border-[#2A3441] max-w-2xl mx-auto">
          <CardContent className="p-12 text-center">
            <p className="text-[#E8EAED]">No settings found. Please run migration 308.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1426]">
      {/* Header */}
      <div className="bg-[#1A1F2E] border-b border-[#2A3441]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl text-[#E8EAED] mb-2">Marketplace Settings</h1>
              <p className="text-sm text-[#8B92A7]">
                Configure listing fees, VAT, boost pricing, and promotions
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={fetchSettings}
                variant="outline"
                className="border-[#2A3441] text-[#E8EAED] hover:bg-[#2A3441]"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={saveSettings}
                disabled={saving}
                className="bg-[#D4AF37] text-[#0B1426] hover:bg-[#C4A037]"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-[#1A1F2E] border-[#2A3441]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8B92A7] mb-1">Current Listing Fee</p>
                  <p className="text-2xl text-[#D4AF37]">{calculateTotalFee()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-[#D4AF37]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1F2E] border-[#2A3441]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8B92A7] mb-1">Promotion Status</p>
                  <p className="text-2xl text-[#E8EAED]">
                    {isPromotionActive() ? (
                      <span className="text-green-500">Active</span>
                    ) : (
                      <span className="text-[#8B92A7]">Inactive</span>
                    )}
                  </p>
                </div>
                <Gift className={`w-8 h-8 ${isPromotionActive() ? 'text-green-500' : 'text-[#8B92A7]'}`} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1F2E] border-[#2A3441]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8B92A7] mb-1">Listing Duration</p>
                  <p className="text-2xl text-[#E8EAED]">{settings.listing_duration_days} days</p>
                </div>
                <Clock className="w-8 h-8 text-[#D4AF37]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="fees" className="space-y-6">
          <TabsList className="bg-[#1A1F2E] border border-[#2A3441] p-1">
            <TabsTrigger value="fees" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]">
              <DollarSign className="w-4 h-4 mr-2" />
              Listing Fees
            </TabsTrigger>
            <TabsTrigger value="boost" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]">
              <Zap className="w-4 h-4 mr-2" />
              Boost Pricing
            </TabsTrigger>
            <TabsTrigger value="promo" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]">
              <Gift className="w-4 h-4 mr-2" />
              Promotions
            </TabsTrigger>
            <TabsTrigger value="featured" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0B1426]">
              <Star className="w-4 h-4 mr-2" />
              Featured
            </TabsTrigger>
          </TabsList>

          {/* Listing Fees Tab */}
          <TabsContent value="fees">
            <Card className="bg-[#1A1F2E] border-[#2A3441]">
              <CardHeader>
                <CardTitle className="text-[#E8EAED]">Listing Fee Configuration</CardTitle>
                <CardDescription className="text-[#8B92A7]">
                  Set base listing fee, VAT, and duration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enable/Disable Fees */}
                <div className="flex items-center justify-between p-4 bg-[#0B1426] rounded-lg">
                  <div>
                    <Label className="text-[#E8EAED]">Enable Listing Fees</Label>
                    <p className="text-sm text-[#8B92A7] mt-1">
                      Toggle to make listings free or paid
                    </p>
                  </div>
                  <Switch
                    checked={settings.listing_fee_enabled}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, listing_fee_enabled: checked })
                    }
                  />
                </div>

                {/* Base Fee */}
                <div>
                  <Label className="text-[#E8EAED]">Base Listing Fee (AED)</Label>
                  <Input
                    type="number"
                    value={settings.base_listing_fee}
                    onChange={(e) => 
                      setSettings({ ...settings, base_listing_fee: parseFloat(e.target.value) || 0 })
                    }
                    className="bg-[#0B1426] border-[#2A3441] text-[#E8EAED] mt-2"
                    disabled={!settings.listing_fee_enabled}
                  />
                  <p className="text-xs text-[#8B92A7] mt-1">Default: 50 AED</p>
                </div>

                {/* VAT */}
                <div className="flex items-center justify-between p-4 bg-[#0B1426] rounded-lg">
                  <div className="flex-1 mr-4">
                    <Label className="text-[#E8EAED]">Enable VAT</Label>
                    <p className="text-sm text-[#8B92A7] mt-1">
                      Add VAT to listing fees
                    </p>
                  </div>
                  <Switch
                    checked={settings.vat_enabled}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, vat_enabled: checked })
                    }
                    disabled={!settings.listing_fee_enabled}
                  />
                </div>

                {settings.vat_enabled && (
                  <div>
                    <Label className="text-[#E8EAED]">VAT Percentage (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={settings.vat_percentage}
                      onChange={(e) => 
                        setSettings({ ...settings, vat_percentage: parseFloat(e.target.value) || 0 })
                      }
                      className="bg-[#0B1426] border-[#2A3441] text-[#E8EAED] mt-2"
                    />
                    <p className="text-xs text-[#8B92A7] mt-1">Default: 5%</p>
                  </div>
                )}

                {/* Duration */}
                <div>
                  <Label className="text-[#E8EAED]">Listing Duration (Days)</Label>
                  <Input
                    type="number"
                    value={settings.listing_duration_days}
                    onChange={(e) => 
                      setSettings({ ...settings, listing_duration_days: parseInt(e.target.value) || 30 })
                    }
                    className="bg-[#0B1426] border-[#2A3441] text-[#E8EAED] mt-2"
                  />
                  <p className="text-xs text-[#8B92A7] mt-1">How long listings stay active</p>
                </div>

                {/* Overseas Shipping Section */}
                <div className="space-y-4 p-4 border border-[#2A3441] rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[#E8EAED]">Overseas Shipping</Label>
                      <p className="text-sm text-[#8B92A7] mt-1">
                        Allow international shipping for listings
                      </p>
                    </div>
                    <Switch
                      checked={settings.overseas_shipping_enabled || false}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, overseas_shipping_enabled: checked })
                      }
                    />
                  </div>
                  
                  {settings.overseas_shipping_enabled && (
                    <div className="space-y-2">
                      <Label className="text-[#E8EAED]">Base Overseas Shipping Fee (AED)</Label>
                      <Input
                        type="number"
                        value={settings.overseas_shipping_fee || 0}
                        onChange={(e) => 
                          setSettings({ ...settings, overseas_shipping_fee: parseFloat(e.target.value) || 0 })
                        }
                        className="bg-[#0B1426] border-[#2A3441] text-[#E8EAED]"
                        placeholder="e.g., 100"
                      />
                      <p className="text-xs text-[#8B92A7]">Base fee for international shipping</p>
                    </div>
                  )}
                </div>

                {/* Total Calculation */}
                <div className="p-4 bg-[#D4AF37]/10 border border-[#D4AF37] rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#8B92A7]">Total Listing Price (incl. VAT)</p>
                      <p className="text-2xl text-[#D4AF37] mt-1">{calculateTotalFee()}</p>
                    </div>
                    <CheckCircle className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Boost Pricing Tab */}
          <TabsContent value="boost">
            <Card className="bg-[#1A1F2E] border-[#2A3441]">
              <CardHeader>
                <CardTitle className="text-[#E8EAED]">Boost Pricing Tiers</CardTitle>
                <CardDescription className="text-[#8B92A7]">
                  Set pricing for different boost durations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 7 Days */}
                  <div>
                    <Label className="text-[#E8EAED]">7 Days Boost (AED)</Label>
                    <Input
                      type="number"
                      value={settings.boost_7_days_price}
                      onChange={(e) => 
                        setSettings({ ...settings, boost_7_days_price: parseFloat(e.target.value) || 0 })
                      }
                      className="bg-[#0B1426] border-[#2A3441] text-[#E8EAED] mt-2"
                    />
                    <p className="text-xs text-[#8B92A7] mt-1">Default: 99 AED</p>
                  </div>

                  {/* 14 Days */}
                  <div>
                    <Label className="text-[#E8EAED]">14 Days Boost (AED)</Label>
                    <Input
                      type="number"
                      value={settings.boost_14_days_price}
                      onChange={(e) => 
                        setSettings({ ...settings, boost_14_days_price: parseFloat(e.target.value) || 0 })
                      }
                      className="bg-[#0B1426] border-[#2A3441] text-[#E8EAED] mt-2"
                    />
                    <p className="text-xs text-[#8B92A7] mt-1">Default: 179 AED</p>
                  </div>

                  {/* 30 Days */}
                  <div>
                    <Label className="text-[#E8EAED]">30 Days Boost (AED)</Label>
                    <Input
                      type="number"
                      value={settings.boost_30_days_price}
                      onChange={(e) => 
                        setSettings({ ...settings, boost_30_days_price: parseFloat(e.target.value) || 0 })
                      }
                      className="bg-[#0B1426] border-[#2A3441] text-[#E8EAED] mt-2"
                    />
                    <p className="text-xs text-[#8B92A7] mt-1">Default: 299 AED</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Promotions Tab */}
          <TabsContent value="promo">
            <Card className="bg-[#1A1F2E] border-[#2A3441]">
              <CardHeader>
                <CardTitle className="text-[#E8EAED]">Free Listing Promotions</CardTitle>
                <CardDescription className="text-[#8B92A7]">
                  Run time-limited free listing campaigns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enable Promotion */}
                <div className="flex items-center justify-between p-4 bg-[#0B1426] rounded-lg">
                  <div>
                    <Label className="text-[#E8EAED]">Enable Free Listing Promotion</Label>
                    <p className="text-sm text-[#8B92A7] mt-1">
                      Temporarily make all listings free
                    </p>
                  </div>
                  <Switch
                    checked={settings.free_listing_promotion}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, free_listing_promotion: checked })
                    }
                  />
                </div>

                {settings.free_listing_promotion && (
                  <>
                    {/* Start Date */}
                    <div>
                      <Label className="text-[#E8EAED]">Start Date</Label>
                      <Input
                        type="datetime-local"
                        value={settings.free_listing_start_date?.slice(0, 16) || ''}
                        onChange={(e) => 
                          setSettings({ ...settings, free_listing_start_date: new Date(e.target.value).toISOString() })
                        }
                        className="bg-[#0B1426] border-[#2A3441] text-[#E8EAED] mt-2"
                      />
                    </div>

                    {/* End Date */}
                    <div>
                      <Label className="text-[#E8EAED]">End Date</Label>
                      <Input
                        type="datetime-local"
                        value={settings.free_listing_end_date?.slice(0, 16) || ''}
                        onChange={(e) => 
                          setSettings({ ...settings, free_listing_end_date: new Date(e.target.value).toISOString() })
                        }
                        className="bg-[#0B1426] border-[#2A3441] text-[#E8EAED] mt-2"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <Label className="text-[#E8EAED]">Promotion Message</Label>
                      <Input
                        type="text"
                        value={settings.free_listing_message}
                        onChange={(e) => 
                          setSettings({ ...settings, free_listing_message: e.target.value })
                        }
                        className="bg-[#0B1426] border-[#2A3441] text-[#E8EAED] mt-2"
                        placeholder="Limited time: Free listings!"
                      />
                      <p className="text-xs text-[#8B92A7] mt-1">Shown to users during promotion</p>
                    </div>

                    {/* Status Badge */}
                    {isPromotionActive() && (
                      <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <p className="text-green-500">Promotion is currently ACTIVE</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Featured Tab */}
          <TabsContent value="featured">
            <Card className="bg-[#1A1F2E] border-[#2A3441]">
              <CardHeader>
                <CardTitle className="text-[#E8EAED]">Featured Carousel Settings</CardTitle>
                <CardDescription className="text-[#8B92A7]">
                  Configure the featured listings carousel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Max Featured */}
                <div>
                  <Label className="text-[#E8EAED]">Maximum Featured Listings</Label>
                  <Input
                    type="number"
                    value={settings.max_featured_listings}
                    onChange={(e) => 
                      setSettings({ ...settings, max_featured_listings: parseInt(e.target.value) || 10 })
                    }
                    className="bg-[#0B1426] border-[#2A3441] text-[#E8EAED] mt-2"
                  />
                  <p className="text-xs text-[#8B92A7] mt-1">Number of listings in carousel</p>
                </div>

                {/* Auto Rotate */}
                <div className="flex items-center justify-between p-4 bg-[#0B1426] rounded-lg">
                  <div>
                    <Label className="text-[#E8EAED]">Auto-Rotate Carousel</Label>
                    <p className="text-sm text-[#8B92A7] mt-1">
                      Automatically cycle through featured listings
                    </p>
                  </div>
                  <Switch
                    checked={settings.featured_auto_rotate}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, featured_auto_rotate: checked })
                    }
                  />
                </div>

                {settings.featured_auto_rotate && (
                  <div>
                    <Label className="text-[#E8EAED]">Rotation Speed (Seconds)</Label>
                    <Input
                      type="number"
                      value={settings.featured_rotation_seconds}
                      onChange={(e) => 
                        setSettings({ ...settings, featured_rotation_seconds: parseInt(e.target.value) || 5 })
                      }
                      className="bg-[#0B1426] border-[#2A3441] text-[#E8EAED] mt-2"
                    />
                    <p className="text-xs text-[#8B92A7] mt-1">How often to auto-rotate (default: 5)</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
