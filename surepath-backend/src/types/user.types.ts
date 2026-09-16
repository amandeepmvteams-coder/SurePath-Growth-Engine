export interface User {
  id: string;
  username: string;
  display_name: string | null;
  email: string | null;
  password_hash: string;
  role: string;
  is_active: boolean;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface UpdateUserData {
  display_name?: string | null;
  email?: string | null;
  role?: string;
  is_active?: boolean;
}