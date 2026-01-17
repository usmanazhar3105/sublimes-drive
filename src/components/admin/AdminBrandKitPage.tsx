import { useState, useEffect } from 'react';
import { 
  Palette, 
  Image, 
  Type, 
  Download,
  Upload,
  Copy,
  Save,
  Edit3,
  Plus,
  Globe,
  Settings,
  Check,
  Layout,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Loader2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { BannerManager } from './BannerManager';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase/client';

interface BrandColor {
  name: string;
  hex: string;
  rgb: string;
  usage: string;
}

interface BrandColors {
  [key: string]: BrandColor;
}

interface Typography {
  fontFamily: string;
  headingWeights: {
    h1: string;
    h2: string;
    h3: string;
    h4: string;
  };
  sizes: {
    h1: string;
    h2: string;
    h3: string;
    h4: string;
    body: string;
    small: string;
  };
}

interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  facebook: string;
  instagram: string;
  twitter: string;
}

export function AdminBrandKitPage() {
  const [selectedTab, setSelectedTab] = useState('banners');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit modals
  const [editColorModal, setEditColorModal] = useState<{ open: boolean; colorKey: string | null }>({ open: false, colorKey: null });
  const [editTypographyModal, setEditTypographyModal] = useState(false);
  const [editContactModal, setEditContactModal] = useState(false);

  // Default brand colors
  const defaultBrandColors: BrandColors = {
    primary: {
      name: 'Sublimes Gold',
      hex: '#D4AF37',
      rgb: 'rgb(212, 175, 55)',
      usage: 'Primary actions, highlights, branding'
    },
    dark: {
      name: 'Sublimes Dark',
      hex: '#0B1426',
      rgb: 'rgb(11, 20, 38)',
      usage: 'Background, dark theme base'
    },
    light: {
      name: 'Sublimes Light',
      hex: '#E8EAED',
      rgb: 'rgb(232, 234, 237)',
      usage: 'Text, light theme elements'
    },
    card: {
      name: 'Card Background',
      hex: '#1A2332',
      rgb: 'rgb(26, 35, 50)',
      usage: 'Card backgrounds, containers'
    },
    border: {
      name: 'Border Color',
      hex: '#2A3441',
      rgb: 'rgb(42, 52, 65)',
      usage: 'Borders, dividers'
    },
    blue: {
      name: 'Gradient Blue',
      hex: '#4A5FC1',
      rgb: 'rgb(74, 95, 193)',
      usage: 'Gradients, secondary actions'
    }
  };

  const defaultTypography: Typography = {
    fontFamily: 'Inter, sans-serif',
    headingWeights: {
      h1: '700',
      h2: '600',
      h3: '600',
      h4: '500'
    },
    sizes: {
      h1: '2rem',
      h2: '1.5rem',
      h3: '1.25rem',
      h4: '1rem',
      body: '0.875rem',
      small: '0.75rem'
    }
  };

  const defaultContactInfo: ContactInfo = {
    email: 'info@sublimesdrive.com',
    phone: '+971 50 123 4567',
    address: 'Dubai, UAE',
    facebook: 'https://www.facebook.com/Sublimesdrive/',
    instagram: '',
    twitter: ''
  };

  // State
  const [brandColors, setBrandColors] = useState<BrandColors>(defaultBrandColors);
  const [typography, setTypography] = useState<Typography>(defaultTypography);
  const [contactInfo, setContactInfo] = useState<ContactInfo>(defaultContactInfo);
  const [editingColor, setEditingColor] = useState<BrandColor | null>(null);

  // Localization settings
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸', status: 'Complete', completion: 100 },
    { code: 'ar', name: 'العربية', flag: '🇦🇪', status: 'In Progress', completion: 85 },
    { code: 'zh', name: '中文', flag: '🇨🇳', status: 'Complete', completion: 100 },
    { code: 'ur', name: 'اردو', flag: '🇵🇰', status: 'Planned', completion: 0 },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', status: 'Planned', completion: 0 }
  ];

  useEffect(() => {
    loadBrandSettings();
  }, []);

  const loadBrandSettings = async () => {
    try {
      setLoading(true);

      // Load from KV store
      const { data: { user } } = await supabase.auth.getUser();
      
      // Try to fetch brand settings from database
      const { data: colorsData } = await supabase
        .from('kv_store_97527403')
        .select('value')
        .eq('key', 'brand_colors')
        .single();

      const { data: typographyData } = await supabase
        .from('kv_store_97527403')
        .select('value')
        .eq('key', 'brand_typography')
        .single();

      const { data: contactData } = await supabase
        .from('kv_store_97527403')
        .select('value')
        .eq('key', 'brand_contact_info')
        .single();

      if (colorsData?.value) {
        setBrandColors(JSON.parse(colorsData.value));
      }
      if (typographyData?.value) {
        setTypography(JSON.parse(typographyData.value));
      }
      if (contactData?.value) {
        setContactInfo(JSON.parse(contactData.value));
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading brand settings:', error);
      setLoading(false);
    }
  };

  const saveBrandColors = async (colors: BrandColors) => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('kv_store_97527403')
        .upsert({
          key: 'brand_colors',
          value: JSON.stringify(colors),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setBrandColors(colors);
      toast.success('Brand colors saved successfully');
    } catch (error: any) {
      console.error('Error saving brand colors:', error);
      toast.error('Failed to save brand colors');
    } finally {
      setSaving(false);
    }
  };

  const saveTypography = async (typo: Typography) => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('kv_store_97527403')
        .upsert({
          key: 'brand_typography',
          value: JSON.stringify(typo),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setTypography(typo);
      toast.success('Typography settings saved successfully');
    } catch (error: any) {
      console.error('Error saving typography:', error);
      toast.error('Failed to save typography');
    } finally {
      setSaving(false);
    }
  };

  const saveContactInfo = async (info: ContactInfo) => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('kv_store_97527403')
        .upsert({
          key: 'brand_contact_info',
          value: JSON.stringify(info),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setContactInfo(info);
      toast.success('Contact information saved successfully');
    } catch (error: any) {
      console.error('Error saving contact info:', error);
      toast.error('Failed to save contact information');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    const { copyToClipboard: safeCopy } = await import('../../utils/clipboard');
    const success = await safeCopy(text);
    if (success) {
      setCopiedColor(type);
      setTimeout(() => setCopiedColor(null), 2000);
    }
  };

  const handleEditColor = (colorKey: string) => {
    setEditingColor({ ...brandColors[colorKey] });
    setEditColorModal({ open: true, colorKey });
  };

  const handleSaveColor = async () => {
    if (!editColorModal.colorKey || !editingColor) return;

    const updatedColors = {
      ...brandColors,
      [editColorModal.colorKey]: editingColor
    };

    await saveBrandColors(updatedColors);
    setEditColorModal({ open: false, colorKey: null });
    setEditingColor(null);
  };

  const ColorCard = ({ name, color }: { name: string; color: BrandColor }) => (
    <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Color Preview */}
          <div 
            className="h-20 rounded-lg border border-[var(--sublimes-border)]"
            style={{ backgroundColor: color.hex }}
          />
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-[var(--sublimes-light-text)]">{color.name}</h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEditColor(name)}
                className="h-6 w-6 p-0"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs text-gray-400 mb-3">{color.usage}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">HEX</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-[var(--sublimes-light-text)]">{color.hex}</span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="p-1 h-6 w-6"
                  onClick={() => copyToClipboard(color.hex, `${name}-hex`)}
                >
                  {copiedColor === `${name}-hex` ? 
                    <Check className="h-3 w-3 text-green-500" /> : 
                    <Copy className="h-3 w-3" />
                  }
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">RGB</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-[var(--sublimes-light-text)]">{color.rgb}</span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="p-1 h-6 w-6"
                  onClick={() => copyToClipboard(color.rgb, `${name}-rgb`)}
                >
                  {copiedColor === `${name}-rgb` ? 
                    <Check className="h-3 w-3 text-green-500" /> : 
                    <Copy className="h-3 w-3" />
                  }
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderColorsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Brand Colors</h3>
          <p className="text-gray-400">Official color palette and usage guidelines (Editable)</p>
        </div>
        <Button className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]">
          <Download className="w-4 h-4 mr-2" />
          Download Palette
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(brandColors).map(([key, color]) => (
          <ColorCard key={key} name={key} color={color} />
        ))}
      </div>

      {/* Contact Info Section */}
      <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-[var(--sublimes-light-text)]">Contact Information</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditContactModal(true)}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-[var(--sublimes-light-text)]">
              <Mail className="h-5 w-5 text-[var(--sublimes-gold)]" />
              <span>{contactInfo.email}</span>
            </div>
            <div className="flex items-center space-x-3 text-[var(--sublimes-light-text)]">
              <Phone className="h-5 w-5 text-[var(--sublimes-gold)]" />
              <span>{contactInfo.phone}</span>
            </div>
            <div className="flex items-center space-x-3 text-[var(--sublimes-light-text)]">
              <MapPin className="h-5 w-5 text-[var(--sublimes-gold)]" />
              <span>{contactInfo.address}</span>
            </div>
            {contactInfo.facebook && (
              <div className="flex items-center space-x-3 text-[var(--sublimes-light-text)]">
                <Facebook className="h-5 w-5 text-[var(--sublimes-gold)]" />
                <a href={contactInfo.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--sublimes-gold)]">
                  {contactInfo.facebook}
                </a>
              </div>
            )}
            {contactInfo.instagram && (
              <div className="flex items-center space-x-3 text-[var(--sublimes-light-text)]">
                <Instagram className="h-5 w-5 text-[var(--sublimes-gold)]" />
                <a href={contactInfo.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--sublimes-gold)]">
                  {contactInfo.instagram}
                </a>
              </div>
            )}
            {contactInfo.twitter && (
              <div className="flex items-center space-x-3 text-[var(--sublimes-light-text)]">
                <Twitter className="h-5 w-5 text-[var(--sublimes-gold)]" />
                <a href={contactInfo.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--sublimes-gold)]">
                  {contactInfo.twitter}
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTypographyTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Typography</h3>
          <p className="text-gray-400">Font settings and text hierarchy (Editable)</p>
        </div>
        <Button
          onClick={() => setEditTypographyModal(true)}
          className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]"
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Edit Typography
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Font Settings */}
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--sublimes-light-text)]">Font Family</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-[var(--sublimes-dark-bg)] rounded-lg border border-[var(--sublimes-border)]">
                <div className="text-sm text-gray-400 mb-2">Current Font</div>
                <div className="text-[var(--sublimes-light-text)]">{typography.fontFamily}</div>
              </div>
              <div className="p-4 bg-[var(--sublimes-dark-bg)] rounded-lg border border-[var(--sublimes-border)]">
                <div className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-2" style={{ fontFamily: typography.fontFamily }}>
                  Sublimes Drive
                </div>
                <div className="text-sm text-gray-400" style={{ fontFamily: typography.fontFamily }}>
                  The quick brown fox jumps over the lazy dog
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography Scale */}
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--sublimes-light-text)]">Typography Scale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(typography.sizes).map(([element, size]) => (
                <div key={element} className="flex items-center justify-between">
                  <div>
                    <div 
                      className="text-[var(--sublimes-light-text)]"
                      style={{ 
                        fontSize: size,
                        fontWeight: typography.headingWeights[element as keyof typeof typography.headingWeights] || '400'
                      }}
                    >
                      {element.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-400">{size}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderLocalizationTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Localization</h3>
          <p className="text-gray-400">Manage languages and regional settings</p>
        </div>
        <Button className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]">
          <Plus className="w-4 h-4 mr-2" />
          Add Language
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {languages.map((lang, index) => (
          <Card key={index} className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <div>
                    <CardTitle className="text-sm text-[var(--sublimes-light-text)]">{lang.name}</CardTitle>
                    <div className="text-xs text-gray-400">{lang.code.toUpperCase()}</div>
                  </div>
                </div>
                <Badge 
                  className={`text-xs ${
                    lang.status === 'Complete' ? 'bg-green-500/10 text-green-500' :
                    lang.status === 'In Progress' ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-gray-500/10 text-gray-500'
                  }`}
                >
                  {lang.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>Translation Progress</span>
                    <span>{lang.completion}%</span>
                  </div>
                  <div className="w-full bg-[var(--sublimes-dark-bg)] rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        lang.completion === 100 ? 'bg-green-500' :
                        lang.completion > 50 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${lang.completion}%` }}
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit3 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-[#D4AF37]" size={48} />
      </div>
    );
  }

  return (
    <div className="p-6 bg-[var(--sublimes-dark-bg)] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)] mb-2">Brand Kit</h1>
        <p className="text-gray-400">Manage brand assets, colors, typography, and localization - All editable</p>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <TabsTrigger value="banners" className="data-[state=active]:bg-[var(--sublimes-gold)] data-[state=active]:text-[var(--sublimes-dark-bg)]">
            <Layout className="h-4 w-4 mr-2" />
            Banners
          </TabsTrigger>
          <TabsTrigger value="colors" className="data-[state=active]:bg-[var(--sublimes-gold)] data-[state=active]:text-[var(--sublimes-dark-bg)]">
            <Palette className="h-4 w-4 mr-2" />
            Colors & Contact
          </TabsTrigger>
          <TabsTrigger value="typography" className="data-[state=active]:bg-[var(--sublimes-gold)] data-[state=active]:text-[var(--sublimes-dark-bg)]">
            <Type className="h-4 w-4 mr-2" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="localization" className="data-[state=active]:bg-[var(--sublimes-gold)] data-[state=active]:text-[var(--sublimes-dark-bg)]">
            <Globe className="h-4 w-4 mr-2" />
            Localization
          </TabsTrigger>
        </TabsList>

        <TabsContent value="banners"><BannerManager /></TabsContent>
        <TabsContent value="colors">{renderColorsTab()}</TabsContent>
        <TabsContent value="typography">{renderTypographyTab()}</TabsContent>
        <TabsContent value="localization">{renderLocalizationTab()}</TabsContent>
      </Tabs>

      {/* Edit Color Modal */}
      <Dialog open={editColorModal.open} onOpenChange={(open) => setEditColorModal({ open, colorKey: null })}>
        <DialogContent className="bg-[#0F1829] border-[#1A2332] text-[#E8EAED]">
          <DialogHeader>
            <DialogTitle>Edit Color</DialogTitle>
          </DialogHeader>
          {editingColor && (
            <div className="space-y-4 py-4">
              <div>
                <Label>Color Name</Label>
                <Input
                  value={editingColor.name}
                  onChange={(e) => setEditingColor({ ...editingColor, name: e.target.value })}
                  className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                />
              </div>
              <div>
                <Label>HEX Value</Label>
                <Input
                  value={editingColor.hex}
                  onChange={(e) => setEditingColor({ ...editingColor, hex: e.target.value })}
                  className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                  placeholder="#D4AF37"
                />
              </div>
              <div>
                <Label>RGB Value</Label>
                <Input
                  value={editingColor.rgb}
                  onChange={(e) => setEditingColor({ ...editingColor, rgb: e.target.value })}
                  className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                  placeholder="rgb(212, 175, 55)"
                />
              </div>
              <div>
                <Label>Usage Description</Label>
                <Textarea
                  value={editingColor.usage}
                  onChange={(e) => setEditingColor({ ...editingColor, usage: e.target.value })}
                  className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                  rows={2}
                />
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: editingColor.hex }}>
                <div className="text-center text-white" style={{ textShadow: '0 0 4px rgba(0,0,0,0.5)' }}>
                  Preview
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditColorModal({ open: false, colorKey: null })}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveColor} 
              disabled={saving}
              className="bg-[#D4AF37] text-[#0B1426]"
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Typography Modal */}
      <Dialog open={editTypographyModal} onOpenChange={setEditTypographyModal}>
        <DialogContent className="bg-[#0F1829] border-[#1A2332] text-[#E8EAED] max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Typography</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label>Font Family</Label>
              <Input
                value={typography.fontFamily}
                onChange={(e) => setTypography({ ...typography, fontFamily: e.target.value })}
                className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>H1 Size</Label>
                <Input
                  value={typography.sizes.h1}
                  onChange={(e) => setTypography({ ...typography, sizes: { ...typography.sizes, h1: e.target.value } })}
                  className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                />
              </div>
              <div>
                <Label>H1 Weight</Label>
                <Input
                  value={typography.headingWeights.h1}
                  onChange={(e) => setTypography({ ...typography, headingWeights: { ...typography.headingWeights, h1: e.target.value } })}
                  className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>H2 Size</Label>
                <Input
                  value={typography.sizes.h2}
                  onChange={(e) => setTypography({ ...typography, sizes: { ...typography.sizes, h2: e.target.value } })}
                  className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                />
              </div>
              <div>
                <Label>H2 Weight</Label>
                <Input
                  value={typography.headingWeights.h2}
                  onChange={(e) => setTypography({ ...typography, headingWeights: { ...typography.headingWeights, h2: e.target.value } })}
                  className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTypographyModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                saveTypography(typography);
                setEditTypographyModal(false);
              }}
              disabled={saving}
              className="bg-[#D4AF37] text-[#0B1426]"
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Contact Info Modal */}
      <Dialog open={editContactModal} onOpenChange={setEditContactModal}>
        <DialogContent className="bg-[#0F1829] border-[#1A2332] text-[#E8EAED]">
          <DialogHeader>
            <DialogTitle>Edit Contact Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Email</Label>
              <Input
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                type="email"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={contactInfo.phone}
                onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
              />
            </div>
            <div>
              <Label>Address</Label>
              <Input
                value={contactInfo.address}
                onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
              />
            </div>
            <div>
              <Label>Facebook URL</Label>
              <Input
                value={contactInfo.facebook}
                onChange={(e) => setContactInfo({ ...contactInfo, facebook: e.target.value })}
                className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
                placeholder="https://www.facebook.com/Sublimesdrive/"
              />
            </div>
            <div>
              <Label>Instagram URL (Optional)</Label>
              <Input
                value={contactInfo.instagram}
                onChange={(e) => setContactInfo({ ...contactInfo, instagram: e.target.value })}
                className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
              />
            </div>
            <div>
              <Label>Twitter URL (Optional)</Label>
              <Input
                value={contactInfo.twitter}
                onChange={(e) => setContactInfo({ ...contactInfo, twitter: e.target.value })}
                className="bg-[#0B1426] border-[#1A2332] text-[#E8EAED]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditContactModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                saveContactInfo(contactInfo);
                setEditContactModal(false);
              }}
              disabled={saving}
              className="bg-[#D4AF37] text-[#0B1426]"
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
