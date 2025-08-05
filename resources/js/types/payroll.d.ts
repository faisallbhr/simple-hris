export interface Payroll {
    id: string;
    employee: {
        id: string;
        name: string;
        email: string;
        department: string;
    };
    period_start: string;
    period_end: string;
    base_salary: number;
    details: Record<string, any> | null;
    net_salary: number;
    status: 'pending' | 'approved' | 'rejected' | 'paid';
    notes: string | null;
    payment_proof: string | null;
    paid_at: string | null;
    processed_by: {
        id: string;
        name: string;
    };
    is_generated: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}
