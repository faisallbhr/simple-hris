// components/ConfirmDialog.tsx
import { AlertTriangle } from 'lucide-react';
import { ReactNode } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from './ui/alert-dialog';

interface ConfirmDialogProps {
    trigger: ReactNode;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
}

export default function ConfirmDialog({
    trigger,
    title = 'Are you absolutely sure?',
    description = 'This action cannot be undone.',
    confirmText = 'Continue',
    cancelText = 'Cancel',
    onConfirm,
}: ConfirmDialogProps) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer">{cancelText}</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} className="cursor-pointer">
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
