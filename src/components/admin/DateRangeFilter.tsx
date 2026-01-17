import { useState } from 'react';
import { Calendar, Download, Filter, CheckSquare, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';

interface DateRangeFilterProps {
  onExportData?: (selectedIds: string[], dateRange: { from: string; to: string }) => void;
  onSelectAll?: (selectAll: boolean) => void;
  selectedItems?: string[];
  allItems?: any[];
  title?: string;
  showBulkActions?: boolean;
  className?: string;
}

export function DateRangeFilter({
  onExportData,
  onSelectAll,
  selectedItems = [],
  allItems = [],
  title = 'Items',
  showBulkActions = true,
  className = ''
}: DateRangeFilterProps) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(true);

  const isSelectAllChecked = selectedItems.length === allItems.length && allItems.length > 0;

  const handleExportSelected = () => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item to export');
      return;
    }

    const dateRange = {
      from: dateFrom || '',
      to: dateTo || ''
    };

    onExportData?.(selectedItems, dateRange);
    toast.success(`Exported ${selectedItems.length} selected items`);
  };

  const handleExportAll = () => {
    const allIds = allItems.map(item => item.id);
    const dateRange = {
      from: dateFrom || '',
      to: dateTo || ''
    };

    onExportData?.(allIds, dateRange);
    toast.success(`Exported all ${allIds.length} items`);
  };

  const handleSelectAll = (checked: boolean) => {
    onSelectAll?.(checked);
    if (checked) {
      toast.success(`Selected all ${allItems.length} items`);
    } else {
      toast.info('Deselected all items');
    }
  };

  const clearDates = () => {
    setDateFrom('');
    setDateTo('');
    toast.info('Date filters cleared');
  };

  return (
    <Card className={`bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] mb-6 ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {showBulkActions && (
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={isSelectAllChecked}
                    onCheckedChange={handleSelectAll}
                    className="border-[var(--sublimes-border)]"
                  />
                  <span className="text-[var(--sublimes-light-text)] font-medium">
                    Select All ({selectedItems.length}/{allItems.length} selected)
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDateFilter(!showDateFilter)}
                className="border-[var(--sublimes-border)]"
              >
                <Calendar className="w-4 h-4 mr-2" />
                {showDateFilter ? 'Hide' : 'Show'} Date Range
              </Button>
            </div>
          </div>

          {/* Date Range Filter */}
          {showDateFilter && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[var(--sublimes-dark-bg)] rounded-lg border border-[var(--sublimes-border)]">
                <div>
                  <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    placeholder="Select start"
                    className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    placeholder="Select end"
                    className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                  />
                </div>
              </div>

              {/* Clear Dates */}
              {(dateFrom || dateTo) && (
                <div className="flex items-center justify-between bg-blue-500/10 p-3 rounded-lg">
                  <div className="flex items-center text-sm text-[var(--sublimes-light-text)]">
                    <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                    <span>
                      {dateFrom && dateTo ? `${dateFrom} to ${dateTo}` : 
                       dateFrom ? `From ${dateFrom}` : 
                       `To ${dateTo}`}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearDates}
                    className="text-blue-500 hover:text-blue-400"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear Dates
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Export Actions */}
          {showBulkActions && onExportData && (
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[var(--sublimes-border)]">
              <Button
                onClick={handleExportSelected}
                disabled={selectedItems.length === 0}
                className="bg-[var(--sublimes-gold)] text-[var(--sublimes-dark-bg)] hover:bg-[var(--sublimes-gold)]/90"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Selected ({selectedItems.length})
              </Button>
              
              <Button
                variant="outline"
                onClick={handleExportAll}
                className="border-[var(--sublimes-border)]"
              >
                <Download className="w-4 h-4 mr-2" />
                Export All ({allItems.length})
              </Button>

              <div className="text-sm text-gray-400 ml-auto">
                {selectedItems.length > 0 ? 
                  `${selectedItems.length} of ${allItems.length} items selected` :
                  `${allItems.length} total items`
                }
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}