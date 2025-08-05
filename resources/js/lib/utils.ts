import { type ClassValue, clsx } from 'clsx';
import { format } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const formatDateString = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const formatDate = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
};

export const parseDate = (str: string) => {
    return str ? new Date(str) : undefined;
};

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

export const getRoleBadgeVariant = (role: string) => {
    const roleMap: Record<string, string> = {
        administrator: 'destructive',
        hr: 'secondary',
        finance: 'default',
        employee: 'outline',
    };
    return roleMap[role.toLowerCase()] || 'outline';
};

export const getRoleIcon = (roleName: string) => {
    switch (roleName.toLowerCase()) {
        case 'admin':
        case 'administrator':
            return '👑';
        case 'hr':
            return '👥';
        case 'finance':
            return '👔';
        case 'employee':
            return '👤';
        default:
            return '🔧';
    }
};
