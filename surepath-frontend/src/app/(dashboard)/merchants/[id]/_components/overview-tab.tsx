import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { Merchant } from "@/features/merchants/types/merchant.types";
import type { MerchantContact } from "@/features/contacts/types/contact.types";
import type { MerchantScore } from "@/features/scoring/types/scoring.types";
import { getMerchantProfile, updateMerchantProfile, } from "@/features/profiles/api/profile.api";
import type { MerchantProfile } from "@/features/profiles/types/profile.types";
import type { MerchantDetection } from "@/features/detections/types/detection.types";
import { getMerchantResearch } from "@/features/research/api/research.api";
import type { ResearchRun } from "@/features/research/types/research.types";
import { getMerchantStatusHistory } from "@/features/merchants/api/status-history.api";
import type { MerchantStatusHistory } from "@/features/merchants/types/status-history.types";
import { runScoring } from "@/features/pipeline/api/pipeline.api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateMerchant } from "@/features/merchants/api/merchants.api";
import { createMerchantContact } from "@/features/contacts/api/contacts.api";
import { getCurrentUser } from "@/features/auth/api/auth.api";

interface OverviewTabProps {
    merchant: Merchant;
    contacts: MerchantContact[];
    scores: MerchantScore[];
    detections: MerchantDetection[];
    summaryLoading: boolean;
    onScoresUpdated: () => Promise<void>;
    onMerchantRefresh: () => Promise<void>;
    onContactsUpdated: () => Promise<void>;
}

