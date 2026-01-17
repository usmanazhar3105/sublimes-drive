import { useState } from 'react';
import { 
  Edit3, 
  Save, 
  Plus, 
  Trash2, 
  Eye, 
  Globe, 
  Megaphone,
  FileText,
  Image,
  Settings,
  Upload,
  Link
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';

export function AdminContentManagement() {
  const [selectedTab, setSelectedTab] = useState('announcements');
  const [isEditing, setIsEditing] = useState<string | null>(null);

  const tabs = [
    { id: 'announcements', label: 'Top Bar Announcements', icon: Megaphone },
    { id: 'legal', label: 'Legal Hub Content', icon: FileText },
    { id: 'pages', label: 'Static Pages', icon: Globe },
    { id: 'branding', label: 'Visual Assets', icon: Image },
    { id: 'settings', label: 'App Settings', icon: Settings }
  ];

  // Mock data for announcements
  const [announcements, setAnnouncements] = useState([
    {
      id: '1',
      message: '🚗 Join our exclusive BMW Track Day event - Register now!',
      link: '/events/bmw-track-day',
      isActive: true,
      priority: 1,
      backgroundColor: '#D4AF37',
      textColor: '#0B1426'
    },
    {
      id: '2',
      message: '💰 Special offer: 50% off premium listings this month',
      link: '/offers/premium-discount',
      isActive: true,
      priority: 2,
      backgroundColor: '#10B981',
      textColor: '#FFFFFF'
    },
    {
      id: '3',
      message: '🔧 New garage partners added in Sharjah and Ajman',
      link: '/garage-hub',
      isActive: false,
      priority: 3,
      backgroundColor: '#3B82F6',
      textColor: '#FFFFFF'
    }
  ]);

  // Mock data for legal content
  const [legalContent, setLegalContent] = useState([
    {
      id: 'terms',
      title: 'Terms of Service',
      content: `Welcome to Sublimes Drive ("we", "us", "our"). These Terms of Service ("Terms") govern your use of our website, mobile applications, and services (collectively, the "Platform"). By accessing or using our Platform, you agree to be bound by these Terms...`,
      lastUpdated: '2025-09-24',
      isPublished: true,
      wordCount: 2847,
      sections: 9
    },
    {
      id: 'privacy',
      title: 'Privacy & Cookie Policy',
      content: `Sublimes Drive ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Platform...`,
      lastUpdated: '2025-09-24',
      isPublished: true,
      wordCount: 1963,
      sections: 8
    },
    {
      id: 'refund',
      title: 'Refund Policy',
      content: `Thank you for using Sublimes Drive. We offer digital services and products, and this policy outlines the terms under which refunds may be issued...`,
      lastUpdated: '2025-09-24',
      isPublished: true,
      wordCount: 856,
      sections: 7
    },
    {
      id: 'about',
      title: 'About Us',
      content: `Sublimes Drive was born from a simple observation: Chinese car owners in the UAE needed a dedicated space to connect, share experiences, and access specialized services for their vehicles...`,
      lastUpdated: '2025-09-24',
      isPublished: true,
      wordCount: 624,
      sections: 4
    },
    {
      id: 'guidelines',
      title: 'Community Guidelines',
      content: 'To maintain a positive community, please follow these guidelines...',
      lastUpdated: '2024-01-05',
      isPublished: true,
      wordCount: 425,
      sections: 3
    },
    {
      id: 'faq',
      title: 'FAQ & Help Center',
      content: 'Frequently asked questions and comprehensive help documentation...',
      lastUpdated: '2024-01-12',
      isPublished: true,
      wordCount: 3240,
      sections: 12
    }
  ]);

  const renderAnnouncementsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Top Bar Announcements</h3>
          <p className="text-gray-400">Manage rotating announcements shown at the top of the app</p>
        </div>
        <Button 
          className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]"
          onClick={() => setIsEditing('new')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Announcement
        </Button>
      </div>

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <Card key={announcement.id} className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardContent className="p-6">
              {isEditing === announcement.id ? (
                <div className="space-y-4">
                  <Input
                    placeholder="Announcement message"
                    defaultValue={announcement.message}
                    className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                  />
                  <Input
                    placeholder="Link URL (optional)"
                    defaultValue={announcement.link}
                    className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      placeholder="Background Color"
                      defaultValue={announcement.backgroundColor}
                      className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                    />
                    <Input
                      placeholder="Text Color"
                      defaultValue={announcement.textColor}
                      className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                    />
                    <Input
                      type="number"
                      placeholder="Priority (1-10)"
                      defaultValue={announcement.priority}
                      className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm"
                      className="bg-green-500 text-white"
                      onClick={() => setIsEditing(null)}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div 
                        className="px-3 py-1 rounded text-sm"
                        style={{ 
                          backgroundColor: announcement.backgroundColor,
                          color: announcement.textColor 
                        }}
                      >
                        {announcement.message}
                      </div>
                      {announcement.isActive ? (
                        <Badge className="bg-green-500/10 text-green-500">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                      <Badge variant="outline">Priority {announcement.priority}</Badge>
                    </div>
                    {announcement.link && (
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <Link className="w-4 h-4" />
                        <span>{announcement.link}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(announcement.id)}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-500 hover:text-blue-400"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {isEditing === 'new' && (
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <h4 className="font-bold text-[var(--sublimes-light-text)] mb-4">Create New Announcement</h4>
            <div className="space-y-4">
              <Input
                placeholder="Announcement message"
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              />
              <Input
                placeholder="Link URL (optional)"
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Background Color (#D4AF37)"
                  className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                />
                <Input
                  placeholder="Text Color (#0B1426)"
                  className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                />
                <Input
                  type="number"
                  placeholder="Priority (1-10)"
                  className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  size="sm"
                  className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]"
                  onClick={() => setIsEditing(null)}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Create
                </Button>
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderLegalTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Legal Hub Content</h3>
          <p className="text-gray-400">Manage legal documents and policy content</p>
        </div>
        <Button 
          className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]"
          onClick={() => setIsEditing('new-legal')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Legal Document
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {legalContent.map((doc) => (
          <Card key={doc.id} className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[var(--sublimes-light-text)]">{doc.title}</CardTitle>
                <div className="flex items-center space-x-2">
                  {doc.isPublished ? (
                    <Badge className="bg-green-500/10 text-green-500">Published</Badge>
                  ) : (
                    <Badge variant="outline">Draft</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing === doc.id ? (
                <div className="space-y-4">
                  <Input
                    defaultValue={doc.title}
                    className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                    placeholder="Document title"
                  />
                  <Textarea
                    defaultValue={doc.content}
                    rows={10}
                    className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                    placeholder="Document content"
                  />
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm"
                      className="bg-green-500 text-white"
                      onClick={() => {
                        setIsEditing(null);
                        alert('Document saved successfully!');
                      }}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm line-clamp-3">{doc.content}</p>
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                    <div>
                      <span className="text-[var(--sublimes-gold)]">Word Count:</span> {doc.wordCount}
                    </div>
                    <div>
                      <span className="text-[var(--sublimes-gold)]">Sections:</span> {doc.sections}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Last updated: {doc.lastUpdated}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setIsEditing(doc.id)}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-blue-500"
                      onClick={() => {
                        const previewWindow = window.open('', '_blank');
                        if (previewWindow) {
                          previewWindow.document.write(`
                            <html>
                              <head>
                                <title>${doc.title} - Preview</title>
                                <style>
                                  body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
                                  h1 { color: #D4AF37; border-bottom: 2px solid #D4AF37; padding-bottom: 10px; }
                                  hr { border: 1px solid #ddd; margin: 20px 0; }
                                </style>
                              </head>
                              <body>
                                <h1>${doc.title}</h1>
                                <hr>
                                <div style="white-space: pre-wrap;">${doc.content}</div>
                                <hr>
                                <p><small>Last updated: ${doc.lastUpdated}</small></p>
                              </body>
                            </html>
                          `);
                        }
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-500"
                      onClick={() => {
                        if (confirm('Delete "' + doc.title + '"? This action cannot be undone.')) {
                          setLegalContent(docs => docs.filter(d => d.id !== doc.id));
                          alert('Document deleted successfully!');
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {isEditing === 'new-legal' && (
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <h4 className="font-bold text-[var(--sublimes-light-text)] mb-4">Create New Legal Document</h4>
            <div className="space-y-4">
              <Input
                placeholder="Document title"
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              />
              <Textarea
                placeholder="Document content"
                rows={10}
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              />
              <div className="flex items-center space-x-2">
                <Button 
                  size="sm"
                  className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]"
                  onClick={() => {
                    setIsEditing(null);
                    alert('Legal document created successfully!');
                  }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Create Document
                </Button>
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderPagesTab = () => {
    const staticPages = [
      { id: 'about', name: 'About Us', url: '/about-us', status: 'Published', lastUpdated: '2024-01-15' },
      { id: 'contact', name: 'Contact Us', url: '/contact', status: 'Published', lastUpdated: '2024-01-10' },
      { id: 'help', name: 'Help Center', url: '/help', status: 'Published', lastUpdated: '2024-01-20' },
      { id: 'careers', name: 'Careers', url: '/careers', status: 'Draft', lastUpdated: '2024-01-08' },
      { id: 'press', name: 'Press Kit', url: '/press', status: 'Draft', lastUpdated: '2024-01-05' }
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Static Pages</h3>
            <p className="text-gray-400">Manage About Us, Contact, Help Center, and other static content</p>
          </div>
          <Button 
            className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]"
            onClick={() => setIsEditing('new-page')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Page
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {staticPages.map((page) => (
            <Card key={page.id} className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[var(--sublimes-light-text)]">{page.name}</CardTitle>
                  <Badge 
                    className={page.status === 'Published' 
                      ? 'bg-green-500/10 text-green-500' 
                      : 'bg-yellow-500/10 text-yellow-500'
                    }
                  >
                    {page.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Link className="w-4 h-4" />
                    <span>{page.url}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Last updated: {page.lastUpdated}
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-blue-500">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {isEditing === 'new-page' && (
          <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardContent className="p-6">
              <h4 className="font-bold text-[var(--sublimes-light-text)] mb-4">Create New Page</h4>
              <div className="space-y-4">
                <Input
                  placeholder="Page title"
                  className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                />
                <Input
                  placeholder="URL slug (e.g., /about-us)"
                  className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                />
                <Textarea
                  placeholder="Page content"
                  rows={8}
                  className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                />
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm"
                    className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]"
                    onClick={() => setIsEditing(null)}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Create Page
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderBrandingTab = () => {
    const visualAssets = [
      { id: 'logo-main', name: 'Main Logo', type: 'SVG', size: '24 KB', url: '/assets/logo.svg', category: 'Logos' },
      { id: 'logo-dark', name: 'Dark Logo', type: 'SVG', size: '22 KB', url: '/assets/logo-dark.svg', category: 'Logos' },
      { id: 'banner-home', name: 'Homepage Banner', type: 'PNG', size: '456 KB', url: '/assets/banner-home.png', category: 'Banners' },
      { id: 'loading-anim', name: 'Loading Animation', type: 'GIF', size: '128 KB', url: '/assets/loading.gif', category: 'Animations' },
      { id: 'icon-app', name: 'App Icon', type: 'PNG', size: '64 KB', url: '/assets/app-icon.png', category: 'Icons' }
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Visual Assets</h3>
            <p className="text-gray-400">Manage logos, banners, loading animations, and brand assets</p>
          </div>
          <Button className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]">
            <Upload className="w-4 h-4 mr-2" />
            Upload Asset
          </Button>
        </div>

        {/* Asset Categories */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {['All', 'Logos', 'Banners', 'Icons', 'Animations'].map((category) => (
            <Button 
              key={category}
              variant="outline"
              className="justify-start"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visualAssets.map((asset) => (
            <Card key={asset.id} className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-[var(--sublimes-light-text)]">{asset.name}</CardTitle>
                  <Badge variant="outline">{asset.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Asset Preview */}
                  <div className="aspect-video bg-[var(--sublimes-dark-bg)] border-2 border-dashed border-[var(--sublimes-border)] rounded-lg flex items-center justify-center">
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                    <div>Type: {asset.type}</div>
                    <div>Size: {asset.size}</div>
                  </div>
                  <div className="text-xs text-gray-500 truncate">{asset.url}</div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-red-500">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upload New Asset */}
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--sublimes-light-text)]">Upload New Asset</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-[var(--sublimes-border)] rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">Drag and drop files here, or click to browse</p>
              <p className="text-xs text-gray-500">Supports: PNG, JPG, SVG, GIF (Max 10MB)</p>
              <Button className="mt-4 bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]">
                Choose Files
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">App Settings</h3>
        <p className="text-gray-400">Configure app-wide settings, features, and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--sublimes-light-text)]">General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">App Name</label>
              <Input 
                defaultValue="Sublimes Drive"
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">App Description</label>
              <Textarea
                defaultValue="The ultimate Chinese car community platform in the UAE"
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Support Email</label>
              <Input 
                defaultValue="support@sublimesdrive.com"
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              />
            </div>
            <Button className="w-full bg-green-500 text-white">
              Save General Settings
            </Button>
          </CardContent>
        </Card>

        {/* Feature Toggles */}
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--sublimes-light-text)]">Feature Toggles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'User Registration', enabled: true },
              { name: 'Marketplace', enabled: true },
              { name: 'Garage Hub', enabled: true },
              { name: 'Repair Bidding', enabled: true },
              { name: 'Events System', enabled: false },
              { name: 'AI Chat Assistant', enabled: true },
              { name: 'Boost Packages', enabled: true },
              { name: 'Daily Challenges', enabled: false }
            ].map((feature) => (
              <div key={feature.name} className="flex items-center justify-between">
                <span className="text-sm text-[var(--sublimes-light-text)]">{feature.name}</span>
                <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                  feature.enabled ? 'bg-green-500' : 'bg-gray-600'
                }`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    feature.enabled ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </div>
              </div>
            ))}
            <Button className="w-full bg-green-500 text-white">
              Save Feature Settings
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--sublimes-light-text)]">Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Push Notifications</label>
              <select className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] rounded-md">
                <option>Enabled for All Users</option>
                <option>Enabled for Premium Only</option>
                <option>Disabled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email Notifications</label>
              <select className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] rounded-md">
                <option>Enabled</option>
                <option>Weekly Digest Only</option>
                <option>Disabled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">SMS Notifications</label>
              <select className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] rounded-md">
                <option>Critical Only</option>
                <option>All Notifications</option>
                <option>Disabled</option>
              </select>
            </div>
            <Button className="w-full bg-green-500 text-white">
              Save Notification Settings
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--sublimes-light-text)]">Security Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Session Timeout (minutes)</label>
              <Input 
                defaultValue="60"
                type="number"
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Two-Factor Authentication</label>
              <select className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] rounded-md">
                <option>Optional</option>
                <option>Required for Admins</option>
                <option>Required for All</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Password Policy</label>
              <select className="w-full px-3 py-2 bg-[var(--sublimes-dark-bg)] border border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] rounded-md">
                <option>Standard (8+ chars)</option>
                <option>Strong (12+ chars, mixed)</option>
                <option>Very Strong (16+ chars, symbols)</option>
              </select>
            </div>
            <Button className="w-full bg-green-500 text-white">
              Save Security Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-[var(--sublimes-dark-bg)]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)] mb-2">Content Management</h1>
        <p className="text-gray-400">Manage all app content, announcements, and visual elements</p>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-[var(--sublimes-card-bg)] rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                  selectedTab === tab.id
                    ? 'bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]'
                    : 'text-gray-400 hover:text-[var(--sublimes-light-text)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {selectedTab === 'announcements' && renderAnnouncementsTab()}
      {selectedTab === 'legal' && renderLegalTab()}
      {selectedTab === 'pages' && renderPagesTab()}
      {selectedTab === 'branding' && renderBrandingTab()}
      {selectedTab === 'settings' && renderSettingsTab()}
    </div>
  );
}