"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "../context/auth.context";

interface AuthGuardProps {
    children: React.ReactNode;
}

export function AuthGuard({
    children,
}: AuthGuardProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace("/login");
        }
    }, [isLoading, user, router]);

    if (isLoading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-sm text-muted-foreground">
                    Checking authentication...
                </p>
            </div>
        );
    }

    return <>{children}</>;
}