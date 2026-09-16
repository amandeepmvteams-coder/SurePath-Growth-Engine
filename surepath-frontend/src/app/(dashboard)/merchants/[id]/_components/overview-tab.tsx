import { Card, CardContent } from "@/components/ui/card";
import type { Merchant } from "@/types/merchant-types";

interface OverviewTabProps {
    merchant: Merchant;
}

export default function OverviewTab({
    merchant,
}: OverviewTabProps) {
    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">

            {/* Left Column */}
            <div className="space-y-4">
                {/* Fit Score */}
                <Card>
                    <CardContent className="p-0">
                        {/* Header */}
                        <div className="border-b px-4 py-3">
                            <p className="text-sm font-semibold">
                                Fit score
                            </p>
                        </div>

                        {/* Content */}
                        <div className="px-4 py-4">
                            <p className="text-sm text-muted-foreground">
                                Not scored yet — run scoring once research and detection have completed.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Provider Detection */}
                <Card>
                    <CardContent className="p-0">
                        {/* Header */}
                        <div className="border-b px-4 py-3">
                            <p className="text-sm font-semibold">
                                Provider detection
                            </p>
                        </div>

                        {/* Content */}
                        <div className="space-y-3 px-4 py-4">
                            {/* Status */}
                            <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                                <span className="size-1.5 rounded-full bg-success" />

                                <span>
                                    No provider found. A fresh prospect — there is no incumbent to displace.
                                </span>
                            </div>

                            {/* Action */}
                            <button
                                type="button"
                                className="text-sm font-medium hover:underline"
                            >
                                Record a provider we missed
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* Research Summary */}
                <Card>
                    <CardContent className="p-0">
                        {/* Header */}
                        <div className="border-b px-4 py-3">
                            <p className="text-sm font-semibold">
                                Research summary
                            </p>
                        </div>

                        {/* Content */}
                        <div className="px-4 py-4">
                            <p className="text-sm text-muted-foreground">
                                Not generated yet — run AI enrichment.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
                {/* Opportunity */}
                <Card>
                    <CardContent className="p-0">
                        {/* Header */}
                        <div className="border-b px-4 py-3">
                            <p className="text-sm font-semibold">
                                Opportunity
                            </p>
                        </div>

                        {/* Content */}
                        <div className="space-y-4 px-4 py-4">
                            <p className="text-sm text-muted-foreground">
                                Not established.
                            </p>

                            <button
                                type="button"
                                className="text-sm font-medium hover:underline"
                            >
                                Enter order volume
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* Details */}
                <Card>
                    <CardContent className="p-0">
                        {/* Header */}
                        <div className="border-b px-4 py-3">
                            <p className="text-sm font-semibold">
                                Details
                            </p>
                        </div>

                        {/* Details */}
                        <div className="space-y-4 px-4 py-4">
                            <div>
                                <p className="text-xs font-medium uppercase text-muted-foreground">
                                    Platform
                                </p>
                                <p className="mt-1 text-sm">
                                    {merchant.shopify ? "Shopify" : "Unknown"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase text-muted-foreground">
                                    Shopify confidence
                                </p>
                                <p className="mt-1 text-sm">
                                    {merchant.shopify !== undefined
                                        ? `${merchant.shopify}%`
                                        : "—"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase text-muted-foreground">
                                    Country
                                </p>
                                <p className="mt-1 text-sm">
                                    {merchant.country}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase text-muted-foreground">
                                    Industry
                                </p>
                                <p className="mt-1 text-sm">
                                    {merchant.industry}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase text-muted-foreground">
                                    Source
                                </p>
                                <p className="mt-1 text-sm">
                                    {merchant.source}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase text-muted-foreground">
                                    Last researched
                                </p>
                                <p className="mt-1 text-sm">
                                    {merchant.lastActivity ?? "—"}
                                </p>
                            </div>

                            {/* Action */}
                            <button
                                type="button"
                                className="text-sm font-medium hover:underline"
                            >
                                Edit details
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* Contacts */}
                <Card>
                    <CardContent className="p-0">
                        {/* Header */}
                        <div className="border-b px-4 py-3">
                            <p className="text-sm font-semibold">
                                Contacts
                            </p>
                        </div>

                        {/* Content */}
                        <div className="space-y-3 px-4 py-4">
                            <p className="text-sm text-muted-foreground">
                                No contacts added yet.
                            </p>

                            <button
                                type="button"
                                className="text-sm font-medium hover:underline"
                            >
                                Add contact
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* Stage History */}
                <Card>
                    <CardContent className="p-0">
                        {/* Header */}
                        <div className="border-b px-4 py-3">
                            <p className="text-sm font-semibold">
                                Stage history
                            </p>
                        </div>

                        {/* Empty state */}
                        <div className="px-4 py-4">
                            <p className="text-sm text-muted-foreground">
                                No stage changes.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}