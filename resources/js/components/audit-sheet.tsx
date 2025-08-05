import { Audit } from '@/types/audit';
import { PaginationLinks, PaginationMeta } from '@/types/pagination';
import { router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { FileClock } from 'lucide-react';
import { useState } from 'react';
import { DataTable } from './data-table';
import { Pagination } from './pagination';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';

interface Props {
    data: Audit[];
    meta: PaginationMeta;
    links: PaginationLinks;
}

const columns: ColumnDef<Audit>[] = [
    {
        accessorKey: 'created_at',
        header: 'Date',
    },
    {
        accessorKey: 'note',
        header: 'Note',
    },
];

export default function AuditSheet({ data, meta, links }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const handlePageChange = (url: string) => {
        setIsLoading(true);
        router.get(
            url,
            {},
            {
                preserveState: true,
                replace: true,
                only: ['audits'],
                onFinish: () => setIsLoading(false),
            },
        );
    };
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" className="cursor-pointer">
                    <FileClock className="h-4 w-4 text-purple-600" />
                    Audit
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[400px] md:w-[600px]">
                <SheetHeader>
                    <SheetTitle>History and Note</SheetTitle>
                    <SheetDescription>You can see history and note of the data here</SheetDescription>
                </SheetHeader>
                <div className="p-4">
                    <DataTable columns={columns} data={data} isLoading={isLoading} />
                    <Pagination links={links} meta={meta} onPageChange={handlePageChange} />
                </div>
            </SheetContent>
        </Sheet>
    );
}
