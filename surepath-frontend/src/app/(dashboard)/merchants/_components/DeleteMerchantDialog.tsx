"use client";

import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface DeleteMerchantDialogProps {
    merchantName: string;
    onDelete: () => void;
    onDialogOpenChange?: (open: boolean) => void;
}

export default function DeleteMerchantDialog({
    merchantName,
    onDelete,
    onDialogOpenChange,
}: DeleteMerchantDialogProps) {
    const [open, setOpen] = useState(false);
    const handleOpenChange = (value: boolean) => {
        setOpen(value);
        onDialogOpenChange?.(value);
    };
    return (
        <AlertDialog
            open={open}
            onOpenChange={handleOpenChange}
        >
            <AlertDialogTrigger asChild>
                <Button
                    data-row-action
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1.5 text-xs"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                >
                    <Trash2 className="size-3" />
                    Delete
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Delete merchant?
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        Are you sure you want to delete{" "}
                        <span className="font-medium text-foreground">
                            {merchantName}
                        </span>
                        ? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel
                        onClick={(e) => e.stopPropagation()}
                    >
                        Cancel
                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="bg-destructive! text-destructive-foreground! hover:bg-destructive/90!"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}