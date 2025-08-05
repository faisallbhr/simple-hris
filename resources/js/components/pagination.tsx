import { Button } from '@/components/ui/button';
import { PaginationLinks, PaginationMeta } from '@/types/pagination';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import React from 'react';

interface PaginationProps {
    links: PaginationLinks;
    meta: PaginationMeta;
    onPageChange: (url: string) => void;
}

export function Pagination({ links, meta, onPageChange }: PaginationProps) {
    const { current_page, last_page, from, to, total } = meta;

    // page numbers to show
    const getVisiblePages = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 4;

        if (last_page <= maxVisible) {
            for (let i = 1; i <= last_page; i++) {
                pages.push(i);
            }
            return pages;
        }

        pages.push(1);

        // showing page
        if (current_page <= 3) {
            // near the beginning: show 2, 3
            for (let i = 2; i <= 3; i++) {
                if (i < last_page) pages.push(i);
            }
            pages.push('...');
        } else if (current_page >= last_page - 2) {
            // near the end: show last_page - 2, last_page - 1
            pages.push('...');
            for (let i = last_page - 2; i < last_page; i++) {
                if (i > 1) pages.push(i);
            }
        } else {
            // in the middle : show current_page - 1, current_page, current_page + 1
            pages.push('...');
            pages.push(current_page);
            pages.push('...');
        }

        // always show last page
        pages.push(last_page);

        return pages;
    };

    const handlePageClick = (page: number) => {
        const pageLink = meta.links.find((link) => link.label === page.toString() && link.url);
        if (pageLink?.url) {
            onPageChange(pageLink.url);
        }
    };

    const visiblePages = getVisiblePages();

    if (last_page <= 1) {
        return null;
    }

    return (
        <div className="flex flex-col items-center justify-between gap-4 px-2 py-4 sm:flex-row">
            {/* results */}
            <div className="text-sm text-gray-600">
                Showing {from} to {to} of {total.toLocaleString()} entries
            </div>

            {/* controls */}
            <div className="flex items-center gap-1">
                {/* first page */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(links.first)}
                    disabled={current_page === 1}
                    className="h-8 w-8 p-0"
                    title="First page"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>

                {/* previous page */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => links.prev && onPageChange(links.prev)}
                    disabled={!links.prev}
                    className="h-8 w-8 cursor-pointer p-0"
                    title="Previous page"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* page numbers */}
                <div className="flex items-center gap-1">
                    {visiblePages.map((page, index) => (
                        <React.Fragment key={index}>
                            {page === '...' ? (
                                <span className="px-2 py-1 text-sm text-gray-500">...</span>
                            ) : (
                                <Button
                                    variant={current_page === page ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handlePageClick(page as number)}
                                    className="h-8 w-8 cursor-pointer p-0"
                                    title={`Page ${page}`}
                                >
                                    {page}
                                </Button>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* next page */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => links.next && onPageChange(links.next)}
                    disabled={!links.next}
                    className="h-8 w-8 cursor-pointer p-0"
                    title="Next page"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>

                {/* last page */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(links.last)}
                    disabled={current_page === last_page}
                    className="h-8 w-8 cursor-pointer p-0"
                    title="Last page"
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
