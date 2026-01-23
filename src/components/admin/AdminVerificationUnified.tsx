/**
 * WiringDoc (auto)
 * Entities: [verification_requests]
 * Reads: public.verification_requests
 * Writes: verification_requests, profiles
 * RLS: admin_manage_verifications
 * Role UI: admin, editor
 * Stripe: n/a
 * AI Bot: n/a
 * Telemetry: view:admin_verification, action:approve_verification, action:reject_verification
 * Last Verified: 2026-01-22T00:00:00Z
 */

import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  Building2,
  Store,
  Eye,
  Download,
  MessageSquare
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase/client';

interface Verification {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  admin_notes?: string;
  rejection_reason?: string;
  // Car Owner specific
  vehicle_registration?: string;
  vehicle_photos?: string[];
  ownership_proof?: string;
  registration_number?: string;
  // Garage specific
  trade_license?: string;
  garage_photos?: string[];
  insurance_certificate?: string;
  business_name?: string;
  business_address?: string;
  // Vendor specific
  business_registration?: string;
  tax_certificate?: string;
  vendor_name?: string;
  vendor_type?: string;
  // User info (joined)
  profiles?: {
    display_name: string;
    email: string;
    avatar_url?: string;
    role?: string;
    sub_role?: string;
  };
  kind?: string;
  verification_type?: string;
  data?: any; // For flexible JSON data
  documents?: string[]; // Array of document URLs
}

