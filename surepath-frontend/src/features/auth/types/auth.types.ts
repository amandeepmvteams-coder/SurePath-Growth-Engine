export interface LoginRequest {
    username: string;
    password: string;
    keepSignedIn: boolean;
}

export interface AuthUser {
    id: string;
    username: string;
    display_name: string|null;
    email: string|null;
    role: string;
    last_login_at: string;
}

export interface LoginResponse {
    user: AuthUser;
}