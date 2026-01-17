import { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Download, 
  Search,
  MoreVertical,
  Eye,
  Edit,
  Star,
  BarChart3,
  Trash2,
  Image as ImageIcon,
  Tag as TagIcon,
  Users,
  Copy,
  Mail,
  CheckCircle,
  XCircle,
  Save,
  Grid3X3,
  List,
  TrendingUp,
  DollarSign,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { EmailTemplateManager } from './EmailTemplateManager';
import { CreateOfferModalUpgraded } from './CreateOfferModalUpgraded';
import { BoostPlansModal } from '../ui/BoostPlansModal';
import { toast } from 'sonner';
interface Offer {
  id: string;
  title: string;
  description: string;
  category: string;
  originalPrice: number;
  offerPrice: number;
  discountPercentage: number;
  validFrom: Date;
  validUntil: Date;
  availability: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
    weekends: boolean;
    publicHolidays: boolean;
  };
  categories: string[];
  images: string[];
  maxRedemptions: number;
  currentRedemptions: number;
  isActive: boolean;
  isFeatured: boolean;
  isBoosted: boolean;
  boostType?: string;
  boostExpiresAt?: Date;
  boostPriority?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PurchasedOffer {
  id: string;
  offerId: string;
  userId: string;
  userEmail: string;
  userName: string;
  offerTitle: string;
  amount: number;
  purchaseCode: string;
  purchaseDate: Date;
  isRedeemed: boolean;
  redeemedDate?: Date;
  paymentIntentId: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  variables: string[];
  type: 'offer_purchase' | 'general_purchase' | 'redemption_confirmation';
}

export function AdminOffersPageFixed() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [currentTab, setCurrentTab] = useState('all');
  const [isCreateOfferOpen, setIsCreateOfferOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isEmailTemplateOpen, setIsEmailTemplateOpen] = useState(false);
  const [isViewOfferOpen, setIsViewOfferOpen] = useState(false);
  const [isEditOfferOpen, setIsEditOfferOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  const [boostType, setBoostType] = useState<'single' | 'bulk'>('single');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    if (activeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeDropdown]);

  // Form states for creating/editing offers
  const [offerForm, setOfferForm] = useState({
    title: '',
    description: '',
    originalPrice: '',
    offerPrice: '',
    validFrom: '',
    validUntil: '',
    category: '',
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true,
      weekends: true,
      publicHolidays: false,
    },
    categories: [] as string[],
    images: [] as string[],
    maxRedemptions: '',
  });

  // Load offers from localStorage, merge with default offers
  const loadOffersFromStorage = () => {
    try {
      const stored = localStorage.getItem('sublimes_offers');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading offers from storage:', error);
    }
    return [];
  };

  const defaultOffers: Offer[] = [
    {
      id: '1',
      title: '50% OFF Premium Car Wash & Detail',
      description: 'Professional exterior and interior car wash with wax and vacuum service. Premium quality products used.',
      category: 'Detailing',
      originalPrice: 100,
      offerPrice: 50,
      discountPercentage: 50,
      validFrom: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      validUntil: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      availability: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: false,
        weekends: false,
        publicHolidays: false,
      },
      categories: ['Detailing', 'Car Wash', 'Waxing'],
      images: ['https://example.com/wash1.jpg'],
      maxRedemptions: 100,
      currentRedemptions: 23,
      isActive: true,
      isFeatured: true,
      isBoosted: true,
      boostType: 'Featured Deal',
      boostExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      boostPriority: 1,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      title: 'Oil Change & Filter Replacement',
      description: 'Complete oil change service with premium engine oil and genuine filter replacement for all car brands.',
      category: 'Maintenance',
      originalPrice: 150,
      offerPrice: 100,
      discountPercentage: 33,
      validFrom: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      validUntil: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      availability: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
        weekends: true,
        publicHolidays: false,
      },
      categories: ['Oil Change', 'Maintenance', 'Engine Service'],
      images: ['https://example.com/oil1.jpg'],
      maxRedemptions: 50,
      currentRedemptions: 8,
      isActive: true,
      isFeatured: false,
      isBoosted: false,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  ];

  // State for offers - combine default offers with stored ones
  const [offers, setOffers] = useState<Offer[]>(() => {
    const storedOffers = loadOffersFromStorage();
    // Merge default offers with stored ones, avoiding duplicates
    const combinedOffers = [...defaultOffers];
    storedOffers.forEach((stored: Offer) => {
      if (!combinedOffers.find(offer => offer.id === stored.id)) {
        combinedOffers.push(stored);
      }
    });
    return combinedOffers;
  });

  // Save offers to localStorage whenever offers change
  const saveOffersToStorage = (offersToSave: Offer[]) => {
    try {
      // Only save non-default offers (those created by admin)
      const customOffers = offersToSave.filter(offer => 
        !defaultOffers.find(defaultOffer => defaultOffer.id === offer.id)
      );
      localStorage.setItem('sublimes_offers', JSON.stringify(customOffers));
    } catch (error) {
      console.error('Error saving offers to storage:', error);
    }
  };

  const purchasedOffers: PurchasedOffer[] = [
    {
      id: '1',
      offerId: '1',
      userId: 'user123',
      userEmail: 'ahmed@example.com',
      userName: 'Ahmed Al Mansouri',
      offerTitle: '50% OFF Premium Car Wash & Detail',
      amount: 50,
      purchaseCode: 'SUB-WASH-2024-001234',
      purchaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      isRedeemed: false,
      paymentIntentId: 'pi_1234567890',
    },
    {
      id: '2',
      offerId: '2',
      userId: 'user456',
      userEmail: 'sara@example.com',
      userName: 'Sara Abdullah',
      offerTitle: 'Oil Change & Filter Replacement',
      amount: 100,
      purchaseCode: 'SUB-OIL-2024-001235',
      purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      isRedeemed: true,
      redeemedDate: new Date(),
      paymentIntentId: 'pi_1234567891',
    },
  ];

  const serviceCategories = [
    'Oil Change',
    'AC Service', 
    'Suspension',
    'Glass Service',
    'Tyres',
    'Brake Service',
    'Electrical',
    'Interior Cleaning',
    'Detailing',
    'Engine Service',
    'Bodywork',
    'Waxing',
    'Battery',
    'Transmission',
    'Paint Service',
    'Polishing',
  ];

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = searchQuery === '' || 
      offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || offer.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' ||
      (selectedStatus === 'Active' && offer.isActive) ||
      (selectedStatus === 'Inactive' && !offer.isActive) ||
      (selectedStatus === 'Featured' && offer.isFeatured) ||
      (selectedStatus === 'Expired' && offer.validUntil < new Date());

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const generateUniqueCode = (prefix: string = 'SUB') => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  };

  const handleCreateOffer = (offerData: any) => {
    try {
      // Generate unique ID for the new offer
      const newOffer: Offer = {
        id: `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...offerData,
        images: [], // Handle images properly in a real implementation
        currentRedemptions: 0,
        isActive: true,
        isFeatured: false,
        isBoosted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Add the new offer to the offers list
      setOffers(prevOffers => [newOffer, ...prevOffers]);
      
      toast.success('✅ Offer created successfully and added to the list!');
      console.log('New offer created:', newOffer);
      
      // You can add logic here to save the offer to your backend/database
    } catch (error) {
      console.error('Error creating offer:', error);
      toast.error('Failed to create offer. Please try again.');
    }
  };

  const handleToggleCategory = (category: string) => {
    setOfferForm(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  // Boosting Functions
  const handleSelectOffer = (offerId: string) => {
    setSelectedOffers(prev => 
      prev.includes(offerId) 
        ? prev.filter(id => id !== offerId)
        : [...prev, offerId]
    );
  };

  const handleSelectAllOffers = () => {
    const allOfferIds = filteredOffers.map(offer => offer.id);
    setSelectedOffers(prev => 
      prev.length === allOfferIds.length ? [] : allOfferIds
    );
  };

  const handleBoostOffer = (offerId: string, boostData: any) => {
    // Add boost to AdminBoostManagementPage under offers tab
    const offer = offers.find(o => o.id === offerId);
    if (!offer) {
      toast.error('Offer not found!');
      return false;
    }

    const boostEntry = {
      id: `boost_offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      listingId: offerId,
      listingTitle: offer.title,
      listingType: 'offer' as const,
      userId: 'admin',
      userName: 'Admin',
      userEmail: 'admin@sublimesdrive.com',
      userType: 'car_owner' as const, // Changed to match the interface
      boostPackage: boostData.packageType || 'Featured Deal',
      boostDuration: boostData.duration || 7,
      boostPrice: 0, // Admin boosts are free
      boostType: boostData.type || 'Featured Deal',
      status: 'active' as const,
      adminStatus: 'featured' as const,
      placement: 'all' as const,
      startDate: new Date(),
      endDate: new Date(Date.now() + ((boostData.duration || 7) * 24 * 60 * 60 * 1000)),
      createdAt: new Date(),
      approvedAt: new Date(),
      featuredAt: new Date(),
      impressions: 0,
      clicks: 0,
      conversions: 0,
      adminNotes: `Admin boost: ${boostData.type || 'Featured Deal'}`,
      paymentReference: `ADMIN_BOOST_${Date.now()}`,
      paymentStatus: 'paid' as const,
      priority: boostData.priority || 3
    };

    try {
      // Store boost entry for AdminBoostManagementPage
      const existingBoosts = JSON.parse(localStorage.getItem('adminOfferBoosts') || '[]');
      existingBoosts.push(boostEntry);
      localStorage.setItem('adminOfferBoosts', JSON.stringify(existingBoosts));

      // Update the offer state to reflect boost status
      setOffers(prevOffers => 
        prevOffers.map(o => 
          o.id === offerId 
            ? { 
                ...o, 
                isBoosted: true,
                boostType: boostData.type || 'Featured Deal',
                boostExpiresAt: new Date(Date.now() + ((boostData.duration || 7) * 24 * 60 * 60 * 1000)),
                boostPriority: boostData.priority || 3,
                updatedAt: new Date()
              }
            : o
        )
      );

      toast.success(`✅ Offer "${offer.title}" boosted successfully! View in Admin > Boost Management > Offers tab.`);
      return true;
    } catch (error) {
      console.error('Error saving boost:', error);
      toast.error('Failed to save boost. Please try again.');
      return false;
    }
  };

  const handleBulkBoost = (boostData: any) => {
    if (selectedOffers.length === 0) {
      toast.error('Please select offers to boost');
      return false;
    }

    let successCount = 0;
    selectedOffers.forEach(offerId => {
      const success = handleBoostOffer(offerId, boostData);
      if (success) successCount++;
    });

    if (successCount > 0) {
      toast.success(`✅ Successfully boosted ${successCount} offers! View all in Admin > Boost Management > Offers tab.`);
      setSelectedOffers([]);
      return true;
    } else {
      toast.error('Failed to boost any offers. Please try again.');
      return false;
    }
  };

  const copyPurchaseCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Purchase code copied to clipboard');
  };

  const sendEmailToUser = (purchase: PurchasedOffer) => {
    toast.success(`Email sent to ${purchase.userEmail}`);
  };

  const handleViewOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    setIsViewOfferOpen(true);
  };

  const handleEditOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    // Populate form with existing data
    setOfferForm({
      title: offer.title,
      description: offer.description,
      originalPrice: offer.originalPrice.toString(),
      offerPrice: offer.offerPrice.toString(),
      validFrom: offer.validFrom.toISOString().slice(0, 16),
      validUntil: offer.validUntil.toISOString().slice(0, 16),
      category: offer.category,
      availability: offer.availability,
      categories: offer.categories,
      images: offer.images,
      maxRedemptions: offer.maxRedemptions.toString(),
    });
    setIsEditOfferOpen(true);
  };

  const handleAnalytics = (offer: Offer) => {
    setSelectedOffer(offer);
    setIsAnalyticsOpen(true);
  };

  const handleDeleteOffer = (offer: Offer) => {
    if (window.confirm(`Are you sure you want to delete "${offer.title}"?`)) {
      setOffers(prevOffers => prevOffers.filter(o => o.id !== offer.id));
      toast.success('Offer deleted successfully');
    }
  };

  const handleToggleStatus = (offer: Offer) => {
    setOffers(prevOffers => 
      prevOffers.map(o => 
        o.id === offer.id 
          ? { ...o, isActive: !o.isActive, updatedAt: new Date() }
          : o
      )
    );
    toast.success(`Offer ${offer.isActive ? 'deactivated' : 'activated'}`);
  };

  const handleToggleFeatured = (offer: Offer) => {
    setOffers(prevOffers => 
      prevOffers.map(o => 
        o.id === offer.id 
          ? { ...o, isFeatured: !o.isFeatured, updatedAt: new Date() }
          : o
      )
    );
    toast.success(`Offer ${offer.isFeatured ? 'removed from featured' : 'marked as featured'}`);
  };

  const handleDuplicate = (offer: Offer) => {
    setOfferForm({
      title: `${offer.title} (Copy)`,
      description: offer.description,
      originalPrice: offer.originalPrice.toString(),
      offerPrice: offer.offerPrice.toString(),
      validFrom: '',
      validUntil: '',
      category: offer.category,
      availability: offer.availability,
      categories: offer.categories,
      images: offer.images,
      maxRedemptions: offer.maxRedemptions.toString(),
    });
    setIsCreateOfferOpen(true);
  };

  const handleRenewOffer = (offer: Offer) => {
    const newEndDate = window.prompt(
      `Renew offer "${offer.title}"?\n\nCurrent end date: ${offer.validUntil.toLocaleDateString()}\n\nEnter number of days to extend:`,
      '30'
    );
    
    if (newEndDate && !isNaN(parseInt(newEndDate))) {
      const daysToAdd = parseInt(newEndDate);
      const newValidUntil = new Date(offer.validUntil.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
      
      toast.success(`✅ Offer "${offer.title}" renewed successfully!\nNew end date: ${newValidUntil.toLocaleDateString()}`);
      console.log(`Offer ${offer.id} renewed by ${daysToAdd} days. New end date: ${newValidUntil.toISOString()}`);
    }
  };

  const renderOfferCard = (offer: Offer) => {
    const daysLeft = Math.ceil((offer.validUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const redemptionPercentage = (offer.currentRedemptions / offer.maxRedemptions) * 100;

    if (viewMode === 'list') {
      return (
        <Card key={offer.id} className={`${offer.isFeatured ? 'ring-2 ring-[var(--sublimes-gold)]' : ''} mb-4`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6 flex-1">
                <Checkbox 
                  checked={selectedOffers.includes(offer.id)}
                  onCheckedChange={() => handleSelectOffer(offer.id)}
                />
                <div className="w-16 h-16 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-bold text-[var(--sublimes-gold)]">
                      {offer.discountPercentage}%
                    </div>
                    <div className="text-xs text-gray-400">OFF</div>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-bold text-[var(--sublimes-light-text)]">{offer.title}</h3>
                    {offer.isFeatured && (
                      <Badge className="bg-[var(--sublimes-gold)] text-black">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[var(--sublimes-gold)]">
                      {offer.category}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{offer.description}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-lg font-bold text-[var(--sublimes-light-text)]">
                      AED {offer.offerPrice}
                    </span>
                    <span className="text-gray-400 line-through">
                      AED {offer.originalPrice}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${offer.isActive ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                    <span className={`text-sm font-medium ${offer.isActive ? 'text-green-500' : 'text-gray-500'}`}>
                      {offer.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className={`text-sm ${daysLeft > 7 ? 'text-gray-400' : 'text-red-500'}`}>
                      {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-gray-400 mb-1">Redemptions</div>
                  <div className="text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                    {offer.currentRedemptions}/{offer.maxRedemptions}
                  </div>
                  <div className="w-24 bg-gray-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${redemptionPercentage > 80 ? 'bg-red-500' : 'bg-[var(--sublimes-gold)]'}`}
                      style={{ width: `${redemptionPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-6">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-500 hover:bg-blue-500/10"
                  onClick={() => handleViewOffer(offer)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-orange-500 hover:bg-orange-500/10"
                  onClick={() => handleEditOffer(offer)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-green-500 hover:bg-green-500/10"
                  onClick={() => handleAnalytics(offer)}
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setActiveDropdown(activeDropdown === offer.id ? null : offer.id)}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                  {activeDropdown === offer.id && (
                    <div className="absolute right-0 top-8 w-48 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg shadow-lg z-[9999]">
                      <div className="py-2">
                        <button
                          onClick={() => {
                            handleViewOffer(offer);
                            setActiveDropdown(null);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-blue-500 hover:bg-blue-500/10 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Details</span>
                        </button>
                        <button
                          onClick={() => {
                            handleEditOffer(offer);
                            setActiveDropdown(null);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-orange-500 hover:bg-orange-500/10 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit Offer</span>
                        </button>
                        <button
                          onClick={() => {
                            handleAnalytics(offer);
                            setActiveDropdown(null);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-green-500 hover:bg-green-500/10 transition-colors"
                        >
                          <BarChart3 className="w-4 h-4" />
                          <span>Analytics</span>
                        </button>
                        <button
                          onClick={() => {
                            handleToggleFeatured(offer);
                            setActiveDropdown(null);
                          }}
                          className={`w-full flex items-center space-x-2 px-4 py-2 transition-colors ${
                            offer.isFeatured 
                              ? 'text-yellow-500 hover:bg-yellow-500/10' 
                              : 'text-gray-500 hover:bg-gray-500/10'
                          }`}
                        >
                          <Star className="w-4 h-4" />
                          <span>{offer.isFeatured ? 'Remove Featured' : 'Mark Featured'}</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOffer(offer);
                            setBoostType('single');
                            setIsBoostModalOpen(true);
                            setActiveDropdown(null);
                          }}
                          className={`w-full flex items-center space-x-2 px-4 py-2 transition-colors ${
                            offer.isBoosted 
                              ? 'text-[var(--sublimes-gold)] hover:bg-[var(--sublimes-gold)]/10' 
                              : 'text-purple-500 hover:bg-purple-500/10'
                          }`}
                        >
                          <Zap className="w-4 h-4" />
                          <span>{offer.isBoosted ? 'Manage Boost' : 'Boost Offer'}</span>
                        </button>
                        <button
                          onClick={() => {
                            handleDeleteOffer(offer);
                            setActiveDropdown(null);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card key={offer.id} className={`${offer.isFeatured ? 'ring-2 ring-[var(--sublimes-gold)]' : ''}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3 flex-1">
              <Checkbox 
                checked={selectedOffers.includes(offer.id)}
                onCheckedChange={() => handleSelectOffer(offer.id)}
                className="mt-1"
              />
              <div className="flex-1">
                <h3 className="font-bold text-[var(--sublimes-light-text)] mb-1">{offer.title}</h3>
                <p className="text-[var(--sublimes-gold)] text-sm font-medium">{offer.category}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {offer.isFeatured && (
                <Badge className="bg-[var(--sublimes-gold)] text-black">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setActiveDropdown(activeDropdown === offer.id ? null : offer.id)}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
                {activeDropdown === offer.id && (
                  <div className="absolute right-0 top-8 w-48 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      <button
                        onClick={() => {
                          handleViewOffer(offer);
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-blue-500 hover:bg-blue-500/10 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                      <button
                        onClick={() => {
                          handleEditOffer(offer);
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-orange-500 hover:bg-orange-500/10 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit Offer</span>
                      </button>
                      <button
                        onClick={() => {
                          handleAnalytics(offer);
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-green-500 hover:bg-green-500/10 transition-colors"
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span>Analytics</span>
                      </button>
                      <button
                        onClick={() => {
                          handleToggleFeatured(offer);
                          setActiveDropdown(null);
                        }}
                        className={`w-full flex items-center space-x-2 px-4 py-2 transition-colors ${
                          offer.isFeatured 
                            ? 'text-yellow-500 hover:bg-yellow-500/10' 
                            : 'text-gray-500 hover:bg-gray-500/10'
                        }`}
                      >
                        <Star className="w-4 h-4" />
                        <span>{offer.isFeatured ? 'Remove Featured' : 'Mark Featured'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOffer(offer);
                          setBoostType('single');
                          setIsBoostModalOpen(true);
                          setActiveDropdown(null);
                        }}
                        className={`w-full flex items-center space-x-2 px-4 py-2 transition-colors ${
                          offer.isBoosted 
                            ? 'text-[var(--sublimes-gold)] hover:bg-[var(--sublimes-gold)]/10' 
                            : 'text-purple-500 hover:bg-purple-500/10'
                        }`}
                      >
                        <Zap className="w-4 h-4" />
                        <span>{offer.isBoosted ? 'Manage Boost' : 'Boost Offer'}</span>
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteOffer(offer);
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] rounded-lg p-8 mb-4 relative">
            <div className="text-center">
              <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-[var(--sublimes-gold)] mb-1">
                {offer.discountPercentage}% OFF
              </div>
              <div className="text-sm text-gray-400">Offer Visual</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 mb-4">
            <span className="text-xl font-bold text-[var(--sublimes-light-text)]">
              AED {offer.offerPrice}
            </span>
            <span className="text-gray-400 line-through">
              AED {offer.originalPrice}
            </span>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Redemptions</span>
              <span className="text-sm font-medium text-[var(--sublimes-light-text)]">
                {offer.currentRedemptions}/{offer.maxRedemptions}
              </span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${redemptionPercentage > 80 ? 'bg-red-500' : 'bg-[var(--sublimes-gold)]'}`}
                style={{ width: `${redemptionPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${offer.isActive ? 'bg-green-500' : 'bg-gray-500'}`}></div>
              <span className={`text-sm font-medium ${offer.isActive ? 'text-green-500' : 'text-gray-500'}`}>
                {offer.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <span className={`text-sm ${daysLeft > 7 ? 'text-gray-400' : 'text-red-500'}`}>
              {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
            </span>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-500 hover:bg-blue-500/10"
                onClick={() => handleViewOffer(offer)}
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-orange-500 hover:bg-orange-500/10"
                onClick={() => handleEditOffer(offer)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-green-500 hover:bg-green-500/10"
                onClick={() => handleAnalytics(offer)}
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Stats
              </Button>
            </div>
            
            <div className="grid grid-cols-4 gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-purple-500 hover:bg-purple-500/10 text-xs"
                onClick={() => handleDuplicate(offer)}
              >
                <Copy className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`text-xs ${offer.isFeatured ? 'text-yellow-500 hover:bg-yellow-500/10' : 'text-gray-500 hover:bg-gray-500/10'}`}
                onClick={() => handleToggleFeatured(offer)}
              >
                <Star className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`text-xs ${offer.isActive ? 'text-red-500 hover:bg-red-500/10' : 'text-green-500 hover:bg-green-500/10'}`}
                onClick={() => handleToggleStatus(offer)}
              >
                {offer.isActive ? <XCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:bg-red-500/10 text-xs"
                onClick={() => handleDeleteOffer(offer)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAnalyticsContent = () => (
    <div className="space-y-6">
      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <TagIcon className="w-6 h-6 text-blue-500" />
              </div>
              <Badge variant="secondary">Live</Badge>
            </div>
            <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">{offers.length}</p>
            <p className="text-sm text-gray-400">Total Offers</p>
            <div className="flex items-center space-x-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500">+12%</span>
              <span className="text-sm text-gray-400">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-500" />
              </div>
              <Badge variant="secondary">Live</Badge>
            </div>
            <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">
              {offers.filter(o => o.isActive).length}
            </p>
            <p className="text-sm text-gray-400">Active Offers</p>
            <div className="flex items-center space-x-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500">+5%</span>
              <span className="text-sm text-gray-400">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[var(--sublimes-gold)]/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-[var(--sublimes-gold)]" />
              </div>
              <Badge variant="secondary">Live</Badge>
            </div>
            <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">
              {offers.reduce((sum, o) => sum + o.currentRedemptions, 0)}
            </p>
            <p className="text-sm text-gray-400">Total Redemptions</p>
            <div className="flex items-center space-x-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500">+23%</span>
              <span className="text-sm text-gray-400">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-500" />
              </div>
              <Badge variant="secondary">Live</Badge>
            </div>
            <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">
              AED {purchasedOffers.reduce((sum, p) => sum + p.amount, 0)}
            </p>
            <p className="text-sm text-gray-400">Total Revenue</p>
            <div className="flex items-center space-x-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500">+18%</span>
              <span className="text-sm text-gray-400">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-[var(--sublimes-light-text)]">Offers Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {offers.map((offer) => {
                const redemptionRate = (offer.currentRedemptions / offer.maxRedemptions) * 100;
                return (
                  <div key={offer.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-[var(--sublimes-light-text)]">
                        {offer.title}
                      </span>
                      <span className="text-sm text-gray-400">
                        {redemptionRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-[var(--sublimes-gold)]"
                        style={{ width: `${redemptionRate}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[var(--sublimes-light-text)]">Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Detailing', 'Maintenance', 'Repair', 'Parts'].map((category, index) => {
                const categoryOffers = offers.filter(o => o.category === category);
                const percentage = (categoryOffers.length / offers.length) * 100;
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
                
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-[var(--sublimes-light-text)]">
                        {category}
                      </span>
                      <span className="text-sm text-gray-400">
                        {categoryOffers.length} offers ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${colors[index]}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[var(--sublimes-light-text)]">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {purchasedOffers.slice(0, 5).map((purchase) => (
              <div key={purchase.id} className="flex items-center justify-between p-3 bg-[var(--sublimes-card-bg)] rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                    <Target className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--sublimes-light-text)]">
                      {purchase.userName} purchased "{purchase.offerTitle}"
                    </p>
                    <p className="text-xs text-gray-400">
                      {purchase.purchaseDate.toLocaleDateString()} • AED {purchase.amount}
                    </p>
                  </div>
                </div>
                <Badge variant={purchase.isRedeemed ? "default" : "secondary"}>
                  {purchase.isRedeemed ? "Redeemed" : "Pending"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderEmailTemplatesContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-[var(--sublimes-light-text)]">Email Templates</h3>
          <p className="text-sm text-gray-400">Manage automated email templates for offer purchases and notifications</p>
        </div>
        <Button 
          onClick={() => setIsEmailTemplateOpen(true)}
          className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      <EmailTemplateManager />
    </div>
  );

  return (
    <div className="p-6 bg-[var(--sublimes-dark-bg)]">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)]">Offers & Coupons Management</h1>
            <p className="text-gray-400 mt-1">Create and manage service offers for car enthusiasts</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setIsCreateOfferOpen(true)}
              className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Offer
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEmailTemplateOpen(true)}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email Templates
            </Button>
          </div>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Offers</TabsTrigger>
            <TabsTrigger value="purchased">Purchased Offers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="templates">Email Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search offers by title, category, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Detailing">Detailing</SelectItem>
                  <SelectItem value="Repair">Repair</SelectItem>
                  <SelectItem value="Parts">Parts</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Featured">Featured</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <TagIcon className="w-6 h-6 text-blue-500" />
                    </div>
                    <Badge variant="secondary">Live</Badge>
                  </div>
                  <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">{offers.length}</p>
                  <p className="text-sm text-gray-400">Total Offers</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <Eye className="w-6 h-6 text-green-500" />
                    </div>
                    <Badge variant="secondary">Live</Badge>
                  </div>
                  <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">
                    {offers.filter(o => o.isActive).length}
                  </p>
                  <p className="text-sm text-gray-400">Active Offers</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-[var(--sublimes-gold)]/10 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-[var(--sublimes-gold)]" />
                    </div>
                    <Badge variant="secondary">Live</Badge>
                  </div>
                  <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">
                    {offers.reduce((sum, o) => sum + o.currentRedemptions, 0)}
                  </p>
                  <p className="text-sm text-gray-400">Total Redemptions</p>
                </CardContent>
              </Card>
            </div>

            {/* Bulk Actions Bar */}
            {selectedOffers.length > 0 && (
              <div className="mb-6 p-4 bg-[var(--sublimes-gold)]/10 border border-[var(--sublimes-gold)]/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Checkbox 
                      checked={selectedOffers.length === filteredOffers.length}
                      onCheckedChange={handleSelectAllOffers}
                    />
                    <span className="text-sm text-[var(--sublimes-light-text)]">
                      {selectedOffers.length} offer(s) selected
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => {
                        setBoostType('bulk');
                        setIsBoostModalOpen(true);
                      }}
                      className="bg-purple-600 text-white hover:bg-purple-700"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Bulk Boost Selected ({selectedOffers.length})
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedOffers([])}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Select All Actions Bar */}
            {filteredOffers.length > 0 && selectedOffers.length === 0 && (
              <div className="mb-6 p-4 bg-[var(--sublimes-card-bg)] border border-[var(--sublimes-border)] rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        checked={selectedOffers.length === filteredOffers.length}
                        onCheckedChange={handleSelectAllOffers}
                      />
                      <span className="text-[var(--sublimes-light-text)]">
                        {selectedOffers.length} of {filteredOffers.length} offers selected
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBoostType('bulk');
                        setIsBoostModalOpen(true);
                      }}
                      className="bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Bulk Boost ({selectedOffers.length})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOffers([])}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {filteredOffers.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <TagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[var(--sublimes-light-text)] mb-2">No offers found</h3>
                  <p className="text-gray-400">Try adjusting your search criteria or create a new offer.</p>
                </div>
              ) : (
                filteredOffers.map(renderOfferCard)
              )}
            </div>
          </TabsContent>

          <TabsContent value="purchased">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-500" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">{purchasedOffers.length}</p>
                    <p className="text-sm text-gray-400">Total Purchases</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">
                      {purchasedOffers.filter(p => p.isRedeemed).length}
                    </p>
                    <p className="text-sm text-gray-400">Redeemed</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-[var(--sublimes-gold)]/10 rounded-lg flex items-center justify-center">
                        <TagIcon className="w-6 h-6 text-[var(--sublimes-gold)]" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">
                      AED {purchasedOffers.reduce((sum, p) => sum + p.amount, 0)}
                    </p>
                    <p className="text-sm text-gray-400">Total Revenue</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                {purchasedOffers.map((purchase) => (
                  <Card key={purchase.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h3 className="font-semibold text-[var(--sublimes-light-text)]">{purchase.offerTitle}</h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                                <span>{purchase.userName}</span>
                                <span>{purchase.userEmail}</span>
                                <span>{purchase.purchaseDate.toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="font-bold text-[var(--sublimes-gold)]">AED {purchase.amount}</div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge 
                                variant={purchase.isRedeemed ? "default" : "secondary"}
                                className={purchase.isRedeemed ? "bg-green-500" : "bg-orange-500"}
                              >
                                {purchase.isRedeemed ? "Redeemed" : "Pending"}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-xs text-gray-400 mb-1">Purchase Code</div>
                            <div className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] px-3 py-1 rounded font-mono text-sm">
                              {purchase.purchaseCode}
                            </div>
                          </div>
                          
                          <div className="flex flex-col space-y-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyPurchaseCode(purchase.purchaseCode)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => sendEmailToUser(purchase)}
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            {renderAnalyticsContent()}
          </TabsContent>

          <TabsContent value="templates">
            {renderEmailTemplatesContent()}
          </TabsContent>
          
        </Tabs>
      </div>

      {/* Email Template Modal */}
      <Dialog open={isEmailTemplateOpen} onOpenChange={setIsEmailTemplateOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-gold)]">Email Template Manager</DialogTitle>
            <DialogDescription>
              Create and manage automated email templates for offer purchases and notifications.
            </DialogDescription>
          </DialogHeader>
          
          <div className="h-[70vh] overflow-y-auto">
            <EmailTemplateManager />
          </div>
        </DialogContent>
      </Dialog>

      {/* Create New Offer Modal - Upgraded */}
      <CreateOfferModalUpgraded
        isOpen={isCreateOfferOpen}
        onClose={() => setIsCreateOfferOpen(false)}
        onCreateOffer={handleCreateOffer}
      />

      {/* View Offer Modal */}
      <Dialog open={isViewOfferOpen} onOpenChange={setIsViewOfferOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-gold)]">View Offer Details</DialogTitle>
            <DialogDescription>
              View the complete details and settings of this promotional offer.
            </DialogDescription>
          </DialogHeader>
          
          {selectedOffer && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-[var(--sublimes-light-text)]">{selectedOffer.title}</h3>
                    <p className="text-gray-400 mt-2">{selectedOffer.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">Original Price</label>
                      <p className="text-lg font-semibold">AED {selectedOffer.originalPrice}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Offer Price</label>
                      <p className="text-lg font-semibold text-[var(--sublimes-gold)]">AED {selectedOffer.offerPrice}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Categories</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedOffer.categories.map((cat, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">Valid From</label>
                      <p className="text-sm">{selectedOffer.validFrom.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Valid Until</label>
                      <p className="text-sm">{selectedOffer.validUntil.toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">Redemptions</label>
                      <p className="text-sm">{selectedOffer.currentRedemptions} / {selectedOffer.maxRedemptions}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Status</label>
                      <div className="flex items-center space-x-2">
                        <Badge variant={selectedOffer.isActive ? "default" : "secondary"}>
                          {selectedOffer.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {selectedOffer.isFeatured && (
                          <Badge className="bg-[var(--sublimes-gold)] text-black">Featured</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setIsViewOfferOpen(false)}>
                  Close
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewOfferOpen(false);
                    handleEditOffer(selectedOffer);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Offer
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewOfferOpen(false);
                    handleAnalytics(selectedOffer);
                  }}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Offer Modal */}
      <Dialog open={isEditOfferOpen} onOpenChange={setIsEditOfferOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-gold)]">Edit Offer</DialogTitle>
            <DialogDescription>
              Modify the details of this promotional offer. Update any fields as needed.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-[var(--sublimes-light-text)] mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                    Offer Title *
                  </label>
                  <Input
                    placeholder="e.g., 50% OFF Premium Car Wash & Detail"
                    value={offerForm.title}
                    onChange={(e) => setOfferForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                    Category *
                  </label>
                  <Select value={offerForm.category} onValueChange={(value) => setOfferForm(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Detailing">Detailing</SelectItem>
                      <SelectItem value="Repair">Repair</SelectItem>
                      <SelectItem value="Parts">Parts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                  Description *
                </label>
                <Textarea
                  rows={3}
                  placeholder="Describe your offer in detail..."
                  value={offerForm.description}
                  onChange={(e) => setOfferForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-[var(--sublimes-light-text)] mb-4">Pricing & Discount</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                    Original Price (AED) *
                  </label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={offerForm.originalPrice}
                    onChange={(e) => setOfferForm(prev => ({ ...prev, originalPrice: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                    Offer Price (AED) *
                  </label>
                  <Input
                    type="number"
                    placeholder="50"
                    value={offerForm.offerPrice}
                    onChange={(e) => setOfferForm(prev => ({ ...prev, offerPrice: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                    Discount
                  </label>
                  <Input
                    placeholder="Auto-calculated"
                    disabled
                    value={
                      offerForm.originalPrice && offerForm.offerPrice
                        ? `${Math.round(((parseInt(offerForm.originalPrice) - parseInt(offerForm.offerPrice)) / parseInt(offerForm.originalPrice)) * 100)}%`
                        : 'Enter prices'
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsEditOfferOpen(false);
                  setSelectedOffer(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/90"
                onClick={() => {
                  toast.success('Offer updated successfully!');
                  setIsEditOfferOpen(false);
                  setSelectedOffer(null);
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Update Offer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Analytics Modal */}
      <Dialog open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-gold)]">
              Offer Analytics: {selectedOffer?.title}
            </DialogTitle>
            <DialogDescription>
              View detailed analytics and performance metrics for this promotional offer.
            </DialogDescription>
          </DialogHeader>
          
          {selectedOffer && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-[var(--sublimes-gold)]">
                      {selectedOffer.currentRedemptions}
                    </div>
                    <div className="text-sm text-gray-400">Total Redemptions</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-[var(--sublimes-gold)]">
                      {Math.round((selectedOffer.currentRedemptions / selectedOffer.maxRedemptions) * 100)}%
                    </div>
                    <div className="text-sm text-gray-400">Redemption Rate</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-[var(--sublimes-gold)]">
                      AED {selectedOffer.currentRedemptions * selectedOffer.offerPrice}
                    </div>
                    <div className="text-sm text-gray-400">Revenue Generated</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-[var(--sublimes-gold)]">
                      {Math.ceil((selectedOffer.validUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
                    </div>
                    <div className="text-sm text-gray-400">Days Remaining</div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h4 className="font-medium text-[var(--sublimes-light-text)] mb-4">Purchase History</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {purchasedOffers
                    .filter(p => p.offerId === selectedOffer.id)
                    .map((purchase) => (
                      <div key={purchase.id} className="flex items-center justify-between p-3 bg-[var(--sublimes-card-bg)] rounded">
                        <div>
                          <div className="font-medium text-sm">{purchase.userName}</div>
                          <div className="text-xs text-gray-400">{purchase.userEmail}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-[var(--sublimes-gold)]">AED {purchase.amount}</div>
                          <div className="text-xs text-gray-400">{purchase.purchaseDate.toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setIsAnalyticsOpen(false)}>
                  Close
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Boost Plans Modal */}
      <BoostPlansModal
        isOpen={isBoostModalOpen}
        onClose={() => {
          setIsBoostModalOpen(false);
          setSelectedOffer(null);
          setBoostType('single');
        }}
        entityType="offer"
        onSelectPlan={(plan) => {
          const boostData = {
            packageType: plan.name,
            type: plan.name,
            duration: plan.duration,
            price: 0, // Admin boosts are free
            priority: plan.popular ? 1 : 3
          };
          
          if (boostType === 'bulk') {
            handleBulkBoost(boostData);
            setIsBoostModalOpen(false);
          } else if (selectedOffer) {
            const success = handleBoostOffer(selectedOffer.id, boostData);
            if (success) {
              setIsBoostModalOpen(false);
              setSelectedOffer(null);
              setBoostType('single');
            }
          } else {
            toast.error('No offer selected for boosting');
            setIsBoostModalOpen(false);
          }
        }}
      />
    </div>
  );
}