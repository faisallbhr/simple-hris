export interface User {
    id: string;
    name: string;
    email: string;
    manager?: {
        id: string;
        name: string;
    };
    department: {
        id: string;
        name: string;
    };
    roles: string[];
}
