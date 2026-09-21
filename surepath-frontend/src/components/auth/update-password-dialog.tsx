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


    const resetInputFields = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    }

    const handleSubmit = async () => {
        if (!user?.username) {
            return;
        }

        if (!currentPassword || !newPassword || !confirmPassword) {
            return;
        }

        if (newPassword.length < 10) {
            return;
        }

        if (newPassword === currentPassword) {
            return;
        }

        if (newPassword !== confirmPassword) {
            return;
        }

        try {
            await changePassword({
                username: user.username,
                current_password: currentPassword,
                new_password: newPassword,
            });

            resetInputFields();
            onOpenChange(false);
            toast.success("Password Changed Successfully")
        } catch (error) {
            console.error(
                "Failed to update password:",
                error
            );
            // toast.error(error)

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

                <div className="flex justify-end gap-3 border-t px-5 py-4">
                    <Button
                        variant="ghost"
                        className="h-9"
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>

                    <Button onClick={handleSubmit}
                        className="h-9"
                    >
                        Update password
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}