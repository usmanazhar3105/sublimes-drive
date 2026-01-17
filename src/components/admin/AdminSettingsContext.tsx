import { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';

interface AdminAutoApprovalSettings {
  garageVerifications: boolean;
  vehicleVerifications: boolean;
  marketplaceListings: boolean;
  communityPosts: boolean;
  bidRequests: boolean;
  events: boolean;
  offers: boolean;
  advertisements: boolean;
  userRegistrations: boolean;
  carPartListings: boolean;
  garageHubListings: boolean;
}

interface AdminSettingsContextType {
  autoApprovalSettings: AdminAutoApprovalSettings;
  updateAutoApproval: (category: keyof AdminAutoApprovalSettings, enabled: boolean) => void;
  isAutoApprovalEnabled: (category: keyof AdminAutoApprovalSettings) => boolean;
  getAutoApprovalStatus: () => AdminAutoApprovalSettings;
}

const defaultSettings: AdminAutoApprovalSettings = {
  garageVerifications: false,
  vehicleVerifications: false,
  marketplaceListings: false,
  communityPosts: false,
  bidRequests: false,
  events: false,
  offers: false,
  advertisements: false,
  userRegistrations: false,
  carPartListings: false,
  garageHubListings: false,
};

const AdminSettingsContext = createContext<AdminSettingsContextType | undefined>(undefined);

export function AdminSettingsProvider({ children }: { children: ReactNode }) {
  const [autoApprovalSettings, setAutoApprovalSettings] = useState<AdminAutoApprovalSettings>(defaultSettings);

  const updateAutoApproval = (category: keyof AdminAutoApprovalSettings, enabled: boolean) => {
    setAutoApprovalSettings(prev => ({
      ...prev,
      [category]: enabled
    }));

    const categoryNames: Record<keyof AdminAutoApprovalSettings, string> = {
      garageVerifications: 'Garage Verifications',
      vehicleVerifications: 'Vehicle Verifications',
      marketplaceListings: 'Marketplace Listings',
      communityPosts: 'Community Posts',
      bidRequests: 'Bid Requests',
      events: 'Events',
      offers: 'Offers & Coupons',
      advertisements: 'Advertisements',
      userRegistrations: 'User Registrations',
      carPartListings: 'Car Part Listings',
      garageHubListings: 'Garage Hub Listings',
    };

    if (enabled) {
      toast.success(`🤖 Auto-approval ENABLED for ${categoryNames[category]}`);
      console.log(`✅ AUTO-APPROVAL ENABLED: ${category}`);
    } else {
      toast.info(`👤 Manual approval restored for ${categoryNames[category]}`);
      console.log(`❌ AUTO-APPROVAL DISABLED: ${category}`);
    }
  };

  const isAutoApprovalEnabled = (category: keyof AdminAutoApprovalSettings): boolean => {
    return autoApprovalSettings[category];
  };

  const getAutoApprovalStatus = (): AdminAutoApprovalSettings => {
    return autoApprovalSettings;
  };

  return (
    <AdminSettingsContext.Provider value={{
      autoApprovalSettings,
      updateAutoApproval,
      isAutoApprovalEnabled,
      getAutoApprovalStatus
    }}>
      {children}
    </AdminSettingsContext.Provider>
  );
}

export function useAdminSettings() {
  const context = useContext(AdminSettingsContext);
  if (context === undefined) {
    throw new Error('useAdminSettings must be used within an AdminSettingsProvider');
  }
  return context;
}

// Auto approval utility functions
export const shouldAutoApprove = (
  category: keyof AdminAutoApprovalSettings,
  settings: AdminAutoApprovalSettings
): boolean => {
  return settings[category];
};

export const getAutoApprovalCategories = (): Array<{
  key: keyof AdminAutoApprovalSettings;
  label: string;
  description: string;
}> => [
  {
    key: 'garageVerifications',
    label: 'Garage Verifications',
    description: 'Automatically approve garage owner verification requests'
  },
  {
    key: 'vehicleVerifications',
    label: 'Vehicle Verifications',
    description: 'Automatically approve vehicle verification requests'
  },
  {
    key: 'marketplaceListings',
    label: 'Marketplace Listings',
    description: 'Automatically approve car listings in marketplace'
  },
  {
    key: 'communityPosts',
    label: 'Community Posts',
    description: 'Automatically approve community posts and discussions'
  },
  {
    key: 'bidRequests',
    label: 'Bid Requests',
    description: 'Automatically approve repair bid requests'
  },
  {
    key: 'events',
    label: 'Events',
    description: 'Automatically approve user-created events'
  },
  {
    key: 'offers',
    label: 'Offers & Coupons',
    description: 'Automatically approve offers and promotional content'
  },
  {
    key: 'advertisements',
    label: 'Advertisements',
    description: 'Automatically approve user-submitted advertisements'
  },
  {
    key: 'userRegistrations',
    label: 'User Registrations',
    description: 'Automatically approve new user registrations'
  },
  {
    key: 'carPartListings',
    label: 'Car Part Listings',
    description: 'Automatically approve car parts marketplace listings'
  },
  {
    key: 'garageHubListings',
    label: 'Garage Hub Listings',
    description: 'Automatically approve garage service listings'
  }
];