import { notFound } from "next/navigation";
import Link from "next/link";
import { Play } from "lucide-react";

import { merchants } from "@/data/merchants";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { merchantStatuses } from "@/data/filter-options";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { merchantOwners } from "@/data/filter-options";
import { Label } from "@/components/ui/label";
import MerchantTabs from "./_components/merchants-tabs";



interface MerchantPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function MerchantPage({
    params,
}: MerchantPageProps) {
    const { id } = await params;

    const merchant = merchants.find(
        (merchant) => merchant.id === Number(id)
    );

    if (!merchant) {
        notFound();
    }

    return (
        <div className="space-y-4">
            {/* Breadcrumb */}
            <Link
                href="/merchants"
                className="text-xs text-muted-foreground hover:text-foreground"
            >
                ← Merchants
            </Link>

            {/* Header */}
            <PageHeader
                title={merchant.store}
                size="sm"
                subtitle={
                    <a
                        href={`https://${merchant.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex max-w-full items-center gap-1 wrap-break-word hover:text-foreground"
                    >
                        {merchant.domain} ↗️

                    </a>
                }
            >
                <Button size="sm" className="gap-1.5 h-8">
                    <Play className="size-3" fill="currentColor" />
                    Run pipeline
                </Button>
            </PageHeader>

            {/* Pipeline Stage */}
            <Card>
                <CardContent className="px-4 py-4">
                    <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Pipeline Stage
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {merchantStatuses.map((status) => {
                            const isActive = merchant.status === status;

                            return (
                                <button
                                    key={status}
                                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${isActive
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                                        }`}
                                >
                                    {status}
                                </button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Sales */}
            <Card className="px-4 py-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Sales
                </p>
                <CardContent className="flex flex-col gap-4 p-0 sm:flex-row sm:items-end sm:justify-between">

                    <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                        {/* Assigned To */}
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">
                                Assigned to
                            </Label>

                            <Select defaultValue={merchant.owner ?? "Unassigned"}>
                                <SelectTrigger className="h-9 w-full sm:w-40">
                                    <SelectValue placeholder="Select owner" />
                                </SelectTrigger>

                                <SelectContent>
                                    {merchantOwners.map((owner) => (
                                        <SelectItem
                                            key={owner}
                                            value={owner}
                                        >
                                            {owner}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Next Follow-up */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="follow-up"
                                className="text-xs text-muted-foreground"
                            >
                                Next follow-up
                            </Label>

                            <input
                                id="follow-up"
                                type="date"
                                className="h-9 max-w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                    </div>

                    {/* Last Activity */}
                    <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-left sm:justify-end">
                        <p className="text-xs text-muted-foreground/70">
                            Last activity
                        </p>

                        <p className=" text-xs text-muted-foreground/70 ">
                            {merchant.lastActivity}
                        </p>
                    </div>
                </CardContent>
            </Card>
            {/* Merchant Summary Stats */}
            <Card>
                <CardContent className="grid grid-cols-1 p-0 sm:grid-cols-2 lg:grid-cols-4">

                    {/* Fit */}
                    <div className="border-b px-4 py-4 sm:border-r sm:border-b-0 lg:border-b-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Fit
                        </p>

                        <p className="mt-1.5 text-sm text-muted-foreground">
                            {merchant.fit ?? "—"}
                        </p>
                    </div>

                    {/* Provider */}
                    <div className="border-b px-4 py-4 sm:border-b-0 lg:border-r">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Provider
                        </p>

                        <p className="mt-1.5 text-sm font-medium text-emerald-600">
                            None - fresh
                        </p>
                    </div>

                    {/* Contacts */}
                    <div className="border-b px-4 py-4 sm:border-r sm:border-b-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Contacts
                        </p>

                        <p className="mt-1.5 text-lg font-bold">
                            0
                        </p>
                    </div>

                    {/* Opportunity */}
                    <div className="px-4 py-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Opportunity
                        </p>

                        <p className="mt-1.5 text-sm text-muted-foreground/60">
                            Not established
                        </p>
                    </div>

                </CardContent>
            </Card>

            <MerchantTabs merchant={merchant} />
        </div>
    );
}
