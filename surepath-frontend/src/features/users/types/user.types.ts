export interface User {
    id: string;
    username: string;
    display_name: string | null;
    email: string | null;
    role: string;
    is_active: boolean;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
}