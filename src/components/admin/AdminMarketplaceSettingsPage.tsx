import { useState } from 'react';
import { 
  Settings, 
  DollarSign, 
  Clock, 
  Shield, 
  Star,
  Zap,
  Users,
  Globe,
  Mail,
  Bell,
  Lock,
  Eye,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { Switch } from '../ui/switch';
import { toast } from 'sonner';

export function AdminMarketplaceSettingsPage() {
  const [settings, setSettings] = useState({
    // Listing Settings
    autoApproval: false,
    maxListingDuration: 30,
    requireImageVerification: true,
    allowDuplicateListings: false,
    minListingPrice: 100,
    maxListingPrice: 1000000,
    
    // Commission & Fees
    commissionRate: 2.5,
    listingFee: 25,
    featuredBoostFee: 200,
    premiumBoostFee: 100,
    basicBoostFee: 50,
    
    // Approval Settings
    requireManualApproval: true,
    autoApproveVerifiedSellers: false,
    flagSuspiciousListings: true,
    maxPendingDays: 7,
    
    // User Settings
    allowAnonymousListings: false,
    requirePhoneVerification: true,
    requireEmailVerification: true,
    allowGuestViewing: true,
    
    // Security Settings
    enableImageWatermarks: true,
    blockSuspiciousIPs: true,
    enableRateLimiting: true,
    requireCaptcha: false,
    
    // Notification Settings
    notifyAdminsNewListings: true,
    notifySellerApproval: true,
    notifySellerRejection: true,
    emailWeeklyReports: true,
    
    // Display Settings
    defaultSortOrder: 'newest',
    itemsPerPage: 24,
    enableGridView: true,
    enableListView: true,
    showViewCounts: true,
    showSellerRatings: true
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setUnsavedChanges(true);
  };

  const saveSettings = () => {
    // In real app, this would call an API
    toast.success('✅ Marketplace settings saved successfully!');
    setUnsavedChanges(false);
    console.log('Marketplace settings saved:', settings);
  };

  const resetToDefaults = () => {
    const confirmed = window.confirm('Are you sure you want to reset all settings to default values? This action cannot be undone.');
    if (confirmed) {
      // Reset to default values
      setSettings({
        autoApproval: false,
        maxListingDuration: 30,
        requireImageVerification: true,
        allowDuplicateListings: false,
        minListingPrice: 100,
        maxListingPrice: 1000000,
        commissionRate: 2.5,
        listingFee: 25,
        featuredBoostFee: 200,
        premiumBoostFee: 100,
        basicBoostFee: 50,
        requireManualApproval: true,
        autoApproveVerifiedSellers: false,
        flagSuspiciousListings: true,
        maxPendingDays: 7,
        allowAnonymousListings: false,
        requirePhoneVerification: true,
        requireEmailVerification: true,
        allowGuestViewing: true,
        enableImageWatermarks: true,
        blockSuspiciousIPs: true,
        enableRateLimiting: true,
        requireCaptcha: false,
        notifyAdminsNewListings: true,
        notifySellerApproval: true,
        notifySellerRejection: true,
        emailWeeklyReports: true,
        defaultSortOrder: 'newest',
        itemsPerPage: 24,
        enableGridView: true,
        enableListView: true,
        showViewCounts: true,
        showSellerRatings: true
      });
      setUnsavedChanges(false);
      toast.info('🔄 Settings reset to default values');
    }
  };

  return (
    <div className="space-y-6">
      {/* Settings Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-2">
            Marketplace Settings
          </h2>
          <p className="text-gray-400">
            Configure marketplace behavior, fees, and policies
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {unsavedChanges && (
            <div className="flex items-center space-x-2 text-orange-500">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">Unsaved changes</span>
            </div>
          )}
          
          <button
            onClick={resetToDefaults}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset to Defaults</span>
          </button>
          
          <button
            onClick={saveSettings}
            className="flex items-center space-x-2 px-4 py-2 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] rounded-lg hover:bg-[var(--sublimes-gold)]/90 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* Listing Management Settings */}
      <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Settings className="w-5 h-5 text-[var(--sublimes-gold)]" />
          <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Listing Management</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-[var(--sublimes-light-text)]">Auto-Approval</label>
                <p className="text-sm text-gray-400">Automatically approve listings from verified sellers</p>
              </div>
              <Switch
                checked={settings.autoApproval}
                onCheckedChange={(checked) => handleSettingChange('autoApproval', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-[var(--sublimes-light-text)]">Require Image Verification</label>
                <p className="text-sm text-gray-400">Verify all uploaded images for quality and content</p>
              </div>
              <Switch
                checked={settings.requireImageVerification}
                onCheckedChange={(checked) => handleSettingChange('requireImageVerification', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-[var(--sublimes-light-text)]">Allow Duplicate Listings</label>
                <p className="text-sm text-gray-400">Allow sellers to create similar listings</p>
              </div>
              <Switch
                checked={settings.allowDuplicateListings}
                onCheckedChange={(checked) => handleSettingChange('allowDuplicateListings', checked)}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block font-medium text-[var(--sublimes-light-text)] mb-2">
                Max Listing Duration (days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={settings.maxListingDuration}
                onChange={(e) => handleSettingChange('maxListingDuration', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-[var(--sublimes-light-text)] mb-2">
                  Min Price (AED)
                </label>
                <input
                  type="number"
                  min="0"
                  value={settings.minListingPrice}
                  onChange={(e) => handleSettingChange('minListingPrice', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
                />
              </div>
              
              <div>
                <label className="block font-medium text-[var(--sublimes-light-text)] mb-2">
                  Max Price (AED)
                </label>
                <input
                  type="number"
                  min="0"
                  value={settings.maxListingPrice}
                  onChange={(e) => handleSettingChange('maxListingPrice', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Commission & Fees */}
      <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-6">
          <DollarSign className="w-5 h-5 text-green-500" />
          <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Commission & Fees</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block font-medium text-[var(--sublimes-light-text)] mb-2">
              Commission Rate (%)
            </label>
            <input
              type="number"
              min="0"
              max="20"
              step="0.1"
              value={settings.commissionRate}
              onChange={(e) => handleSettingChange('commissionRate', parseFloat(e.target.value))}
              className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
            />
          </div>
          
          <div>
            <label className="block font-medium text-[var(--sublimes-light-text)] mb-2">
              Listing Fee (AED)
            </label>
            <input
              type="number"
              min="0"
              value={settings.listingFee}
              onChange={(e) => handleSettingChange('listingFee', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
            />
          </div>
          
          <div>
            <label className="block font-medium text-[var(--sublimes-light-text)] mb-2">
              Featured Boost (AED)
            </label>
            <input
              type="number"
              min="0"
              value={settings.featuredBoostFee}
              onChange={(e) => handleSettingChange('featuredBoostFee', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
            />
          </div>
          
          <div>
            <label className="block font-medium text-[var(--sublimes-light-text)] mb-2">
              Premium Boost (AED)
            </label>
            <input
              type="number"
              min="0"
              value={settings.premiumBoostFee}
              onChange={(e) => handleSettingChange('premiumBoostFee', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
            />
          </div>
          
          <div>
            <label className="block font-medium text-[var(--sublimes-light-text)] mb-2">
              Basic Boost (AED)
            </label>
            <input
              type="number"
              min="0"
              value={settings.basicBoostFee}
              onChange={(e) => handleSettingChange('basicBoostFee', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
            />
          </div>
        </div>
      </div>

      {/* Security & Approval Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approval Settings */}
        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-6">
            <CheckCircle className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Approval Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-[var(--sublimes-light-text)]">Manual Approval Required</label>
                <p className="text-sm text-gray-400">All listings require manual admin approval</p>
              </div>
              <Switch
                checked={settings.requireManualApproval}
                onCheckedChange={(checked) => handleSettingChange('requireManualApproval', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-[var(--sublimes-light-text)]">Auto-approve Verified Sellers</label>
                <p className="text-sm text-gray-400">Skip approval for verified sellers</p>
              </div>
              <Switch
                checked={settings.autoApproveVerifiedSellers}
                onCheckedChange={(checked) => handleSettingChange('autoApproveVerifiedSellers', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-[var(--sublimes-light-text)]">Flag Suspicious Listings</label>
                <p className="text-sm text-gray-400">Automatically flag potentially problematic content</p>
              </div>
              <Switch
                checked={settings.flagSuspiciousListings}
                onCheckedChange={(checked) => handleSettingChange('flagSuspiciousListings', checked)}
              />
            </div>
            
            <div>
              <label className="block font-medium text-[var(--sublimes-light-text)] mb-2">
                Max Pending Days
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.maxPendingDays}
                onChange={(e) => handleSettingChange('maxPendingDays', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Shield className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Security Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-[var(--sublimes-light-text)]">Enable Image Watermarks</label>
                <p className="text-sm text-gray-400">Add watermarks to uploaded images</p>
              </div>
              <Switch
                checked={settings.enableImageWatermarks}
                onCheckedChange={(checked) => handleSettingChange('enableImageWatermarks', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-[var(--sublimes-light-text)]">Block Suspicious IPs</label>
                <p className="text-sm text-gray-400">Automatically block known malicious IP addresses</p>
              </div>
              <Switch
                checked={settings.blockSuspiciousIPs}
                onCheckedChange={(checked) => handleSettingChange('blockSuspiciousIPs', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-[var(--sublimes-light-text)]">Enable Rate Limiting</label>
                <p className="text-sm text-gray-400">Limit API requests to prevent abuse</p>
              </div>
              <Switch
                checked={settings.enableRateLimiting}
                onCheckedChange={(checked) => handleSettingChange('enableRateLimiting', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-[var(--sublimes-light-text)]">Require CAPTCHA</label>
                <p className="text-sm text-gray-400">Add CAPTCHA verification for new listings</p>
              </div>
              <Switch
                checked={settings.requireCaptcha}
                onCheckedChange={(checked) => handleSettingChange('requireCaptcha', checked)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* User & Display Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Settings */}
        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Users className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">User Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-[var(--sublimes-light-text)]">Allow Anonymous Listings</label>
                <p className="text-sm text-gray-400">Let users post without full verification</p>
              </div>
              <Switch
                checked={settings.allowAnonymousListings}
                onCheckedChange={(checked) => handleSettingChange('allowAnonymousListings', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-[var(--sublimes-light-text)]">Require Phone Verification</label>
                <p className="text-sm text-gray-400">Verify phone numbers for all users</p>
              </div>
              <Switch
                checked={settings.requirePhoneVerification}
                onCheckedChange={(checked) => handleSettingChange('requirePhoneVerification', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-[var(--sublimes-light-text)]">Require Email Verification</label>
                <p className="text-sm text-gray-400">Verify email addresses for all users</p>
              </div>
              <Switch
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => handleSettingChange('requireEmailVerification', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-[var(--sublimes-light-text)]">Allow Guest Viewing</label>
                <p className="text-sm text-gray-400">Let non-registered users browse listings</p>
              </div>
              <Switch
                checked={settings.allowGuestViewing}
                onCheckedChange={(checked) => handleSettingChange('allowGuestViewing', checked)}
              />
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Eye className="w-5 h-5 text-cyan-500" />
            <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Display Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block font-medium text-[var(--sublimes-light-text)] mb-2">
                Default Sort Order
              </label>
              <select
                value={settings.defaultSortOrder}
                onChange={(e) => handleSettingChange('defaultSortOrder', e.target.value)}
                className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_high">Price: High to Low</option>
                <option value="price_low">Price: Low to High</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
            
            <div>
              <label className="block font-medium text-[var(--sublimes-light-text)] mb-2">
                Items per Page
              </label>
              <select
                value={settings.itemsPerPage}
                onChange={(e) => handleSettingChange('itemsPerPage', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg text-[var(--sublimes-light-text)]"
              >
                <option value={12}>12 items</option>
                <option value={24}>24 items</option>
                <option value={48}>48 items</option>
                <option value={96}>96 items</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-[var(--sublimes-light-text)]">Show View Counts</label>
                <p className="text-sm text-gray-400">Display view counts on listings</p>
              </div>
              <Switch
                checked={settings.showViewCounts}
                onCheckedChange={(checked) => handleSettingChange('showViewCounts', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-[var(--sublimes-light-text)]">Show Seller Ratings</label>
                <p className="text-sm text-gray-400">Display seller ratings on listings</p>
              </div>
              <Switch
                checked={settings.showSellerRatings}
                onCheckedChange={(checked) => handleSettingChange('showSellerRatings', checked)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Bell className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Notification Settings</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-[var(--sublimes-light-text)]">Notify Admins - New Listings</label>
              <p className="text-sm text-gray-400">Alert admins when new listings are submitted</p>
            </div>
            <Switch
              checked={settings.notifyAdminsNewListings}
              onCheckedChange={(checked) => handleSettingChange('notifyAdminsNewListings', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-[var(--sublimes-light-text)]">Notify Seller - Approval</label>
              <p className="text-sm text-gray-400">Email sellers when listings are approved</p>
            </div>
            <Switch
              checked={settings.notifySellerApproval}
              onCheckedChange={(checked) => handleSettingChange('notifySellerApproval', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-[var(--sublimes-light-text)]">Notify Seller - Rejection</label>
              <p className="text-sm text-gray-400">Email sellers when listings are rejected</p>
            </div>
            <Switch
              checked={settings.notifySellerRejection}
              onCheckedChange={(checked) => handleSettingChange('notifySellerRejection', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-[var(--sublimes-light-text)]">Weekly Reports</label>
              <p className="text-sm text-gray-400">Send weekly analytics reports via email</p>
            </div>
            <Switch
              checked={settings.emailWeeklyReports}
              onCheckedChange={(checked) => handleSettingChange('emailWeeklyReports', checked)}
            />
          </div>
        </div>
      </div>

      {/* Settings Summary */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Info className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-bold text-blue-500">Settings Summary</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-[var(--sublimes-light-text)] font-medium mb-2">Current Configuration:</p>
            <ul className="space-y-1 text-gray-400">
              <li>• Auto-approval: {settings.autoApproval ? 'Enabled' : 'Disabled'}</li>
              <li>• Commission rate: {settings.commissionRate}%</li>
              <li>• Listing fee: AED {settings.listingFee}</li>
              <li>• Max duration: {settings.maxListingDuration} days</li>
            </ul>
          </div>
          
          <div>
            <p className="text-[var(--sublimes-light-text)] font-medium mb-2">Security Status:</p>
            <ul className="space-y-1 text-gray-400">
              <li>• Image verification: {settings.requireImageVerification ? 'Required' : 'Optional'}</li>
              <li>• Manual approval: {settings.requireManualApproval ? 'Required' : 'Automatic'}</li>
              <li>• Rate limiting: {settings.enableRateLimiting ? 'Enabled' : 'Disabled'}</li>
              <li>• CAPTCHA: {settings.requireCaptcha ? 'Required' : 'Optional'}</li>
            </ul>
          </div>
          
          <div>
            <p className="text-[var(--sublimes-light-text)] font-medium mb-2">User Experience:</p>
            <ul className="space-y-1 text-gray-400">
              <li>• Guest viewing: {settings.allowGuestViewing ? 'Allowed' : 'Restricted'}</li>
              <li>• Items per page: {settings.itemsPerPage}</li>
              <li>• Default sort: {settings.defaultSortOrder}</li>
              <li>• View counts: {settings.showViewCounts ? 'Visible' : 'Hidden'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}