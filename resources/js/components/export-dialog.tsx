import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Calendar, Download, FileText, Search, Upload } from 'lucide-react';
import { ReactNode, useEffect, useRef, useState } from 'react';

export interface ExportColumn {
    id: string;
    label: string;
}

export interface ExportFilters {
    search?: string;
    date_from?: string;
    date_to?: string;
    [key: string]: any;
}

export interface ExportConfig {
    format: 'xlsx' | 'csv';
    columns: string[];
    filters: ExportFilters;
    sorting?: {
        sort_by: string;
        sort_direction: 'asc' | 'desc';
    };
}

export interface ExportDialogProps {
    availableColumns: ExportColumn[];
    isExporting?: boolean;
    onExport: (config: ExportConfig) => void;
    trigger?: ReactNode;
    title?: string;
    description?: string;
    defaultColumns?: string[];
    defaultFormat?: 'xlsx' | 'csv';
    customFilters?: ReactNode;
    errors?: Record<string, string>;
    showSearchFilter?: boolean;
    showDateFilters?: boolean;
    searchPlaceholder?: string;
    searchLabel?: string;
}

export function ExportDialog({
    availableColumns,
    onExport,
    trigger,
    title = 'Export Data',
    description = 'Configure your export settings and download data',
    defaultColumns = [],
    defaultFormat = 'xlsx',
    customFilters,
    isExporting = false,
    errors = {},
    showSearchFilter = true,
    showDateFilters = true,
    searchPlaceholder = 'Filter data...',
    searchLabel = 'Search',
}: ExportDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv'>(defaultFormat);
    const [selectedColumns, setSelectedColumns] = useState<string[]>(
        defaultColumns.length > 0 ? defaultColumns : availableColumns.map((col) => col.id),
    );
    const [exportFilters, setExportFilters] = useState<ExportFilters>({
        search: '',
        date_from: '',
        date_to: '',
    });

    const handleColumnToggle = (columnId: string, checked: boolean) => {
        if (checked) {
            setSelectedColumns([...selectedColumns, columnId]);
        } else {
            setSelectedColumns(selectedColumns.filter((id) => id !== columnId));
        }
    };

    const handleSelectAllColumns = (checked: boolean) => {
        if (checked) {
            setSelectedColumns(availableColumns.map((col) => col.id));
        } else {
            setSelectedColumns([]);
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        setExportFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleExport = () => {
        if (selectedColumns.length === 0) {
            alert('Please select at least one column to export');
            return;
        }

        const config: ExportConfig = {
            format: exportFormat,
            columns: selectedColumns,
            filters: exportFilters,
        };

        onExport(config);
    };

    const wasExporting = useRef(false);

    useEffect(() => {
        if (wasExporting.current && !isExporting) {
            setIsOpen(false);
        }
        wasExporting.current = isExporting;
    }, [isExporting]);

    const defaultTrigger = (
        <Button size="sm" variant="outline" className="flex cursor-pointer items-center gap-2">
            <Upload className="h-4 w-4 text-sky-600" />
            Export
        </Button>
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
            <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col gap-6 overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-green-600" />
                        {title}
                    </DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* format */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Export Format</Label>
                        <Select value={exportFormat} onValueChange={(value: 'xlsx' | 'csv') => setExportFormat(value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                                <SelectItem value="csv">CSV (.csv)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator />

                    {/* columns */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Select Columns</Label>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="select-all"
                                    checked={selectedColumns.length === availableColumns.length}
                                    onCheckedChange={handleSelectAllColumns}
                                />
                                <Label htmlFor="select-all" className="text-xs">
                                    Select All
                                </Label>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {availableColumns.map((column) => (
                                <div key={column.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={column.id}
                                        checked={selectedColumns.includes(column.id)}
                                        onCheckedChange={(checked) => handleColumnToggle(column.id, !!checked)}
                                    />
                                    <Label htmlFor={column.id} className="text-sm">
                                        {column.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                        {selectedColumns.length === 0 && <p className="text-xs text-red-600">Please select at least one column</p>}
                    </div>

                    <Separator />

                    {/* filters */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Additional Filters</Label>
                        <div className="mt-1 grid grid-cols-1 gap-3">
                            {showSearchFilter && (
                                <div className="space-y-2">
                                    <Label htmlFor="export-search" className="flex items-center gap-1 text-xs">
                                        <Search className="h-3 w-3" />
                                        {searchLabel}
                                    </Label>
                                    <Input
                                        id="export-search"
                                        placeholder={searchPlaceholder}
                                        value={exportFilters.search || ''}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                    />
                                </div>
                            )}

                            {showDateFilters && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="date-from" className="flex items-center gap-1 text-xs">
                                            <Calendar className="h-3 w-3" />
                                            From Date
                                        </Label>
                                        <Input
                                            id="date-from"
                                            type="date"
                                            value={exportFilters.date_from || ''}
                                            onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="date-to" className="flex items-center gap-1 text-xs">
                                            <Calendar className="h-3 w-3" />
                                            To Date
                                        </Label>
                                        <Input
                                            id="date-to"
                                            type="date"
                                            value={exportFilters.date_to || ''}
                                            onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* custom filters */}
                            {customFilters && <div className="space-y-2">{customFilters}</div>}
                        </div>
                    </div>

                    <Separator />

                    {errors && Object.keys(errors).length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-red-600">Export Errors</Label>
                            <div className="space-y-1 text-xs text-red-600">
                                {Object.entries(errors).map(([key, error]) => (
                                    <div key={key}>• {error}</div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isExporting} className="cursor-pointer">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleExport}
                        disabled={isExporting || selectedColumns.length === 0}
                        className="flex cursor-pointer items-center gap-2"
                    >
                        {isExporting ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                Export {exportFormat.toUpperCase()}
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
