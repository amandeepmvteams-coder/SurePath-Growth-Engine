"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Country, Industry } from "@/types/merchant-types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,

} from "@/components/ui/dialog";
import { toast } from "sonner";
import { industries } from "@/data/filter-options";

interface AddMerchantDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAddMerchant: (merchant: {
        domain: string;
        store: string;
        country: Country;
        industry: Industry;
    }) => void;
}
export default function AddMerchantDialog({ open, onOpenChange, onAddMerchant }: AddMerchantDialogProps) {
    const [domain, setDomain] = useState("")
    const [store, setStore] = useState("")
    const [country, setCountry] = useState<Country | "">("");
    const [industry, setIndustry] = useState<Industry | "">("");

    const resetForm = () => {
        setDomain("");
        setStore("");
        setCountry("");
        setIndustry("");
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!domain.trim()) {
            toast.error("Domain is required");
            return;
        }

        if (!store.trim()) {
            toast.error("Store name is required");
            return;
        }

        if (!country) {
            toast.error("Country is required");
            return;
        }

        if (!industry) {
            toast.error("Please select an industry");
            return;
        }

        onAddMerchant({
            domain,
            store,
            country,
            industry,
        });

        toast.success("Merchant added successfully");

        resetForm();
        onOpenChange(false);
    };
    const handleCancel = () => {
        resetForm();
        onOpenChange(false);
    }

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}

        >
            <DialogContent className="max-w-120! px-0 ">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="gap-1 border-b px-4 py-3">
                        <DialogTitle>Add merchant</DialogTitle>

                        <DialogDescription>
                            Referrals, conferences, sales-team discovery. Enters the same pipeline as a discovered merchant.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 px-4 py-4">
                        {/* Domain */}
                        <div className="space-y-2">
                            <Label htmlFor="domain">Domain</Label>

                            <Input
                                id="domain"
                                placeholder="brooklinen.com"
                                className="h-10"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                            />

                            <p className="text-xs text-muted-foreground">
                                A full URL works too — it is reduced to the domain.
                            </p>
                        </div>

                        {/* Store Name */}
                        <div className="space-y-2">
                            <Label htmlFor="store">Store name</Label>

                            <Input
                                id="store"
                                placeholder="Brooklinen"
                                className="h-10"
                                value={store}
                                onChange={(e) => setStore(e.target.value)}
                            />

                            <p className="text-xs text-muted-foreground">
                                Research corrects this if it finds a better name.
                            </p>
                        </div>

                        {/* Country + Industry */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Country */}
                            <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>

                                <Input
                                    id="country"
                                    placeholder="US"
                                    className="h-10"
                                    value={country}
                                    onChange={(e) =>
                                        setCountry(e.target.value.toUpperCase() as Country)
                                    }
                                />

                                <p className="text-xs text-muted-foreground">
                                    Two-letter code.
                                </p>
                            </div>

                            {/* Industry */}
                            <div className="space-y-2">
                                <Label>Industry</Label>

                                <Select
                                    value={industry}
                                    onValueChange={(value) => setIndustry(value as Industry)}
                                >
                                    <SelectTrigger className="w-full h-10! data-placeholder:text-black!">
                                        <SelectValue placeholder="Select industry" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="all">All Industries</SelectItem>

                                        {industries.map((industry) => (
                                            <SelectItem key={industry} value={industry}>
                                                {industry}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <p className="text-xs text-muted-foreground">
                                    Pick the closest — Other if none fit.
                                </p>
                            </div>
                        </div>


                    </div>

                    <DialogFooter className="py-3 m-0 bg-transparent">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-10 px-3 text-xs"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            className="h-10 bg-muted-foreground px-3 text-xs hover:bg-muted-foreground/90"

                        >
                            Add merchant
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>

        </Dialog>
    );
}