"use client";

import { useState, type SubmitEventHandler } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, User, LockKeyhole, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/features/auth/api/auth.api";

export default function Page() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [keepSignedIn, setKeepSignedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (
        event
    ) => {
        event.preventDefault();

        if (!username || !password) {
            toast.error("Username and password are required");
            return;
        }

        try {
            setIsLoading(true);

            const result = await login({
                username,
                password,
                keepSignedIn,
            });

            // console.log("Logged in user:", result.user);

            toast.success("Login successful!");

            router.push("/dashboard");
        } catch (error) {
            console.error("Login failed:", error);

            if (
                error instanceof Error &&
                error.message
            ) {
                toast.error("Credentials were not accepted");
            } else {
                toast.error("Something went wrong. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <main className="min-h-screen bg-foreground">
            <div className="flex min-h-screen flex-col items-center justify-center px-4">

                {/* Brand */}
                <div className="mb-7 flex flex-col items-center text-center">
                    <div className="mb-4 flex size-14 items-center justify-center rounded-xl bg-background">
                        <TrendingUp
                            className="size-6 text-foreground"
                            strokeWidth={2.5}
                        />
                    </div>

                    <h1 className="text-xl font-bold text-background">
                        SurePath Growth AI Engine
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Merchant discovery, scoring and pipeline
                    </p>
                </div>

                {/* Login Card */}
                <Card className="w-full max-w-92.5 border-0 bg-[#f5f5f5] py-0 shadow-lg">
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">


                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="username"
                                    className="text-sm font-medium text-[#3f4854]"
                                >
                                    Username
                                </Label>

                                <div className="relative">
                                    <User
                                        className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8b95a1]"
                                        strokeWidth={1.8}
                                    />

                                    <Input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="admin"
                                        disabled={isLoading}
                                        className="h-11 rounded-xl border-[#cfd2d6] bg-[#f7f7f7] placeholder:text-[#8b95a1] text-foreground pl-10 shadow-sm focus-visible:ring-1"
                                    />
                                </div>
                            </div>


                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="password"
                                    className="text-sm font-medium text-[#3f4854]"
                                >
                                    Password
                                </Label>

                                <div className="relative">
                                    <LockKeyhole
                                        className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8b95a1]"
                                        strokeWidth={1.8}
                                    />

                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        disabled={isLoading}
                                        className="h-11 rounded-xl border-[#cfd2d6] bg-[#f7f7f7] pl-10 pr-10 shadow-sm text-foreground
                                        placeholder:text-[#8b95a1] focus-visible:ring-1"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        disabled={isLoading}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b95a1] transition-colors cursor-pointer hover:text-[#3f4854] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="size-4" strokeWidth={1.8} />
                                        ) : (
                                            <Eye className="size-4" strokeWidth={1.8} />
                                        )}
                                    </button>
                                </div>
                            </div>


                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="keep-signed-in"
                                    checked={keepSignedIn}
                                    onCheckedChange={(checked) =>
                                        setKeepSignedIn(checked === true)
                                    }
                                    disabled={isLoading}
                                    className="border-black data-[state=checked]:border-black data-[state=checked]:bg-[#202124] data-[state=checked]:text-background"
                                />

                                <Label
                                    htmlFor="keep-signed-in"
                                    className="cursor-pointer text-sm font-normal text-[#596473]"
                                >
                                    Keep me signed in for 30 days
                                </Label>
                            </div>


                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="h-11 w-full rounded-xl bg-[#202124] font-semibold text-white shadow-md transition-colors hover:bg-[#303136]"
                            >
                                {isLoading
                                    ? "Signing in..."
                                    : "Sign in"}
                            </Button>


                            <div className="h-px bg-border" />

                            <p className="text-center text-xs leading-5 text-[#7b8794]">
                                One shared admin account for the team. Individual logins and
                                roles arrive with the sales workspace.
                            </p>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="mt-6 text-xs text-muted-foreground">
                    SurePath Growth AI Engine · internal tool
                </p>
            </div>
        </main>
    );
}