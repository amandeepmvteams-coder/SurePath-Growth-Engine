"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import { getCurrentUser, logout as logoutApi, } from "../api/auth.api";
import type { AuthUser } from "../types/auth.types";

interface AuthContextValue {
    user: AuthUser | null;
    isLoading: boolean;
    refreshUser: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(
    undefined
);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({
    children,
}: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = async () => {
        try {
            setIsLoading(true);

            const result = await getCurrentUser();

            setUser(result.user);
        } catch (error) {
            console.error(
                "Failed to get current user:",
                error
            );

            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };
    const logout = async () => {
        try {
            setIsLoading(true);

            await logoutApi();

            setUser(null);
        } catch (error) {
            console.error("Logout failed:", error);

            throw error;
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        const loadUser = async () => {
            try {
                const result = await getCurrentUser();

                setUser(result.user);
            } catch (error) {
                console.error(
                    "Failed to restore session:",
                    error
                );

                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        void loadUser();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                refreshUser,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}