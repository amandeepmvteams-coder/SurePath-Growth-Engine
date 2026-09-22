import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createUser, resetUserPassword, updateUser } from "@/features/settings/api/settings.api";
import type { TeamMember } from "@/features/settings/types/settings.types";
import { useState } from "react";
import { toast } from "sonner";

interface SettingsTeamProps {
    teamMembers: TeamMember[];
    onUserUpdated: (user: TeamMember) => void;
    onUserCreated: (user: TeamMember) => void;
}

export default function SettingsTeam({ teamMembers, onUserUpdated, onUserCreated }: SettingsTeamProps) {
    const [showAddUser, setShowAddUser] = useState(false);
    const [creatingUser, setCreatingUser] = useState(false);

    const [username, setUsername] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("sales");
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
    const [resettingUserId, setResettingUserId] = useState<string | null>(null);
    const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
    const [resetPassword, setResetPassword] = useState("");

    const resetAddUserForm = () => {
        setUsername("");
        setDisplayName("");
        setEmail("");
        setPassword("");
        setRole("sales");
    };
    const handleCancelAddUser = () => {
        resetAddUserForm();
        setShowAddUser(false);
    };
    const handleCreateUser = async () => {
        if (!username.trim()) {
            toast.error("Username is required.");
            return;
        }

        if (!password) {
            toast.error("Starting password is required.");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }

        try {
            setCreatingUser(true);

            const response = await createUser({
                username: username.trim(),
                display_name: displayName.trim() || undefined,
                email: email.trim() || undefined,
                password,
                role,
            });

            onUserCreated(response.user);

            toast.success("User added successfully.");

            resetAddUserForm();
            setShowAddUser(false);
        } catch (error) {
            console.error("Failed to create user:", error);
            toast.error("Failed to add user.");
        } finally {
            setCreatingUser(false);
        }
    };

    const onResetPassword = async (userId: string) => {
        if (!resetPassword) {
            toast.error("Please enter a new password.");
            return;
        }

        if (resetPassword.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }

        try {
            setResettingUserId(userId);

            await resetUserPassword(userId, {
                password: resetPassword,
            });

            toast.success("Password reset successfully.");

            setResetPassword("");
            setResetPasswordUserId(null);
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
            toast.success('User deactivated successfully')

        } catch (error) {
            console.error("Failed to deactivate user:", error);
        } finally {
            setUpdatingUserId(null);
        }
    };
    const onActivate = async (userId: string) => {
        try {
            setUpdatingUserId(userId);

            const response = await updateUser(userId, {
                is_active: true,
            });

            onUserUpdated(response.user);
            toast.success('User activated successfully')
        } catch (error) {
            console.error("Failed to activate user:", error);
        } finally {
            setUpdatingUserId(null);
        }
    };

    const onCancelResetPassword = () => {
        setResetPassword("");
        setResetPasswordUserId(null);
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

                {showAddUser ? (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-full text-xs sm:w-auto"
                        onClick={handleCancelAddUser}
                        disabled={creatingUser}
                    >
                        Cancel
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-full text-xs sm:w-auto"
                        onClick={() => setShowAddUser(true)}
                    >
                        Add someone
                    </Button>
                )}
            </CardHeader>

            <CardContent className="p-2 space-y-2">
                {showAddUser && (
                    <div className="mb-4 rounded-md border p-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                            {/* Username */}
                            <div className="space-y-1.5">
                                <Label className="text-xs">
                                    Username
                                </Label>

                                <Input
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="admin"
                                    className="h-9"
                                    disabled={creatingUser}
                                />
                            </div>

                            {/* Display name */}
                            <div className="space-y-1.5">
                                <Label className="text-xs">
                                    Display name
                                </Label>

                                <Input
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Alex Morgan"
                                    className="h-9"
                                    disabled={creatingUser}
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <Label className="text-xs">
                                    Email
                                </Label>

                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="alex@surepath.com"
                                    className="h-9"
                                    disabled={creatingUser}
                                />
                            </div>

                            {/* Role */}
                            <div className="space-y-1.5">
                                <Label className="text-xs">
                                    Role
                                </Label>

                                <Select
                                    value={role}
                                    onValueChange={setRole}
                                    disabled={creatingUser}
                                >
                                    <SelectTrigger className="h-9 w-full">
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
                            </div>
                        </div>

                        {/* Password */}
                        <div className="mt-3 space-y-1.5">
                            <Label className="text-xs">
                                Starting password
                            </Label>

                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter starting password"
                                className="h-9"
                                disabled={creatingUser}
                            />

                            <p className="text-[11px] text-muted-foreground">
                                They can change it themselves from the account menu.
                            </p>
                        </div>

                        {/* Add button */}
                        <div className="mt-4 flex justify-end">
                            <Button
                                size="sm"
                                className="h-9"
                                onClick={handleCreateUser}
                                disabled={creatingUser}
                            >
                                {creatingUser ? "Adding..." : "Add to team"}
                            </Button>
                        </div>
                    </div>
                )}
                {teamMembers.map((member) => (
                    <div
                        key={member.id}
                        className="flex flex-col gap-3 rounded-md bg-muted px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                        {/* Left */}
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-xs font-medium">
                                    {member.display_name ?? member.username}
                                </p>

                                <span
                                    className={`rounded px-1.5 py-0.5 text-[10px] border font-medium ${member.role === "admin"
                                        ? "bg-foreground text-background rounded-lg"
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
                            {resetPasswordUserId === member.id && (
                                <div className="flex mt-1 w-full items-center gap-2 sm:order-3">
                                    <Input
                                        type="password"
                                        value={resetPassword}
                                        onChange={(e) => setResetPassword(e.target.value)}
                                        placeholder="New password (10+ characters)"
                                        className="h-9 rounded-sm bg-white flex-1 text-xs sm:max-w-64 placeholder:text-xs"
                                        disabled={resettingUserId === member.id}
                                    />
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="h-8 text-xs"
                                        onClick={onCancelResetPassword}
                                        disabled={resettingUserId === member.id}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={() => onResetPassword(member.id)}
                                        disabled={resettingUserId === member.id}
                                    >
                                        {resettingUserId === member.id
                                            ? "Setting..."
                                            : "Set password"}
                                    </Button>
                                </div>
                            )}
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
                                onClick={() => {
                                    setResetPasswordUserId(
                                        resetPasswordUserId === member.id
                                            ? null
                                            : member.id
                                    );
                                    setResetPassword("");
                                }}
                            >
                                Reset password
                            </button>
                            {
                                member.is_active ? (
                                    <button
                                        type="button"
                                        disabled={updatingUserId === member.id}
                                        onClick={() => onDeactivate(member.id)}
                                        className="text-xs cursor-pointer text-muted-foreground hover:text-destructive"
                                    >
                                        Deactivate
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={updatingUserId === member.id}
                                        onClick={() => onActivate(member.id)}
                                        className="text-xs cursor-pointer text-muted-foreground hover:text-success"
                                    >
                                        Activate
                                    </button>
                                )
                            }

                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
