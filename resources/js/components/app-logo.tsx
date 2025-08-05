import { Users } from 'lucide-react';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-slate-700 to-slate-900 shadow-sm">
                    <Users className="h-4 w-4 text-white" />
                </div>
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">Simple HRIS</span>
            </div>
        </>
    );
}
