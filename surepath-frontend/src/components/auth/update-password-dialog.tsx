"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { changePassword } from "@/features/settings/api/settings.api";
import { useAuth } from "@/features/auth/context/auth.context";
import { toast } from "sonner";
import { AxiosError } from "axios";
interface UpdatePasswordDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function UpdatePasswordDialog({
    open,
    onOpenChange,
}: UpdatePasswordDialogProps) {
    const { user } = useAuth();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const resetInputFields = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setError(null);
    };
    const showError = (message: string) => {
        setError(message);

        setTimeout(() => {
            setError(null);
        }, 2000);
    };
    const handleSubmit = async () => {
        setError(null);

        if (!user?.username) {
            showError("Unable to identify the signed-in user.");
            return;
        }

        if (!currentPassword || !newPassword || !confirmPassword) {
            showError("Please fill in all password fields.");
            return;
        }

        if (newPassword.length < 10) {
            showError("New password must be at least 10 characters.");
            return;
        }

        if (newPassword === currentPassword) {
            showError(
                "New password must be different from the current password."
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            showError("New passwords do not match.");
            return;
        }

        try {
            setSaving(true);

            await changePassword({
                username: user.username,
                current_password: currentPassword,
                new_password: newPassword,
            });

            resetInputFields();
            onOpenChange(false);
        } catch (error) {
            console.error(
                "Failed to update password:",
                error
            );

            if (
                error instanceof AxiosError &&
                error.response?.status === 401
            ) {
                showError("Current password is incorrect.");
            } else {
                showError(
                    "Failed to update password. Please try again."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        resetInputFields()
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-100 p-0 gap-0">
                <DialogHeader className="border-b px-5 py-4">

                    <div>
                        <DialogTitle className="text-base">
                            Update password
                        </DialogTitle>

                        <DialogDescription className="text-xs">
                            Signed in as{" "}
                            <span className="text-foreground">
                                {user?.username}
                            </span>
                        </DialogDescription>
                    </div>


                </DialogHeader>

                <div className="space-y-4 px-5 py-5">
                    <div className="space-y-2">
                        <Label>Current password</Label>

                        <Input
                            type="password"
                            className="h-9"
                            value={currentPassword}
                            onChange={(e) =>
                                setCurrentPassword(e.target.value)
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>New password</Label>

                        <Input
                            type="password"
                            value={newPassword}
                            className="h-9"
                            onChange={(e) =>
                                setNewPassword(e.target.value)
                            }
                        />

                        <p className="text-xs text-muted-foreground">
                            At least 10 characters, and different from the
                            current one.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Confirm new password</Label>

                        <Input
                            type="password"
                            className="h-9"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(e.target.value)
                            }
                        />
                    </div>

                    <p className="text-xs leading-5 text-muted-foreground">
                        Sessions already signed in on other devices will
                        expire. Revoking them arrives with the sales
                        workspace.
                    </p>
                </div>
                {error && (
                    <p className="px-5 pb-2 text-xs text-destructive">
                        *{error}
                    </p>
                )}
                <div className="flex justify-end gap-3 border-t px-5 py-4">
                    <Button
                        variant="ghost"
                        className="h-9"
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleSubmit}
                        className="h-9"
                        disabled={saving}
                    >
                        {saving ? "Updating..." : "Update password"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}