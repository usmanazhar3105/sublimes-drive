import { useState } from 'react';
import { 
  Gavel, 
  Plus, 
  Edit3, 
  Save, 
  Eye, 
  Trash2, 
  FileText,
  Shield,
  Users,
  Globe
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';

export function AdminLegalPage() {
  const [selectedTab, setSelectedTab] = useState('documents');
  const [editingDoc, setEditingDoc] = useState<string | null>(null);

  const tabs = [
    { id: 'documents', label: 'Legal Documents', icon: FileText },
    { id: 'consent', label: 'User Consent', icon: Shield },
    { id: 'compliance', label: 'Compliance', icon: Users },
    { id: 'policies', label: 'Policies', icon: Globe }
  ];

  const [legalDocuments, setLegalDocuments] = useState([
    {
      id: 'terms',
      title: 'Terms of Service',
      content: `**Welcome to Sublimes Drive**

By using our platform, you agree to these terms and conditions. Sublimes Drive is the premier community for Chinese car enthusiasts in the UAE.

**1. Acceptance of Terms**
By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement.

**2. User Conduct**
Users must maintain respectful behavior and follow community guidelines. No spam, inappropriate content, or fraudulent activities are allowed.

**3. Vehicle Verification**
All vehicle listings must be verified through our Mulkiya verification system. False information will result in account suspension.

**4. Marketplace Rules**
All marketplace transactions are between users. Sublimes Drive facilitates but is not responsible for transactions.

**5. Intellectual Property**
Content uploaded by users remains their property, but users grant Sublimes Drive license to use for platform purposes.

**6. Privacy**
We respect user privacy as outlined in our Privacy Policy.

**7. Termination**
We reserve the right to terminate accounts that violate these terms.

For questions, contact: legal@sublimesdrive.com`,
      lastUpdated: '2024-01-15',
      isPublished: true,
      language: 'en'
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      content: `**Privacy Policy - Sublimes Drive**

Effective Date: January 1, 2024

**1. Information We Collect**
- Account information (name, email, phone)
- Vehicle information (for verification)
- Usage data and analytics
- Communication records

**2. How We Use Information**
- Provide and improve our services
- Verify user identity and vehicles
- Facilitate marketplace transactions
- Send important updates

**3. Information Sharing**
We do not sell personal information. We may share data with:
- Service providers
- Legal authorities when required
- Business partners (anonymized data)

**4. Data Security**
We implement industry-standard security measures to protect your data.

**5. Your Rights**
- Access your data
- Request data deletion
- Opt-out of communications
- Data portability

**6. Cookies**
We use cookies to improve user experience and analytics.

**7. Children's Privacy**
Our service is not intended for users under 18.

**8. Updates**
We may update this policy and will notify users of changes.

Contact: privacy@sublimesdrive.com`,
      lastUpdated: '2024-01-10',
      isPublished: true,
      language: 'en'
    },
    {
      id: 'refund',
      title: 'Refund Policy',
      content: `**Refund Policy**

**1. Boost Listings**
- Refunds available within 24 hours if listing not approved
- No refunds after listing is published
- Partial refunds for technical issues

**2. Premium Features**
- 30-day money-back guarantee
- Pro-rated refunds for annual subscriptions

**3. Event Tickets**
- Refunds available up to 48 hours before event
- Emergency cancellations receive full refund

**4. Processing Time**
- Refunds processed within 5-7 business days
- Refunds issued to original payment method

**5. Exceptions**
- Digital content downloads
- Services already provided
- Violations of terms of service

For refund requests: support@sublimesdrive.com`,
      lastUpdated: '2024-01-08',
      isPublished: true,
      language: 'en'
    },
    {
      id: 'community',
      title: 'Community Guidelines',
      content: `**Community Guidelines**

**1. Respect & Courtesy**
- Treat all members with respect
- No harassment, bullying, or hate speech
- Be constructive in discussions

**2. Content Standards**
- Keep content relevant to Chinese cars
- No spam or excessive self-promotion
- Original content preferred

**3. Safety First**
- No dangerous driving content
- Promote safe driving practices
- Report unsafe activities

**4. Marketplace Ethics**
- Honest descriptions and pricing
- No fraudulent listings
- Respond promptly to inquiries

**5. Privacy Respect**
- Don't share others' personal information
- Respect privacy settings
- Ask before sharing photos with people

**6. Arabic & Chinese Culture**
- Respect local customs and laws
- Arabic and Chinese languages welcome
- Cultural exchange encouraged

**7. Reporting**
Use the report feature for violations.

Together, we build the best car community!`,
      lastUpdated: '2024-01-05',
      isPublished: true,
      language: 'en'
    }
  ]);

  const renderDocumentsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--sublimes-light-text)]">Legal Documents</h3>
          <p className="text-gray-400">Manage terms, policies, and legal content</p>
        </div>
        <Button className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)]">
          <Plus className="w-4 h-4 mr-2" />
          New Document
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {legalDocuments.map((doc) => (
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
                  <Badge variant="outline">{doc.language.toUpperCase()}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editingDoc === doc.id ? (
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
                    placeholder="Document content (Markdown supported)"
                  />
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm"
                      className="bg-green-500 text-white"
                      onClick={() => {
                        setEditingDoc(null);
                        alert('Document saved successfully!');
                      }}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingDoc(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm line-clamp-4">{doc.content.substring(0, 200)}...</p>
                  <div className="text-xs text-gray-500">
                    Last updated: {doc.lastUpdated}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setEditingDoc(doc.id)}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-blue-500"
                      onClick={() => window.open(`/legal/${doc.id}`, '_blank')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-500"
                      onClick={() => {
                        if (confirm(`Delete "${doc.title}"?`)) {
                          setLegalDocuments(docs => docs.filter(d => d.id !== doc.id));
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
    </div>
  );

  const renderConsentTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Shield className="w-8 h-8 text-green-500" />
              <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded">Active</span>
            </div>
            <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">98.5%</p>
            <p className="text-sm text-gray-400">Consent Rate</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-500" />
              <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs font-bold rounded">Live</span>
            </div>
            <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">2,847</p>
            <p className="text-sm text-gray-400">Users Consented</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-8 h-8 text-[var(--sublimes-gold)]" />
              <span className="px-2 py-1 bg-[var(--sublimes-gold)]/10 text-[var(--sublimes-gold)] text-xs font-bold rounded">Updated</span>
            </div>
            <p className="text-2xl font-bold text-[var(--sublimes-light-text)] mb-1">4</p>
            <p className="text-sm text-gray-400">Active Policies</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
        <CardHeader>
          <CardTitle className="text-[var(--sublimes-light-text)]">Consent Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[var(--sublimes-dark-bg)] rounded-lg">
              <div>
                <h4 className="font-medium text-[var(--sublimes-light-text)]">Cookie Consent</h4>
                <p className="text-sm text-gray-400">Analytics and functionality cookies</p>
              </div>
              <Badge className="bg-green-500/10 text-green-500">97.2% Acceptance</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-[var(--sublimes-dark-bg)] rounded-lg">
              <div>
                <h4 className="font-medium text-[var(--sublimes-light-text)]">Data Processing</h4>
                <p className="text-sm text-gray-400">Personal data processing consent</p>
              </div>
              <Badge className="bg-green-500/10 text-green-500">98.5% Acceptance</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-[var(--sublimes-dark-bg)] rounded-lg">
              <div>
                <h4 className="font-medium text-[var(--sublimes-light-text)]">Marketing Communications</h4>
                <p className="text-sm text-gray-400">Newsletter and promotional emails</p>
              </div>
              <Badge className="bg-blue-500/10 text-blue-500">76.3% Acceptance</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 bg-[var(--sublimes-dark-bg)]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)] mb-2">Legal & Consent Management</h1>
        <p className="text-gray-400">Manage legal documents, user consent, and compliance</p>
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
      {selectedTab === 'documents' && renderDocumentsTab()}
      {selectedTab === 'consent' && renderConsentTab()}
      {selectedTab === 'compliance' && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[var(--sublimes-light-text)] mb-2">Compliance Dashboard</h3>
          <p className="text-gray-400">GDPR and UAE data protection compliance monitoring</p>
        </div>
      )}
      {selectedTab === 'policies' && (
        <div className="text-center py-12">
          <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[var(--sublimes-light-text)] mb-2">Policy Management</h3>
          <p className="text-gray-400">Multi-language policy management system</p>
        </div>
      )}
    </div>
  );
}