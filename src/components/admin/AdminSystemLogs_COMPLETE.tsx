import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FileText, Search, Download, AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react';

export function AdminSystemLogs_COMPLETE() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, entityFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('audit_logs')
        .select('*, profiles:user_id(email, full_name)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      if (entityFilter !== 'all') {
        query = query.eq('entity_type', entityFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = async () => {
    try {
      const csv = [
        ['Timestamp', 'User', 'Action', 'Entity', 'Details'].join(','),
        ...logs.map(log => [
          new Date(log.created_at).toISOString(),
          log.profiles?.email || 'System',
          log.action,
          log.entity_type,
          JSON.stringify(log.changes || {})
        ].join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system_logs_${new Date().toISOString()}.csv`;
      a.click();
      toast.success('Logs exported!');
    } catch (error: any) {
      toast.error('Failed to export logs');
    }
  };

  const filteredLogs = logs.filter(log =>
    log.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.entity_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: logs.length,
    create: logs.filter(l => l.action === 'create').length,
    update: logs.filter(l => l.action === 'update').length,
    delete: logs.filter(l => l.action === 'delete').length
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'update':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'delete':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#E8EAED]">System Logs</h1>
        <Button onClick={exportLogs} className="bg-[#D4AF37] text-black">
          <Download className="w-4 h-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8B92A7]">Total Logs</p>
                <p className="text-2xl font-bold text-[#E8EAED]">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8B92A7]">Created</p>
                <p className="text-2xl font-bold text-green-500">{stats.create}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8B92A7]">Updated</p>
                <p className="text-2xl font-bold text-blue-500">{stats.update}</p>
              </div>
              <Info className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1829] border-[#1A2332]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8B92A7]">Deleted</p>
                <p className="text-2xl font-bold text-red-500">{stats.delete}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-[#0F1829] border-[#1A2332]">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8B92A7]" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#1A2332] border-[#2A3342] text-[#E8EAED]"
                />
              </div>
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-48 bg-[#1A2332] border-[#2A3342] text-[#E8EAED]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-48 bg-[#1A2332] border-[#2A3342] text-[#E8EAED]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                <SelectItem value="post">Posts</SelectItem>
                <SelectItem value="listing">Listings</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="verification">Verifications</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card className="bg-[#0F1829] border-[#1A2332]">
        <CardHeader>
          <CardTitle>Activity Logs ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-[#8B92A7]">Loading...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-[#8B92A7]">No logs found</div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-4 bg-[#1A2332] rounded-lg hover:bg-[#2A3342] transition-colors"
                >
                  <div className="mt-1">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-[#E8EAED]">
                        {log.profiles?.email || 'System'}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {log.action}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {log.entity_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-[#8B92A7] mb-1">
                      {log.action} {log.entity_type} {log.entity_id ? `(ID: ${log.entity_id.slice(0, 8)}...)` : ''}
                    </p>
                    {log.changes && Object.keys(log.changes).length > 0 && (
                      <details className="text-xs text-[#8B92A7] mt-2">
                        <summary className="cursor-pointer hover:text-[#E8EAED]">View changes</summary>
                        <pre className="mt-2 p-2 bg-[#0F1829] rounded overflow-x-auto">
                          {JSON.stringify(log.changes, null, 2)}
                        </pre>
                      </details>
                    )}
                    <p className="text-xs text-[#8B92A7] mt-2">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
