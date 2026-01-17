/**
 * WiringDoc (auto)
 * Entities: [car_owner_verifications, garage_verifications, vendor_verifications]
 * Reads: public.car_owner_verifications, public.garage_verifications, public.vendor_verifications
 * Writes: fn.approve_verification, fn.reject_verification
 * RLS: admin_manage_*_verifications
 * Role UI: admin, editor
 * Stripe: n/a
 * AI Bot: n/a
 * Telemetry: view:admin_verification, action:approve_verification, action:reject_verification
 * Last Verified: 2025-10-31T00:00:00Z
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
  // Garage specific
  trade_license?: string;
  garage_photos?: string[];
  insurance_certificate?: string;
  business_name?: string;
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
  };
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
      const attachProfiles = async (rows: any[]) => {
        const ids = Array.from(new Set(rows.map(r => r.user_id).filter(Boolean)));
        if (ids.length === 0) return rows;
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, display_name, email, avatar_url')
          .in('id', ids);
        const map = new Map((profs || []).map((p: any) => [p.id, p]));
        return rows.map(r => ({ ...r, profiles: map.get(r.user_id) }));
      };

      if (activeTab === 'car_owner') {
        const { data, error } = await supabase
          .from('car_owner_verifications')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        const rows = await attachProfiles(data || []);
        setCarOwnerVerifications(rows as any);
      } else if (activeTab === 'garage') {
        const { data, error } = await supabase
          .from('garage_verifications')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        const rows = await attachProfiles(data || []);
        setGarageVerifications(rows as any);
      } else if (activeTab === 'vendor') {
        const { data, error } = await supabase
          .from('vendor_verifications')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        const rows = await attachProfiles(data || []);
        setVendorVerifications(rows as any);
      }
    } catch (error: any) {
      console.error('Error fetching verifications:', error);
      toast.error('Failed to load verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (verification: Verification) => {
    setLoading(true);
    try {
      const table = activeTab === 'car_owner' 
        ? 'car_owner_verifications'
        : activeTab === 'garage'
        ? 'garage_verifications'
        : 'vendor_verifications';

      const { error } = await supabase
        .from(table)
        .update({
          status: 'approved',
          admin_notes: actionNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', verification.id);

      if (error) throw error;

      // Update user role if approved
      if (activeTab === 'car_owner') {
        await supabase
          .from('profiles')
          .update({ role: 'car_owner' })
          .eq('id', verification.user_id);
      } else if (activeTab === 'garage') {
        await supabase
          .from('profiles')
          .update({ role: 'garage_owner' })
          .eq('id', verification.user_id);
      } else if (activeTab === 'vendor') {
        await supabase
          .from('profiles')
          .update({ role: 'vendor' })
          .eq('id', verification.user_id);
      }

      // Log audit
      await logAudit('approve_verification', table, verification.id, true);
      await logAnalytics('action', 'approve_verification');

      toast.success('Verification approved successfully');
      setDetailsOpen(false);
      setActionNotes('');
      fetchVerifications();
    } catch (error: any) {
      console.error('Error approving verification:', error);
      toast.error('Failed to approve verification');
      await logAudit('approve_verification', 'verification', verification.id, false);
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
      const table = activeTab === 'car_owner' 
        ? 'car_owner_verifications'
        : activeTab === 'garage'
        ? 'garage_verifications'
        : 'vendor_verifications';

      const { error } = await supabase
        .from(table)
        .update({
          status: 'rejected',
          rejection_reason: actionNotes,
          admin_notes: actionNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', verification.id);

      if (error) throw error;

      // Log audit
      await logAudit('reject_verification', table, verification.id, true);
      await logAnalytics('action', 'reject_verification');

      toast.success('Verification rejected');
      setDetailsOpen(false);
      setActionNotes('');
      fetchVerifications();
    } catch (error: any) {
      console.error('Error rejecting verification:', error);
      toast.error('Failed to reject verification');
      await logAudit('reject_verification', 'verification', verification.id, false);
    } finally {
      setLoading(false);
    }
  };

  const logAudit = async (action: string, entity: string, entityId: string, success: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action,
        entity,
        entity_id: entityId,
        success,
        metadata: { notes: actionNotes },
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging audit:', error);
    }
  };

  const logAnalytics = async (type: 'view' | 'action', event: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('analytics_events').insert({
        user_id: user.id,
        event_type: type,
        event_name: event,
        metadata: { tab: activeTab },
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging analytics:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-400"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-400"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  const renderVerificationList = (verifications: Verification[]) => {
    const pending = verifications.filter(v => v.status === 'pending');
    const approved = verifications.filter(v => v.status === 'approved');
    const rejected = verifications.filter(v => v.status === 'rejected');

    return (
      <div className="space-y-6">
        {/* Pending Section */}
        <div>
          <h3 className="text-lg mb-4 text-[#E8EAED]">Pending ({pending.length})</h3>
          <div className="space-y-3">
            {pending.map(verification => (
              <VerificationCard 
                key={verification.id} 
                verification={verification}
                onClick={() => {
                  setSelectedVerification(verification);
                  setDetailsOpen(true);
                }}
              />
            ))}
            {pending.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No pending verifications
              </div>
            )}
          </div>
        </div>

        {/* Approved Section */}
        <div>
          <h3 className="text-lg mb-4 text-[#E8EAED]">Approved ({approved.length})</h3>
          <div className="space-y-3">
            {approved.slice(0, 5).map(verification => (
              <VerificationCard 
                key={verification.id} 
                verification={verification}
                onClick={() => {
                  setSelectedVerification(verification);
                  setDetailsOpen(true);
                }}
              />
            ))}
          </div>
        </div>

        {/* Rejected Section */}
        <div>
          <h3 className="text-lg mb-4 text-[#E8EAED]">Rejected ({rejected.length})</h3>
          <div className="space-y-3">
            {rejected.slice(0, 5).map(verification => (
              <VerificationCard 
                key={verification.id} 
                verification={verification}
                onClick={() => {
                  setSelectedVerification(verification);
                  setDetailsOpen(true);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const VerificationCard = ({ verification, onClick }: { verification: Verification; onClick: () => void }) => (
    <Card 
      className="p-4 bg-[#1a1f2e] border-gray-700 hover:border-[#D4AF37] cursor-pointer transition-all"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {verification.profiles?.avatar_url ? (
            <img 
              src={verification.profiles.avatar_url} 
              alt={verification.profiles.display_name}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
              <User className="w-5 h-5 text-[#D4AF37]" />
            </div>
          )}
          <div>
            <div className="text-[#E8EAED]">{verification.profiles?.display_name || 'Unknown User'}</div>
            <div className="text-sm text-gray-400">{verification.profiles?.email}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-400">
            {new Date(verification.created_at).toLocaleDateString()}
          </div>
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
          <TabsTrigger value="car_owner" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
            <User className="w-4 h-4 mr-2" />
            Car Owner
          </TabsTrigger>
          <TabsTrigger value="garage" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
            <Building2 className="w-4 h-4 mr-2" />
            Garage Hub
          </TabsTrigger>
          <TabsTrigger value="vendor" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
            <Store className="w-4 h-4 mr-2" />
            Vendor Registration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="car_owner" className="mt-6">
          {renderVerificationList(carOwnerVerifications)}
        </TabsContent>

        <TabsContent value="garage" className="mt-6">
          {renderVerificationList(garageVerifications)}
        </TabsContent>

        <TabsContent value="vendor" className="mt-6">
          {renderVerificationList(vendorVerifications)}
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="bg-[#1a1f2e] border-gray-700 text-[#E8EAED] max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedVerification && (
            <>
              <DialogHeader>
                <DialogTitle>Verification Details</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Review and take action on this verification request
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* User Info */}
                <div>
                  <h3 className="text-sm text-gray-400 mb-2">User Information</h3>
                  <div className="flex items-center gap-3 p-3 bg-[#0B1426] rounded-lg">
                    {selectedVerification.profiles?.avatar_url && (
                      <img 
                        src={selectedVerification.profiles.avatar_url} 
                        alt={selectedVerification.profiles.display_name}
                        className="w-12 h-12 rounded-full"
                      />
                    )}
                    <div>
                      <div className="text-[#E8EAED]">{selectedVerification.profiles?.display_name}</div>
                      <div className="text-sm text-gray-400">{selectedVerification.profiles?.email}</div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h3 className="text-sm text-gray-400 mb-2">Documents</h3>
                  <div className="space-y-2">
                    {activeTab === 'car_owner' && (
                      <>
                        {selectedVerification.vehicle_registration && (
                          <a href={selectedVerification.vehicle_registration} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-[#0B1426] rounded-lg hover:bg-[#1a1f2e]">
                            <FileText className="w-4 h-4 text-[#D4AF37]" />
                            <span>Vehicle Registration</span>
                            <Download className="w-4 h-4 ml-auto" />
                          </a>
                        )}
                        {selectedVerification.ownership_proof && (
                          <a href={selectedVerification.ownership_proof} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-[#0B1426] rounded-lg hover:bg-[#1a1f2e]">
                            <FileText className="w-4 h-4 text-[#D4AF37]" />
                            <span>Ownership Proof</span>
                            <Download className="w-4 h-4 ml-auto" />
                          </a>
                        )}
                      </>
                    )}
                    {activeTab === 'garage' && (
                      <>
                        {selectedVerification.trade_license && (
                          <a href={selectedVerification.trade_license} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-[#0B1426] rounded-lg hover:bg-[#1a1f2e]">
                            <FileText className="w-4 h-4 text-[#D4AF37]" />
                            <span>Trade License</span>
                            <Download className="w-4 h-4 ml-auto" />
                          </a>
                        )}
                        {selectedVerification.insurance_certificate && (
                          <a href={selectedVerification.insurance_certificate} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-[#0B1426] rounded-lg hover:bg-[#1a1f2e]">
                            <FileText className="w-4 h-4 text-[#D4AF37]" />
                            <span>Insurance Certificate</span>
                            <Download className="w-4 h-4 ml-auto" />
                          </a>
                        )}
                      </>
                    )}
                    {activeTab === 'vendor' && (
                      <>
                        {selectedVerification.business_registration && (
                          <a href={selectedVerification.business_registration} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-[#0B1426] rounded-lg hover:bg-[#1a1f2e]">
                            <FileText className="w-4 h-4 text-[#D4AF37]" />
                            <span>Business Registration</span>
                            <Download className="w-4 h-4 ml-auto" />
                          </a>
                        )}
                        {selectedVerification.tax_certificate && (
                          <a href={selectedVerification.tax_certificate} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-[#0B1426] rounded-lg hover:bg-[#1a1f2e]">
                            <FileText className="w-4 h-4 text-[#D4AF37]" />
                            <span>Tax Certificate</span>
                            <Download className="w-4 h-4 ml-auto" />
                          </a>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Admin Notes/Rejection Reason */}
                {(selectedVerification.admin_notes || selectedVerification.rejection_reason) && (
                  <div>
                    <h3 className="text-sm text-gray-400 mb-2">Previous Notes</h3>
                    <div className="p-3 bg-[#0B1426] rounded-lg text-sm">
                      {selectedVerification.admin_notes || selectedVerification.rejection_reason}
                    </div>
                  </div>
                )}

                {/* Action Notes */}
                {selectedVerification.status === 'pending' && (
                  <div>
                    <h3 className="text-sm text-gray-400 mb-2">
                      <MessageSquare className="w-4 h-4 inline mr-1" />
                      Notes (Required for rejection)
                    </h3>
                    <Textarea
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      placeholder="Add notes or rejection reason..."
                      className="bg-[#0B1426] border-gray-700 text-[#E8EAED]"
                      rows={3}
                    />
                  </div>
                )}

                {/* Actions */}
                {selectedVerification.status === 'pending' && (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleApprove(selectedVerification)}
                      disabled={loading}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(selectedVerification)}
                      disabled={loading}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
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
