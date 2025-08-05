import { ExportConfig } from '@/components/export-dialog';
import { useState } from 'react';

export interface UseExportOptions {
    exportRoute: string;
}

export function useExport({ exportRoute }: UseExportOptions) {
    const [isExporting, setIsExporting] = useState(false);
    const [exportErrors, setExportErrors] = useState<Record<string, string>>({});

    const handleExport = (config: ExportConfig) => {
        setIsExporting(true);
        setExportErrors({});

        const params = new URLSearchParams();

        params.append('format', config.format);

        config.columns.forEach((column) => {
            params.append('columns[]', column);
        });

        Object.entries(config.filters).forEach(([key, value]) => {
            if (value) {
                if (Array.isArray(value)) {
                    value.forEach((item) => params.append(`filters[${key}][]`, item));
                } else {
                    params.append(`filters[${key}]`, String(value));
                }
            }
        });

        const exportUrl = `${exportRoute}?${params.toString()}`;

        const link = document.createElement('a');
        link.href = exportUrl;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => {
            setIsExporting(false);
        }, 1000);
    };

    return {
        handleExport,
        isExporting,
        exportErrors,
        setExportErrors,
    };
}
