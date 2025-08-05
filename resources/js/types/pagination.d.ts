export interface Pagination<T> {
    data: T[];
    links: PaginationLinks;
    meta: PaginationMeta;
}

export interface PaginationLinks {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
}

export interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    links: PaginationLink[];
    per_page: number;
    to: number;
    total: number;
    search?: string;
    status?: string[];
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}
