export interface LoginRequest {
    username: string;
    password: string;
}

export interface AuthUser {
    id: string;
    username: string;
    display_name: string;
    email: string;
    role: string;
    last_login_at: string;
}

export interface LoginResponse {
    user: AuthUser;
}