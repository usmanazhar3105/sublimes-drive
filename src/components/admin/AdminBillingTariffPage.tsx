import { useState } from 'react';
import { 
  Car, 
  Settings, 
  Wrench, 
  Gift, 
  Zap, 
  Hammer,
  Save,
  Calendar,
  DollarSign,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'sonner';

interface ModuleConfig {
  id: string;
  name: string;
  icon: any;
  color: string;
  paymentRequired: boolean;
  price: number;
  duration: number;
  trial: number;
}

export function AdminBillingTariffPage() {
  const [modules, setModules] = useState<ModuleConfig[]>([
    {
      id: 'car-listings',
      name: 'Car Listings',
      icon: Car,
      color: 'text-red-500 bg-red-500/10',
      paymentRequired: true,
      price: 50,
      duration: 90,
      trial: 0
    },
    {
      id: 'parts-listings',
      name: 'Parts Listings',
      icon: Settings,
      color: 'text-blue-500 bg-blue-500/10',
      paymentRequired: true,
      price: 25,
      duration: 60,
      trial: 0
    },
    {
      id: 'garage-listings',
      name: 'Garage Listings',
      icon: Wrench,
      color: 'text-green-500 bg-green-500/10',
      paymentRequired: true,
      price: 100,
      duration: 365,
      trial: 0
    },
    {
      id: 'offers-module',
      name: 'Offers Module',
      icon: Gift,
      color: 'text-orange-500 bg-orange-500/10',
      paymentRequired: true,
      price: 30,
      duration: 30,
      trial: 0
    },
    {
      id: 'boost-listings',
      name: 'Boost Listings',
      icon: Zap,
      color: 'text-yellow-500 bg-yellow-500/10',
      paymentRequired: true,
      price: 25,
      duration: 7,
      trial: 0
    },
    {
      id: 'repair-bids',
      name: 'Repair Bids',
      icon: Hammer,
      color: 'text-purple-500 bg-purple-500/10',
      paymentRequired: true,
      price: 2,
      duration: 1,
      trial: 0
    }
  ]);

  const paidModules = modules.filter(m => m.paymentRequired).length;

  const updateModule = (id: string, field: keyof ModuleConfig, value: any) => {
    setModules(prev => prev.map(module => 
      module.id === id ? { ...module, [field]: value } : module
    ));
  };

  const saveSettings = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (module) {
      console.log('Saving settings for:', module.name, module);
      toast.success(`Settings saved for ${module.name}`);
    }
  };

  const togglePaymentRequired = (id: string) => {
    updateModule(id, 'paymentRequired', !modules.find(m => m.id === id)?.paymentRequired);
  };

  return (
    <div className="p-6 bg-[var(--sublimes-dark-bg)]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)]">Billing & Tariff Management</h1>
            <p className="text-gray-400 mt-1">Configure payment settings for each module.</p>
          </div>
          <div className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg px-4 py-2">
            <span className="text-[var(--sublimes-light-text)] font-medium">
              {paidModules} / {modules.length} Paid Modules
            </span>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const IconComponent = module.icon;
          return (
            <div
              key={module.id}
              className="bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${module.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-[var(--sublimes-light-text)]">{module.name}</h3>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  module.paymentRequired 
                    ? 'bg-green-500/10 text-green-500' 
                    : 'bg-gray-500/10 text-gray-500'
                }`}>
                  {module.paymentRequired ? 'Payment Required' : 'Free'}
                </div>
              </div>

              {/* Payment Toggle */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--sublimes-light-text)] font-medium">Require Payment</span>
                  <button
                    onClick={() => togglePaymentRequired(module.id)}
                    className="relative"
                  >
                    {module.paymentRequired ? (
                      <div className="w-12 h-6 bg-green-500 rounded-full flex items-center justify-end pr-1">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    ) : (
                      <div className="w-12 h-6 bg-gray-600 rounded-full flex items-center justify-start pl-1">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Price Input */}
              <div className="mb-4">
                <label className="flex items-center space-x-2 text-[var(--sublimes-light-text)] font-medium mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Price (AED)</span>
                </label>
                <Input
                  type="number"
                  value={module.price}
                  onChange={(e) => updateModule(module.id, 'price', parseInt(e.target.value) || 0)}
                  className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] text-right"
                  disabled={!module.paymentRequired}
                />
              </div>

              {/* Duration Input */}
              <div className="mb-4">
                <label className="flex items-center space-x-2 text-[var(--sublimes-light-text)] font-medium mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>Duration (Days)</span>
                </label>
                <Input
                  type="number"
                  value={module.duration}
                  onChange={(e) => updateModule(module.id, 'duration', parseInt(e.target.value) || 0)}
                  className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] text-right"
                  disabled={!module.paymentRequired}
                />
              </div>

              {/* Trial Input */}
              <div className="mb-6">
                <label className="flex items-center space-x-2 text-[var(--sublimes-light-text)] font-medium mb-2">
                  <Gift className="w-4 h-4" />
                  <span>Trial (Days)</span>
                </label>
                <Input
                  type="number"
                  value={module.trial}
                  onChange={(e) => updateModule(module.id, 'trial', parseInt(e.target.value) || 0)}
                  className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] text-right"
                  disabled={!module.paymentRequired}
                />
              </div>

              {/* Save Button */}
              <Button
                onClick={() => saveSettings(module.id)}
                className="w-full bg-white text-[var(--sublimes-dark-bg)] hover:bg-gray-100 font-medium"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </div>
          );
        })}
      </div>

      {/* Global Settings */}
      <div className="mt-8 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-xl p-6">
        <h2 className="text-xl font-bold text-[var(--sublimes-light-text)] mb-6">Global Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-[var(--sublimes-light-text)] font-medium mb-2">
              Default Currency
            </label>
            <select className="w-full bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg px-3 py-2 text-[var(--sublimes-light-text)] focus:ring-2 focus:ring-[var(--sublimes-gold)]">
              <option value="AED">AED (United Arab Emirates Dirham)</option>
              <option value="USD">USD (US Dollar)</option>
              <option value="EUR">EUR (Euro)</option>
            </select>
          </div>

          <div>
            <label className="block text-[var(--sublimes-light-text)] font-medium mb-2">
              Payment Processing Fee (%)
            </label>
            <Input
              type="number"
              defaultValue="2.9"
              step="0.1"
              className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
            />
          </div>

          <div>
            <label className="block text-[var(--sublimes-light-text)] font-medium mb-2">
              Auto-Approval Threshold (AED)
            </label>
            <Input
              type="number"
              defaultValue="100"
              className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button
            onClick={() => toast.success('Global settings saved successfully')}
            className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/90 font-medium px-6"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Global Settings
          </Button>
        </div>
      </div>
    </div>
  );
}