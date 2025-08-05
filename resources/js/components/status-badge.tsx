import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Badge } from './ui/badge';

export default function StatusBadge({ status }: { status: string }) {
    const getStatusConfig = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return {
                    variant: 'secondary' as const,
                    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    icon: AlertCircle,
                };
            case 'approved':
                return {
                    variant: 'secondary' as const,
                    className: 'bg-green-100 text-green-800 border-green-200',
                    icon: CheckCircle,
                };
            case 'rejected':
                return {
                    variant: 'destructive' as const,
                    className: 'bg-red-100 text-red-800 border-red-200',
                    icon: XCircle,
                };
            case 'paid':
                return {
                    variant: 'secondary' as const,
                    className: 'bg-blue-100 text-blue-800 border-blue-200',
                    icon: CheckCircle,
                };
            default:
                return {
                    variant: 'outline' as const,
                    className: '',
                    icon: Clock,
                };
        }
    };

    const config = getStatusConfig(status);
    const IconComponent = config.icon;

    return (
        <Badge variant={config.variant} className={`${config.className} px-3 py-1 text-sm font-medium`}>
            <IconComponent className="mr-1 h-3 w-3" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    );
}
