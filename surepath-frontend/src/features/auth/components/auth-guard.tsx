
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { useAuth } from "../context/auth.context";

interface AuthGuardProps {
    children: React.ReactNode;
}

function AuthLoading() {
    return (
        <div
            className="flex min-h-screen items-center justify-center"
            role="status"
            aria-live="polite"
            aria-label="Checking authentication"
        >
            <div className="flex flex-col items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <ShieldCheck
                        className="h-6 w-6 text-muted-foreground"
                        aria-hidden="true"
                    />
                </div>

                <div className="text-center">
                    <p className="text-sm font-medium">
                        Checking authentication
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Please wait...
                    </p>
                </div>
            </div>
        </div>
    );
}

export function AuthGuard({ children }: AuthGuardProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const hasRedirected = useRef(false);

    useEffect(() => {
        if (isLoading || user || hasRedirected.current) {
            return;
        }

        hasRedirected.current = true;
        router.replace("/login");
    }, [isLoading, user, router]);

    if (isLoading) {
        return <AuthLoading />;
    }

    if (!user) {
        return <AuthLoading />;
    }

    return <>{children}</>;
}
