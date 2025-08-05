import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface FlashMessages {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

export function useFlashMessages() {
    const { flash } = usePage<{ flash: FlashMessages }>().props;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success, {
                duration: 4000,
            });
        }

        if (flash?.error) {
            toast.error(flash.error, {
                duration: 5000,
            });
        }

        if (flash?.warning) {
            toast.warning(flash.warning, {
                duration: 4500,
            });
        }

        if (flash?.info) {
            toast.info(flash.info, {
                duration: 4000,
            });
        }
    }, [flash]);
}