export function AdminVerificationUnified() {
  const [activeTab, setActiveTab] = useState('car_owner');
  const [carOwnerVerifications, setCarOwnerVerifications] = useState<Verification[]>([]);
  const [garageVerifications, setGarageVerifications] = useState<Verification[]>([]);
  const [vendorVerifications, setVendorVerifications] = useState<Verification[]>([]);
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionNotes, setActionNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVerifications();
    logAnalytics('view', 'admin_verification');
  }, [activeTab]);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      // 1. Fetch ALL Requests (simplest query)
      const { data: requests, error } = await supabase
        .from('verification_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 2. Fetch Pending Profiles (Orphans) to ensure no one is missed
      const { data: pendingProfiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('verification_status', 'pending');

      // 3. Attach Profiles to requests
      const userIds = new Set<string>();
      requests?.forEach(r => userIds.add(r.user_id));
      pendingProfiles?.forEach(p => userIds.add(p.id));

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, email, avatar_url, role, sub_role')
        .in('id', Array.from(userIds));

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

      // 4. Merge and process
      let allItems: Verification[] = [];

      // Add real requests
      requests?.forEach(req => {
        allItems.push({
          ...req,
          profiles: profileMap.get(req.user_id),
          // Normalize fields from 'data' JSON if needed
          business_name: req.business_name || req.data?.business_name,
          registration_number: req.registration_number || req.data?.plateNumber,
        });
      });

      // Note: We removed the "synthetic" profile logic
      // Only users who actually submitted verification requests will appear

      // 5. Filter for Current Tab
      const filterForTab = (item: Verification) => {
        // Check exact kind/type matches
        if (activeTab === 'car_owner') {
          return item.kind === 'car_owner' || item.verification_type === 'vehicle' || item.kind === 'vehicle';
        }
        if (activeTab === 'garage') {
          return item.kind === 'garage_owner' || item.kind === 'garage' || item.verification_type === 'garage';
        }
        if (activeTab === 'vendor') {
          return item.kind === 'vendor' || item.verification_type === 'vendor';
        }
        return false;
      };

      const filtered = allItems.filter(filterForTab);
      // Sort by date newest first
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      if (activeTab === 'car_owner') setCarOwnerVerifications(filtered);
      else if (activeTab === 'garage') setGarageVerifications(filtered);
      else if (activeTab === 'vendor') setVendorVerifications(filtered);

    } catch (error: any) {
      console.error('Error fetching verifications:', error);
      toast.error('Failed to load verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (verification: Verification) => {
    console.log('Starting approval (RPC) for:', verification);
    setLoading(true);
    try {
      const isSynthetic = verification.id.startsWith('synthetic-');

      if (isSynthetic) {
        toast.error("Cannot approve synthetic profiles directly yet");
        setLoading(false);
        return;
      }

      // CALL THE NEW RPC
      const { data, error } = await supabase.rpc('approve_verification_request', {
        p_request_id: verification.id,
        p_admin_notes: actionNotes
      });

      console.log('RPC Result:', { data, error });

      if (error) throw error;
      if (data && !data.success) {
        throw new Error(data.error || 'Unknown RPC error');
      }

      toast.success('Approved successfully');
      setDetailsOpen(false);
      fetchVerifications();
    } catch (error: any) {
      console.error('Error approving:', error);
      toast.error('Failed to approve: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (verification: Verification) => {
    if (!actionNotes.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    setLoading(true);
    try {
      const isSynthetic = verification.id.startsWith('synthetic-');

      if (!isSynthetic) {
        const { error } = await supabase
          .from('verification_requests')
          .update({
            status: 'rejected',
            rejection_reason: actionNotes,
            admin_notes: actionNotes,
            updated_at: new Date().toISOString()
          })
          .eq('id', verification.id);
        if (error) throw error;
      }

      await supabase
        .from('profiles')
        .update({ verification_status: 'rejected' })
        .eq('id', verification.user_id);

      await logAudit('reject_verification', 'verification_requests', verification.id, true);
      toast.success('Rejected successfully');
      setDetailsOpen(false);
      fetchVerifications();
    } catch (error: any) {
      console.error('Error rejecting:', error);
      toast.error('Failed to reject');
    } finally {
      setLoading(false);
    }
  };

  const logAudit = async (action: string, entity: string, entityId: string, success: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('admin_logs').insert({
        admin_id: user.id,
        action,
        target_type: entity,
        target_id: entityId,
        metadata: { notes: actionNotes, success },
        created_at: new Date().toISOString()
      });
    } catch (e) { console.error('Audit log error', e); }
  };

  const logAnalytics = async (type: 'view' | 'action', event: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('analytics_events').insert({
        user_id: user.id, event_type: type, event_name: event,
        metadata: { tab: activeTab }, created_at: new Date().toISOString()
      });
    } catch (e) { console.error('Analytics log error', e); }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved': return <Badge variant="outline" className="bg-green-500/10 text-green-400"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected': return <Badge variant="outline" className="bg-red-500/10 text-red-400"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default: return null;
    }
  };

  const renderVerificationList = (verifications: Verification[]) => {
    const pending = verifications.filter(v => v.status === 'pending');
    const approved = verifications.filter(v => v.status === 'approved');
    const rejected = verifications.filter(v => v.status === 'rejected');

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg mb-4 text-[#E8EAED]">Pending ({pending.length})</h3>
          <div className="space-y-3">
            {pending.map(v => (
              <VerificationCard key={v.id} verification={v} onClick={() => { setSelectedVerification(v); setDetailsOpen(true); }} />
            ))}
            {pending.length === 0 && <div className="text-center py-8 text-gray-400">No pending verifications</div>}
          </div>
        </div>
        <div>
          <h3 className="text-lg mb-4 text-[#E8EAED]">Approved ({approved.length})</h3>
          <div className="space-y-3">
            {approved.slice(0, 5).map(v => (
              <VerificationCard key={v.id} verification={v} onClick={() => { setSelectedVerification(v); setDetailsOpen(true); }} />
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-lg mb-4 text-[#E8EAED]">Rejected ({rejected.length})</h3>
          <div className="space-y-3">
            {rejected.slice(0, 5).map(v => (
              <VerificationCard key={v.id} verification={v} onClick={() => { setSelectedVerification(v); setDetailsOpen(true); }} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const VerificationCard = ({ verification, onClick }: { verification: Verification; onClick: () => void }) => (
    <Card className="p-4 bg-[#1a1f2e] border-gray-700 hover:border-[#D4AF37] cursor-pointer transition-all" onClick={onClick}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {verification.profiles?.avatar_url ? (
            <img src={verification.profiles.avatar_url} alt={verification.profiles.display_name} className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center"><User className="w-5 h-5 text-[#D4AF37]" /></div>
          )}
          <div>
            <div className="text-[#E8EAED]">{verification.profiles?.display_name || 'Unknown User'}</div>
            <div className="text-sm text-gray-400">{verification.profiles?.email}</div>
            <div className="text-xs text-gray-500">ID: {verification.id.slice(0, 8)}...</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-400">{new Date(verification.created_at).toLocaleDateString()}</div>
          {getStatusBadge(verification.status)}
          <Eye className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl text-[#E8EAED] mb-2">Unified Verification</h1>
        <p className="text-gray-400">Manage car owner, garage, and vendor verifications</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-[#1a1f2e] border border-gray-700">
          <TabsTrigger value="car_owner" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"><User className="w-4 h-4 mr-2" />Car Owner</TabsTrigger>
          <TabsTrigger value="garage" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"><Building2 className="w-4 h-4 mr-2" />Garage Hub</TabsTrigger>
          <TabsTrigger value="vendor" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"><Store className="w-4 h-4 mr-2" />Vendor Registration</TabsTrigger>
        </TabsList>

        <TabsContent value="car_owner" className="mt-6">{renderVerificationList(carOwnerVerifications)}</TabsContent>
        <TabsContent value="garage" className="mt-6">{renderVerificationList(garageVerifications)}</TabsContent>
        <TabsContent value="vendor" className="mt-6">{renderVerificationList(vendorVerifications)}</TabsContent>
      </Tabs>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="bg-[#1a1f2e] border-gray-700 text-[#E8EAED] max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedVerification && (
            <>
              <DialogHeader>
                <DialogTitle>Verification Details</DialogTitle>
                <DialogDescription className="text-gray-400">Review and take action</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                <div>
                  <h3 className="text-sm text-gray-400 mb-2">User Information</h3>
                  <div className="flex items-center gap-3 p-3 bg-[#0B1426] rounded-lg">
                    {selectedVerification.profiles?.avatar_url && (
                      <img src={selectedVerification.profiles.avatar_url} alt="" className="w-12 h-12 rounded-full" />
                    )}
                    <div>
                      <div className="text-[#E8EAED]">{selectedVerification.profiles?.display_name}</div>
                      <div className="text-sm text-gray-400">{selectedVerification.profiles?.email}</div>
                      <div className="text-xs text-gray-500">User ID: {selectedVerification.user_id}</div>
                    </div>
                  </div>
                </div>

                {/* Dynamic Documents Display */}
                <div>
                  <h3 className="text-sm text-gray-400 mb-2">Documents</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(() => {
                      const docs: { label: string; url: string }[] = [];
                      const data = selectedVerification.data || {};

                      // DEBUG: Log the data to see what we have
                      console.log('Verification data:', data);
                      console.log('Documents array:', selectedVerification.documents);

                      // Car Owner Documents
                      if (data.vehicle_registration_url || selectedVerification.vehicle_registration) {
                        docs.push({ label: 'Vehicle Registration', url: data.vehicle_registration_url || selectedVerification.vehicle_registration });
                      }
                      if (data.ownership_proof_url || selectedVerification.ownership_proof) {
                        docs.push({ label: 'Ownership Proof', url: data.ownership_proof_url || selectedVerification.ownership_proof });
                      }

                      // Garage Documents
                      if (data.trade_license_url || selectedVerification.trade_license) {
                        docs.push({ label: 'Trade License', url: data.trade_license_url || selectedVerification.trade_license });
                      }
                      if (data.utility_bill_url) {
                        docs.push({ label: 'Utility Bill', url: data.utility_bill_url });
                      }

                      // Vendor Documents
                      if (data.trade_license_url && !docs.find(d => d.label === 'Trade License')) {
                        docs.push({ label: 'Trade License', url: data.trade_license_url });
                      }
                      if (data.tax_certificate_url) {
                        docs.push({ label: 'Tax Certificate', url: data.tax_certificate_url });
                      }

                      // Generic File URL fallback
                      Object.keys(data).forEach(key => {
                        if (key.endsWith('_url') && typeof data[key] === 'string' && data[key].startsWith('http')) {
                          const label = key.replace(/_/g, ' ').replace(' url', '').replace(/\b\w/g, l => l.toUpperCase());
                          if (!docs.find(d => d.url === data[key])) {
                            docs.push({ label, url: data[key] });
                          }
                        }
                      });

                      // Fallback: Use documents array if no docs found in data
                      if (docs.length === 0 && selectedVerification.documents && selectedVerification.documents.length > 0) {
                        selectedVerification.documents.forEach((url: string, idx: number) => {
                          if (url && url.startsWith('http')) {
                            docs.push({ label: `Document ${idx + 1}`, url });
                          }
                        });
                      }

                      console.log('Final docs array:', docs);

                      if (docs.length === 0) return <p className="text-sm text-gray-500 italic">No documents attached.</p>;

                      return docs.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-[#0B1426] rounded-lg border border-gray-700">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileText className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                            <span className="text-sm text-[#E8EAED] truncate" title={doc.label}>{doc.label}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300"
                            onClick={() => window.open(doc.url, '_blank')}
                          >
                            <Eye className="w-4 h-4" />
                            <span className="sr-only">View</span>
                          </Button>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Raw Data (Folded) */}
                <div className="space-y-2 mt-4">
                  <details className="text-xs text-gray-500 cursor-pointer">
                    <summary className="hover:text-gray-400 select-none">View Raw Request Data</summary>
                    <div className="mt-2 p-3 bg-[#0B1426] rounded-lg font-mono overflow-auto max-h-40 text-xs">
                      <pre>{JSON.stringify({
                        kind: selectedVerification.kind,
                        type: selectedVerification.verification_type,
                        // ...selectedVerification
                        data: selectedVerification.data
                      }, null, 2)}</pre>
                    </div>
                  </details>
                </div>

                {selectedVerification.status === 'pending' && (
                  <div>
                    <h3 className="text-sm text-gray-400 mb-2"><MessageSquare className="w-4 h-4 inline mr-1" />Notes</h3>
                    <Textarea value={actionNotes} onChange={(e) => setActionNotes(e.target.value)} placeholder="Add notes or rejection reason..." className="bg-[#0B1426] border-gray-700 text-[#E8EAED]" rows={3} />
                  </div>
                )}

                {selectedVerification.status === 'pending' && (
                  <div className="flex gap-3">
                    <Button onClick={() => handleApprove(selectedVerification)} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700"><CheckCircle className="w-4 h-4 mr-2" />Approve</Button>
                    <Button onClick={() => handleReject(selectedVerification)} disabled={loading} variant="destructive" className="flex-1"><XCircle className="w-4 h-4 mr-2" />Reject</Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