export default function OverviewTab({
    merchant,
    contacts,
    scores,
    detections,
    summaryLoading,
    onScoresUpdated,
    onMerchantRefresh,
    onContactsUpdated,
}: OverviewTabProps) {

    const [profile, setProfile] = useState<MerchantProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [researchRuns, setResearchRuns] = useState<ResearchRun[]>([]);
    const [researchLoading, setResearchLoading] = useState(true);
    const [statusHistory, setStatusHistory] = useState<MerchantStatusHistory[]>([]);
    const [statusHistoryLoading, setStatusHistoryLoading] = useState(true);
    const [isEditingOpportunity, setIsEditingOpportunity] = useState(false);
    const [monthlyOrders, setMonthlyOrders] = useState("");
    const [averageOrderValue, setAverageOrderValue] = useState("");
    const [savingOpportunity, setSavingOpportunity] = useState(false);
    const [isEditingDetails, setIsEditingDetails] = useState(false);

    const [storeName, setStoreName] = useState("");
    const [industry, setIndustry] = useState("");
    const [country, setCountry] = useState("");

    const [isAddingContact, setIsAddingContact] = useState(false);

    const [contactName, setContactName] = useState("");
    const [contactRole, setContactRole] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [contactIsPrimary, setContactIsPrimary] = useState(false);

    const [savingContact, setSavingContact] = useState(false);
    const [savingDetails, setSavingDetails] = useState(false);



    const latestScore = scores[0];

    const latestCompletedResearch = researchRuns.find(
        (run) => run.status === "completed"
    );
    const shopifyDetection = detections.find(
        (detection) =>
            detection.provider_name.toLowerCase() === "shopify"
    );
    useEffect(() => {
        const loadStatusHistory = async () => {
            try {
                setStatusHistoryLoading(true);

                const result = await getMerchantStatusHistory(merchant.id);

                setStatusHistory(result);
            } catch (error) {
                console.error(
                    "Failed to load merchant status history:",
                    error
                );
            } finally {
                setStatusHistoryLoading(false);
            }
        };

        void loadStatusHistory();
    }, [merchant.id]);

    useEffect(() => {
        const loadResearch = async () => {
            try {
                setResearchLoading(true);

                const result = await getMerchantResearch(merchant.id);

                setResearchRuns(result);
            } catch (error) {
                console.error(
                    "Failed to load merchant research:",
                    error
                );
            } finally {
                setResearchLoading(false);
            }
        };

        void loadResearch();
    }, [merchant.id]);



    useEffect(() => {
        const loadProfile = async () => {
            try {
                setProfileLoading(true);

                const result = await getMerchantProfile(merchant.id);

                setProfile(result);

                if (result) {
                    setMonthlyOrders(
                        result.estimated_monthly_orders?.toString() ?? ""
                    );

                    setAverageOrderValue(
                        result.avg_order_value?.toString() ?? ""
                    );
                } else {
                    setMonthlyOrders("");
                    setAverageOrderValue("");
                }
            } catch (error) {
                console.error("Failed to load merchant profile:", error);
            } finally {
                setProfileLoading(false);
            }
        };

        void loadProfile();
    }, [merchant.id]);

    const handleEditDetails = () => {
        setStoreName(merchant.store_name ?? "");
        setIndustry(merchant.industry ?? "");
        setCountry(merchant.country ?? "");

        setIsEditingDetails(true);
    };
    const handleSaveDetails = async () => {
        try {
            setSavingDetails(true);

            await updateMerchant(merchant.id, {
                store_name: storeName.trim() || null,
                industry: industry.trim() || null,
                country: country.trim() || null,
            });

            await onMerchantRefresh();
            await onScoresUpdated();

            setIsEditingDetails(false);
        } catch (error) {
            console.error("Failed to update merchant details:", error);
        } finally {
            setSavingDetails(false);
        }
    };
    const handleCancelDetails = () => {
        setStoreName(merchant.store_name ?? "");
        setIndustry(merchant.industry ?? "");
        setCountry(merchant.country ?? "");

        setIsEditingDetails(false);
    };

    const handleSaveContact = async () => {
        if (!contactName.trim()) {
            return;
        }

        try {
            setSavingContact(true);

            const currentUser = await getCurrentUser();

            const userId = currentUser.user.id;

            await createMerchantContact(merchant.id, {
                name: contactName.trim(),
                role: contactRole.trim() || undefined,
                email: contactEmail.trim() || undefined,
                phone: contactPhone.trim() || undefined,
                is_primary: contactIsPrimary,
                created_by: userId,
                owner_id: userId,
            });

            await onContactsUpdated();

            setContactName("");
            setContactRole("");
            setContactEmail("");
            setContactPhone("");
            setContactIsPrimary(false);

            setIsAddingContact(false);
        } catch (error) {
            console.error("Failed to create merchant contact:", error);
        } finally {
            setSavingContact(false);
        }
    };

    const handleCancelContact = () => {
        setContactName("");
        setContactRole("");
        setContactEmail("");
        setContactPhone("");
        setContactIsPrimary(false);

        setIsAddingContact(false);
    };

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">

            {/* Left Column */}
            <div className="min-w-0 space-y-4">
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
                            {summaryLoading ? (
                                <p className="text-sm text-muted-foreground">
                                    Loading score...
                                </p>
                            ) : latestScore ? (
                                <div className="space-y-4">
                                    {/* Main score */}
                                    <div>
                                        <p className="text-2xl font-semibold">
                                            {latestScore.score}
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            {latestScore.score_factors_assessed} /{" "}
                                            {latestScore.score_factors_total} factors assessed
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Scored{" "}
                                            {new Date(
                                                latestScore.scored_at
                                            ).toLocaleString()}
                                        </p>
                                    </div>

                                    {/* Score breakdown */}
                                    <div className="space-y-3 border-t pt-4">
                                        <p className="text-sm font-semibold">
                                            Score breakdown
                                        </p>

                                        {Object.entries(
                                            latestScore.score_breakdown
                                        ).map(([factor, breakdown]) => (
                                            <div
                                                key={factor}
                                                className="flex items-start justify-between gap-4"
                                            >
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium capitalize">
                                                        {factor.replaceAll("_", " ")}
                                                    </p>

                                                    <p className="text-xs text-muted-foreground">
                                                        {breakdown.reason}
                                                    </p>
                                                </div>

                                                <div className="flex shrink-0 items-center gap-2">
                                                    <span className="text-xs font-medium">
                                                        {breakdown.points_earned}/
                                                        {breakdown.maximum_points}
                                                    </span>

                                                    <span className="text-xs text-muted-foreground">
                                                        {breakdown.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-2xl font-semibold">—</p>
                            )}
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
                            {summaryLoading ? (
                                <p className="text-sm text-muted-foreground">
                                    Loading provider detection...
                                </p>
                            ) : detections.length > 0 ? (
                                <div className="space-y-2">
                                    {detections.map((detection) => (
                                        <div
                                            key={detection.id}
                                            className="rounded-md border px-3 py-2 text-sm"
                                        >
                                            <p className="font-medium">
                                                {detection.provider_name}
                                            </p>

                                            <p className="text-xs text-muted-foreground">
                                                {detection.is_detected
                                                    ? "Detected"
                                                    : "Not detected"}
                                                {detection.confidence !== null &&
                                                    ` • ${Math.round(
                                                        detection.confidence * 100
                                                    )}% confidence`}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Provider detection not available.
                                </p>
                            )}
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
                            {profileLoading ? (
                                <p className="text-sm text-muted-foreground">
                                    Loading research summary...
                                </p>
                            ) : profile?.research_summary ? (
                                <p className="text-sm whitespace-pre-wrap">
                                    {profile.research_summary}
                                </p>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Not generated yet — run AI enrichment.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column */}
            <div className="min-w-0 space-y-4">
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
                            {summaryLoading ? (
                                <p className="text-sm text-muted-foreground">
                                    Loading opportunity...
                                </p>
                            ) : latestScore?.opportunity_value !== null &&
                                latestScore?.opportunity_value !== undefined ? (
                                <div>
                                    <p className="text-2xl font-semibold">
                                        {latestScore.opportunity_value.toLocaleString()}
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                        Estimated opportunity value
                                    </p>
                                </div>
                            ) : !isEditingOpportunity ? (
                                <div className="space-y-3">
                                    <p className="text-sm text-muted-foreground">
                                        Not established.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => setIsEditingOpportunity(true)}
                                        className="text-sm font-medium cursor-pointer hover:underline"
                                    >
                                        Enter order volume
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Monthly orders */}
                                    <div className="space-y-1.5">
                                        <label
                                            htmlFor="monthly-orders"
                                            className="text-xs font-medium"
                                        >
                                            Monthly orders
                                        </label>

                                        <input
                                            id="monthly-orders"
                                            type="number"
                                            min="0"
                                            value={monthlyOrders}
                                            onChange={(event) =>
                                                setMonthlyOrders(event.target.value)
                                            }
                                            className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
                                            placeholder="Enter monthly orders"
                                        />
                                    </div>

                                    {/* Average order value */}
                                    <div className="space-y-1.5">
                                        <label
                                            htmlFor="average-order-value"
                                            className="text-xs font-medium"
                                        >
                                            Average order value
                                        </label>

                                        <input
                                            id="average-order-value"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={averageOrderValue}
                                            onChange={(event) =>
                                                setAverageOrderValue(event.target.value)
                                            }
                                            className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
                                            placeholder="Enter average order value"
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            disabled={savingOpportunity}
                                            onClick={async () => {
                                                const orders = Number(monthlyOrders);
                                                const orderValue = Number(averageOrderValue);

                                                if (
                                                    !Number.isFinite(orders) ||
                                                    orders < 0 ||
                                                    !Number.isFinite(orderValue) ||
                                                    orderValue < 0
                                                ) {
                                                    return;
                                                }

                                                try {
                                                    setSavingOpportunity(true);

                                                    const updatedProfile =
                                                        await updateMerchantProfile(
                                                            merchant.id,
                                                            {
                                                                estimated_monthly_orders: orders,
                                                                avg_order_value: orderValue.toString(),
                                                            }
                                                        );

                                                    setProfile(updatedProfile);

                                                    await runScoring([merchant.id]);

                                                    await onScoresUpdated();

                                                    setIsEditingOpportunity(false);
                                                } catch (error) {
                                                    console.error(
                                                        "Failed to update opportunity:",
                                                        error
                                                    );
                                                } finally {
                                                    setSavingOpportunity(false);
                                                }
                                            }}
                                            className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium cursor-pointer text-background disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {savingOpportunity ? "Saving..." : "Save"}
                                        </button>

                                        <button
                                            type="button"
                                            disabled={savingOpportunity}
                                            onClick={() => setIsEditingOpportunity(false)}
                                            className="text-sm font-medium hover:underline cursor-pointer disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Details */}

                <Card>
                    {/* Header */}
                    <div className="border-b px-4 py-3">
                        <p className="text-sm font-semibold">
                            Details
                        </p>
                    </div>
                    <CardContent className="p-0">


                        {/* Details */}
                        <div className="space-y-4 px-4 py-4">
                            <div>
                                <p className="text-xs font-medium uppercase text-muted-foreground">
                                    Platform
                                </p>
                                <p className="mt-1 wrap-break-word text-sm">
                                    {merchant.platform || "Unknown"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase text-muted-foreground">
                                    Shopify confidence
                                </p>
                                <p className="mt-1 wrap-break-word text-sm">
                                    {shopifyDetection?.confidence !== null &&
                                        shopifyDetection?.confidence !== undefined
                                        ? `${Math.round(shopifyDetection.confidence * 100)}%`
                                        : "—"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase text-muted-foreground">
                                    Country
                                </p>
                                <p className="mt-1 wrap-break-word text-sm">
                                    {merchant.country}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase text-muted-foreground">
                                    Industry
                                </p>
                                <p className="mt-1 wrap-break-word text-sm">
                                    {merchant.industry}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase text-muted-foreground">
                                    Source
                                </p>
                                <p className="mt-1 wrap-break-word text-sm">
                                    {merchant.source || "—"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase text-muted-foreground">
                                    Last researched
                                </p>
                                <p className="mt-1 wrap-break-word text-sm">
                                    {researchLoading ? (
                                        "Loading..."
                                    ) : latestCompletedResearch?.finished_at ? (
                                        new Date(
                                            latestCompletedResearch.finished_at
                                        ).toLocaleString()
                                    ) : (
                                        "—"
                                    )}
                                </p>
                            </div>

                            {/* Action */}
                            <button
                                type="button"
                                onClick={handleEditDetails}
                                className="text-sm font-medium cursor-pointer hover:underline"
                            >
                                Edit details
                            </button>
                        </div>
                    </CardContent>
                    {/* </CardContent> */}
                    {isEditingDetails && (
                        <CardContent>
                            {/* Store name */}

                            <div className="space-y-1">
                                <label className="text-[11px] text-muted-foreground">
                                    Store name
                                </label>

                                <Input
                                    value={storeName}
                                    onChange={(event) =>
                                        setStoreName(event.target.value)
                                    }
                                />
                            </div>

                            {/* Industry */}
                            <div className="space-y-1">
                                <label className="text-[11px] text-muted-foreground">
                                    Industry
                                </label>

                                <Input
                                    value={industry}
                                    onChange={(event) =>
                                        setIndustry(event.target.value)
                                    }
                                />
                            </div>

                            {/* Country */}
                            <div className="space-y-1">
                                <label className="text-[11px] text-muted-foreground">
                                    Country
                                </label>

                                <Input
                                    value={country}
                                    onChange={(event) =>
                                        setCountry(event.target.value)
                                    }
                                />
                            </div>

                            <p className="text-[11px] leading-4 text-muted-foreground">
                                Saving marks these fields as corrected by a person —
                                automated research will not overwrite it.
                            </p>

                            <div className="flex items-center gap-4 pt-1">
                                <Button
                                    type="button"
                                    onClick={handleSaveDetails}
                                    disabled={savingDetails}
                                    className="h-8 px-4 text-xs"
                                >
                                    {savingDetails ? "Saving..." : "Save"}
                                </Button>

                                <button
                                    type="button"
                                    onClick={handleCancelDetails}
                                    disabled={savingDetails}
                                    className="text-xs text-muted-foreground cursor-pointer hover:text-foreground"
                                >
                                    Cancel
                                </button>
                            </div>
                        </CardContent>
                    )}
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
                            {summaryLoading ? (
                                <p className="text-sm text-muted-foreground">
                                    Loading contacts...
                                </p>
                            ) : contacts.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No contacts added yet.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {contacts.map((contact) => (
                                        <div
                                            key={contact.id}
                                            className="rounded-md border p-3"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium">
                                                        {contact.name}
                                                    </p>

                                                    {contact.role && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {contact.role}
                                                        </p>
                                                    )}
                                                </div>

                                                {contact.is_primary && (
                                                    <span className="shrink-0 text-xs font-medium">
                                                        Primary
                                                    </span>
                                                )}
                                            </div>

                                            {contact.email && (
                                                <p className="mt-2 wrap-break-word text-sm text-muted-foreground">
                                                    {contact.email}
                                                </p>
                                            )}

                                            {contact.phone && (
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {contact.phone}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => setIsAddingContact(true)}
                                className="text-sm font-medium cursor-pointer hover:underline"
                            >
                                Add contact
                            </button>
                        </div>
                        {isAddingContact && (
                            <div className="border-t px-4 py-4">
                                <div className="space-y-2 grid grid-cols-2 gap-2">
                                    {/* Name */}
                                    <div className="space-y-1 ">
                                        <label className="text-[11px] text-muted-foreground">
                                            Name
                                        </label>

                                        <Input
                                            value={contactName}
                                            onChange={(event) =>
                                                setContactName(event.target.value)
                                            }
                                            placeholder="Enter contact name"
                                        />
                                    </div>

                                    {/* Role */}
                                    <div className="space-y-1">
                                        <label className="text-[11px] text-muted-foreground">
                                            Role
                                        </label>

                                        <Input
                                            value={contactRole}
                                            onChange={(event) =>
                                                setContactRole(event.target.value)
                                            }
                                            placeholder="Enter role"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-1">
                                        <label className="text-[11px] text-muted-foreground">
                                            Email
                                        </label>

                                        <Input
                                            type="email"
                                            value={contactEmail}
                                            onChange={(event) =>
                                                setContactEmail(event.target.value)
                                            }
                                            placeholder="Enter email"
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-1">
                                        <label className="text-[11px] text-muted-foreground">
                                            Phone
                                        </label>

                                        <Input
                                            value={contactPhone}
                                            onChange={(event) =>
                                                setContactPhone(event.target.value)
                                            }
                                            placeholder="Enter phone"
                                        />
                                    </div>

                                    {/* Primary */}
                                    <label className="flex items-center gap-2 text-xs">
                                        <input
                                            type="checkbox"
                                            checked={contactIsPrimary}
                                            onChange={(event) =>
                                                setContactIsPrimary(event.target.checked)
                                            }
                                        />

                                        Primary contact
                                    </label>

                                    {/* Actions */}
                                    <div className="col-span-2 flex items-center gap-4 pt-1">
                                        <Button
                                            type="button"
                                            onClick={handleSaveContact}
                                            disabled={savingContact || !contactName.trim()}
                                            className="h-8 px-4 text-xs cursor-pointer"
                                        >
                                            {savingContact ? "Saving..." : "Save"}
                                        </Button>

                                        <button
                                            type="button"
                                            onClick={handleCancelContact}
                                            disabled={savingContact}
                                            className="text-xs text-muted-foreground cursor-pointer hover:text-foreground"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
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
                            {statusHistoryLoading ? (
                                <p className="text-sm text-muted-foreground">
                                    Loading stage history...
                                </p>
                            ) : statusHistory.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No stage changes.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {statusHistory.map((history) => (
                                        <div key={history.id}>
                                            <p className="text-sm">
                                                {history.from_status
                                                    ? `${history.from_status} → ${history.to_status}`
                                                    : history.to_status}
                                            </p>

                                            <p className="text-xs text-muted-foreground">
                                                {new Date(
                                                    history.changed_at
                                                ).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div >
    );
}
