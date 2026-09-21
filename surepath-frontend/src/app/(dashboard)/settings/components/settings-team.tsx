import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { resetUserPassword, updateUser } from "@/features/settings/api/settings.api";
import type { TeamMember } from "@/features/settings/types/settings.types";
import { useState } from "react";
import { toast } from "sonner";

interface SettingsTeamProps {
    teamMembers: TeamMember[];
    onUserUpdated: (user: TeamMember) => void;
}

export default function SettingsTeam({ teamMembers, onUserUpdated }: SettingsTeamProps) {

    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
    const [resettingUserId, setResettingUserId] = useState<string | null>(null);

    const onResetPassword = async (userId: string) => {
        const password = window.prompt("Enter the new password:");

        if (!password) {
            return;
        }

        if (password.length < 6) {
            window.alert("Password must be at least 6 characters.");
            return;
        }

        try {
            setResettingUserId(userId);

            await resetUserPassword(userId, {
                password,
            });

            toast.success("Password reset successfully.");
        } catch (error) {
            console.error("Failed to reset password:", error);
            toast.error("Failed to reset password.");
        } finally {
            setResettingUserId(null);
        }
    };
    const onRoleChange = async (
        userId: string,
        role: string
    ) => {
        try {
            setUpdatingUserId(userId);

            const response = await updateUser(userId, {
                role,
            });

            onUserUpdated(response.user);
        } catch (error) {
            console.error("Failed to update user role:", error);
        } finally {
            setUpdatingUserId(null);
        }
    };

    const onDeactivate = async (userId: string) => {
        try {
            setUpdatingUserId(userId);

            const response = await updateUser(userId, {
                is_active: false,
            });

            onUserUpdated(response.user);
        } catch (error) {
            console.error("Failed to deactivate user:", error);
        } finally {
            setUpdatingUserId(null);
        }
    };
    return (
        <Card className="gap-0 py-0">
            <CardHeader className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle className="text-sm font-semibold">
                        Team
                    </CardTitle>

                    <p className="mt-1 text-xs text-muted-foreground">
                        Who can sign in, and who merchants and follow-ups can be assigned to.
                    </p>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full text-xs sm:w-auto"
                >
                    Add someone
                </Button>
            </CardHeader>

            <CardContent className="p-2 space-y-2">
                {teamMembers.map((member) => (
                    <div
                        key={member.id}
                        className="flex flex-col gap-3 rounded-md bg-muted px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                        {/* Left */}
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">
                                    {member.display_name ?? member.username}
                                </p>

                                <span
                                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${member.role === "admin"
                                        ? "bg-foreground text-background"
                                        : "bg-muted text-muted-foreground"
                                        }`}
                                >
                                    {member.role}
                                </span>
                            </div>

                            <p className="mt-1 break-all text-[10px] text-muted-foreground">
                                {member.display_name ?? member.username}
                                {" · "}
                                {member.email ?? "No email"}
                                {" · "}
                                {member.last_login_at
                                    ? new Date(member.last_login_at).toLocaleString()
                                    : "Never signed in"}
                            </p>
                        </div>

                        {/* Right */}
                        <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:gap-3">
                            <Select
                                value={member.role}
                                onValueChange={(role) =>
                                    onRoleChange(member.id, role)
                                }
                            >
                                <SelectTrigger
                                    disabled={updatingUserId === member.id}
                                    className="h-6! w-22.5 rounded-sm bg-white text-xs!">
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="sales">
                                        Sales
                                    </SelectItem>

                                    <SelectItem value="admin">
                                        Admin
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <button
                                type="button"
                                className="text-xs cursor-pointer text-muted-foreground hover:text-foreground"
                                disabled={resettingUserId === member.id}
                                onClick={() => onResetPassword(member.id)}
                            >
                                Reset password
                            </button>

                            <button
                                type="button"
                                disabled={updatingUserId === member.id}
                                onClick={() => onDeactivate(member.id)}
                                className="text-xs cursor-pointer text-muted-foreground hover:text-destructive"
                            >
                                Deactivate
                            </button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
