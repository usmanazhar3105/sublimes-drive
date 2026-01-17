import { useState } from 'react';
import { Calendar, Download, Filter, CheckSquare, Square } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent } from '../ui/card';
import { toast } from 'sonner';

interface BulkActionControlsProps {
  selectedItems: string[];
  onSelectItem: (id: string) => void;
  onSelectAll: (selectAll: boolean) => void;
  allItems: any[];
  onExportSelected: (selectedIds: string[], dateRange: { from: string; to: string }) => void;
  isSelectAllChecked: boolean;
  title: string;
}

export function BulkActionControls({
  selectedItems,
  onSelectItem,
  onSelectAll,
  allItems,
  onExportSelected,
  isSelectAllChecked,
  title
}: BulkActionControlsProps) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);

  const handleExportSelected = () => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item to export');
      return;
    }

    const dateRange = {
      from: dateFrom || '',
      to: dateTo || ''
    };

    onExportSelected(selectedItems, dateRange);
    toast.success(`Exported ${selectedItems.length} selected items`);
  };

  const handleExportAll = () => {
    const allIds = allItems.map(item => item.id);
    const dateRange = {
      from: dateFrom || '',
      to: dateTo || ''
    };

    onExportSelected(allIds, dateRange);
    toast.success(`Exported all ${allIds.length} items`);
  };

  const handleSelectAll = (checked: boolean) => {
    onSelectAll(checked);
    if (checked) {
      toast.success(`Selected all ${allItems.length} items`);
    } else {
      toast.info('Deselected all items');
    }
  };

  return (
    <Card className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] mb-6">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Bulk Selection Header */}
          <div className="flex items-center justify-between">
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDateFilter(!showDateFilter)}
              className="border-[var(--sublimes-border)]"
            >
              <Filter className="w-4 h-4 mr-2" />
              Date Filter
            </Button>
          </div>

          {/* Date Range Filter */}
          {showDateFilter && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[var(--sublimes-dark-bg)] rounded-lg border border-[var(--sublimes-border)]">
              <div>
                <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                  From Date
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--sublimes-light-text)] mb-2">
                  To Date
                </label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-[var(--sublimes-card-bg)] border-[var(--sublimes-border)] text-[var(--sublimes-light-text)]"
                />
              </div>
            </div>
          )}

          {/* Export Actions */}
          <div className="flex flex-wrap items-center gap-3">
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
              All Data ({allItems.length})
            </Button>

            {(dateFrom || dateTo) && (
              <div className="flex items-center text-sm text-[var(--sublimes-light-text)] bg-blue-500/10 px-3 py-1 rounded-full">
                <Calendar className="w-3 h-3 mr-1" />
                {dateFrom && dateTo ? `${dateFrom} to ${dateTo}` : 
                 dateFrom ? `From ${dateFrom}` : 
                 `To ${dateTo}`}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SelectableRowProps {
  id: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function SelectableRow({ id, isSelected, onSelect, children, className = '' }: SelectableRowProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-4 top-4 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(id)}
          className="border-[var(--sublimes-border)] bg-[var(--sublimes-card-bg)]"
        />
      </div>
      <div className="pl-12">
        {children}
      </div>
    </div>
  );
}