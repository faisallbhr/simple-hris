export interface Role {
    id: string;
    name: string;
    guard_name: string;
    description?: string;
    permissions: Permission[];
    users_count: number;
    created_at: string;
    updated_at: string;
}
