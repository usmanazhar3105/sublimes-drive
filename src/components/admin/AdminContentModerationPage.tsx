import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Shield, Eye, Trash2, Ban, AlertTriangle, CheckCircle } from 'lucide-react';
import { useContentModeration } from '../../hooks/useContentModeration';

interface ContentReport {
  id: string;
  reporter_id: string;
  content_type: string;
  content_id: string;
  reason: string;
  details?: string;
  status: string;
  created_at: string;
  reporter?: {
    display_name: string;
    email: string;
  };
}

export function AdminContentModerationPage() {
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'warn' | 'hide' | 'delete' | 'ban_user' | 'no_action'>('warn');
  const [actionReason, setActionReason] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { getReports, moderateContent, loading } = useContentModeration();

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const fetchReports = async () => {
    const result = await getReports(statusFilter === 'all' ? undefined : statusFilter);
    if (result.success) {
      // Enrich with reporter info
      const enrichedReports = await Promise.all(
        (result.reports || []).map(async (report: any) => {
          const { data: reporter } = await supabase
            .from('profiles')
            .select('display_name, email')
            .eq('id', report.reporter_id)
            .single();
          return { ...report, reporter };
        })
      );
      setReports(enrichedReports);
    }
  };

  const handleModerate = async () => {
    if (!selectedReport || !actionReason.trim()) {
      toast.error('Please provide a reason for the action');
      return;
    }

    const result = await moderateContent(
      selectedReport.id,
      actionType,
      actionReason,
      actionNotes
    );

    if (result.success) {
      toast.success('Moderation action completed');
      setShowActionModal(false);
      setSelectedReport(null);
      setActionReason('');
      setActionNotes('');
      await fetchReports();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'reviewing': return 'bg-blue-500/20 text-blue-400';
      case 'resolved': return 'bg-green-500/20 text-green-400';
      case 'dismissed': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'post': return '📝';
      case 'comment': return '💬';
      case 'listing': return '🚗';
      case 'user': return '👤';
      case 'garage': return '🔧';
      case 'event': return '📅';
      default: return '📄';
    }
  };

  return (
    <div className="p-6 bg-[var(--sublimes-dark-bg)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[var(--sublimes-light-text)] mb-2 flex items-center gap-2">
          <Shield className="w-8 h-8 text-[var(--sublimes-gold)]" />
          Content Moderation
        </h1>
        <p className="text-gray-400">Review and moderate reported content</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-sm text-gray-400">
          {reports.length} report{reports.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No reports found</p>
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => (
            <Card
              key={report.id}
              className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getContentTypeIcon(report.content_type)}</span>
                    <div>
                      <CardTitle className="text-[var(--sublimes-light-text)] mb-1">
                        {report.content_type.charAt(0).toUpperCase() + report.content_type.slice(1)} Report
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>Reported by: {report.reporter?.display_name || 'Unknown'}</span>
                        <span>•</span>
                        <span>{new Date(report.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(report.status)}>
                    {report.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-[var(--sublimes-light-text)] text-sm">Reason</Label>
                    <p className="text-gray-300 mt-1">{report.reason}</p>
                  </div>
                  {report.details && (
                    <div>
                      <Label className="text-[var(--sublimes-light-text)] text-sm">Details</Label>
                      <p className="text-gray-300 mt-1">{report.details}</p>
                    </div>
                  )}
                  {report.status === 'pending' && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedReport(report);
                          setShowActionModal(true);
                        }}
                        className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/90"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Take Action
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          await moderateContent(report.id, 'no_action', 'Dismissed by admin', 'No action needed');
                          await fetchReports();
                        }}
                        className="border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                      >
                        Dismiss
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Action Modal */}
      <Dialog open={showActionModal} onOpenChange={setShowActionModal}>
        <DialogContent className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--sublimes-light-text)]">Moderate Content</DialogTitle>
            <DialogDescription className="text-gray-400">
              Choose an action to take on this reported content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-[var(--sublimes-light-text)]">Action Type</Label>
              <Select value={actionType} onValueChange={(v: any) => setActionType(v)}>
                <SelectTrigger className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warn">Warn User</SelectItem>
                  <SelectItem value="hide">Hide Content</SelectItem>
                  <SelectItem value="delete">Delete Content</SelectItem>
                  <SelectItem value="ban_user">Ban User</SelectItem>
                  <SelectItem value="no_action">No Action</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[var(--sublimes-light-text)]">Reason *</Label>
              <Textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Explain why you're taking this action..."
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] mt-2"
                rows={3}
              />
            </div>
            <div>
              <Label className="text-[var(--sublimes-light-text)]">Notes (Optional)</Label>
              <Textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Additional notes..."
                className="bg-[var(--sublimes-dark-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)] mt-2"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowActionModal(false)}
              className="border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleModerate}
              disabled={!actionReason.trim() || loading}
              className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/90"
            >
              {loading ? 'Processing...' : 'Apply Action'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


