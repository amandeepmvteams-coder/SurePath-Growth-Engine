"use client"
import Link from "next/link";
import { Play } from "lucide-react";
import { getMerchantById, updateMerchant, } from "@/features/merchants/api/merchants.api";
import type { Merchant } from "@/features/merchants/types/merchant.types";
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
import { Label } from "@/components/ui/label";
import MerchantTabs from "./_components/merchants-tabs";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getActiveUsers } from "@/features/users/api/users.api";
import type { User } from "@/features/users/types/user.types";
import { toast } from "sonner";
import { getMerchantContacts } from "@/features/contacts/api/contacts.api";
import type { MerchantContact } from "@/features/contacts/types/contact.types";

import { getMerchantScores } from "@/features/scoring/api/scoring.api";
import type { MerchantScore } from "@/features/scoring/types/scoring.types";

import { getMerchantDetections } from "@/features/detections/api/detection.api";
import type { MerchantDetection } from "@/features/detections/types/detection.types";

export default function MerchantPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [merchant, setMerchant] = useState<Merchant | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [updatingAssignee, setUpdatingAssignee] = useState(false);
    const [updatingFollowUp, setUpdatingFollowUp] = useState(false);
    const [contacts, setContacts] = useState<MerchantContact[]>([]);
    const [scores, setScores] = useState<MerchantScore[]>([]);
    const [detections, setDetections] = useState<MerchantDetection[]>([]);
    const [summaryLoading, setSummaryLoading] = useState(true);

    useEffect(() => {
        const loadSummaryData = async () => {
            try {
                setSummaryLoading(true);

                const [scoresResult, detectionsResult, contactsResult] =
                    await Promise.all([
                        getMerchantScores(id),
                        getMerchantDetections(id),
                        getMerchantContacts(id),
                    ]);

                setScores(scoresResult);
                setDetections(detectionsResult);
                setContacts(contactsResult);
            } catch (error) {
                console.error(
                    "Failed to load merchant summary data:",
                    error
                );
            } finally {
                setSummaryLoading(false);
            }
        };

        void loadSummaryData();
    }, [id]);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                setUsersLoading(true);

                const result = await getActiveUsers();

                setUsers(result);
            } catch (error) {
                console.error("Failed to load active users:", error);
            } finally {
                setUsersLoading(false);
            }
        };

        void loadUsers();
    }, []);

    const handleAssigneeChange = async (userId: string) => {
        if (!merchant || updatingAssignee) {
            return;
        }

        try {
            setUpdatingAssignee(true);

            const updatedMerchant = await updateMerchant(merchant.id, {
                assigned_rep_id: userId === "unassigned" ? null : userId,
            });

            toast.success(`Sales assigned succesfully`)
            setMerchant(updatedMerchant);
        } catch (error) {
            console.error("Failed to update merchant assignee:", error);
            toast.error("Failed to update merchant assignee:");
        } finally {
            setUpdatingAssignee(false);
        }
    };

    const handleFollowUpChange = async (value: string) => {
        if (!merchant || updatingFollowUp) {
            return;
        }

        try {
            setUpdatingFollowUp(true);

            const updatedMerchant = await updateMerchant(merchant.id, {
                next_follow_up_at: value
                    ? new Date(`${value}T00:00:00`).toISOString()
                    : null,
            });

            setMerchant(updatedMerchant);
        } catch (error) {
            console.error(
                "Failed to update merchant follow-up:",
                error
            );
        } finally {
            setUpdatingFollowUp(false);
        }
    };

    const handleStatusChange = async (status: string) => {
        if (!merchant || status === merchant.status || updatingStatus) {
            return;
        }

        try {
            setUpdatingStatus(true);

            const updatedMerchant = await updateMerchant(merchant.id, {
                status,
            });

            setMerchant(updatedMerchant);
        } catch (error) {
            console.error("Failed to update merchant status:", error);
        } finally {
            setUpdatingStatus(false);
        }
    };
    useEffect(() => {
        const loadMerchant = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const result = await getMerchantById(id);

                setMerchant(result);
            } catch (error) {
                console.error("Failed to load merchant:", error);
                setError("Failed to load merchant");
            } finally {
                setIsLoading(false);
            }
        };

        void loadMerchant();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex h-40 items-center justify-center">
                Loading merchant...
            </div>
        );
    }

    if (error || !merchant) {
        return (
            <div className="flex h-40 items-center justify-center">
                {error ?? "Merchant not found"}
            </div>
        );
    }
    const refreshMerchant = async () => {
        if (!id) return;

        try {
            const updatedMerchant = await getMerchantById(id);
            setMerchant(updatedMerchant);
        } catch (error) {
            console.error("Failed to refresh merchant:", error);
        }
    };
    const loadScores = async () => {
        try {
            const result = await getMerchantScores(id);
            setScores(result);
        } catch (error) {
            console.error("Failed to refresh merchant scores:", error);
        }
    };
    const latestScore = scores[0];

    const detectedProviders = detections.filter(
        (detection) => detection.is_detected
    );

    const providerSummary =
        detectedProviders.length > 0
            ? detectedProviders
                .map((detection) => detection.provider_name)
                .join(", ")
            : "None - fresh";

    const loadContacts = async () => {
        try {
            const result = await getMerchantContacts(id);
            setContacts(result);
        } catch (error) {
            console.error("Failed to refresh merchant contacts:", error);
        }
    };
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
                title={merchant.store_name || merchant.domain}
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
                <Button
                    size="sm"
                    className="gap-1.5 h-8"
                    onClick={() => {
                        router.push(
                            `/pipeline?merchant_id=${encodeURIComponent(id)}`
                        )
                    }
                    }
                >
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
                                    type="button"
                                    disabled={updatingStatus}
                                    onClick={() => void handleStatusChange(status)}
                                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${isActive
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                                        } ${updatingStatus
                                            ? "cursor-not-allowed opacity-60"
                                            : ""
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

                            <Select
                                value={merchant.assigned_rep_id ?? "unassigned"}
                                onValueChange={(value) => void handleAssigneeChange(value)}
                                disabled={usersLoading || updatingAssignee}
                            >
                                <SelectTrigger className="h-9 w-full sm:w-40">
                                    <SelectValue
                                        placeholder={
                                            usersLoading
                                                ? "Loading..."
                                                : "Select owner"
                                        }
                                    />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="unassigned">
                                        Unassigned
                                    </SelectItem>

                                    {users.map((user) => (
                                        <SelectItem
                                            key={user.id}
                                            value={user.id}
                                        >
                                            {user.display_name || user.username}
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
                                value={
                                    merchant.next_follow_up_at
                                        ? merchant.next_follow_up_at.slice(0, 10)
                                        : ""
                                }
                                disabled={updatingFollowUp}
                                onChange={(event) =>
                                    void handleFollowUpChange(event.target.value)
                                }
                                className="h-9 max-w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>
                    </div>

                    {/* Last Activity */}
                    <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-left sm:justify-end">
                        <p className="text-xs text-muted-foreground/70">
                            Last activity
                        </p>

                        <p className=" text-xs text-muted-foreground/70 ">
                            {merchant.last_activity_at
                                ? new Date(merchant.last_activity_at).toLocaleString()
                                : "—"}
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
                            {summaryLoading
                                ? "Loading..."
                                : latestScore
                                    ? latestScore.score
                                    : "—"}
                        </p>
                    </div>

                    {/* Provider */}
                    <div className="border-b px-4 py-4 sm:border-b-0 lg:border-r">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Provider
                        </p>

                        <p className="mt-1.5 text-sm font-medium text-emerald-600">
                            {summaryLoading
                                ? "Loading..."
                                : providerSummary}
                        </p>
                    </div>

                    {/* Contacts */}
                    <div className="border-b px-4 py-4 sm:border-r sm:border-b-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Contacts
                        </p>

                        <p className="mt-1.5 text-lg font-bold">
                            {summaryLoading ? "..." : contacts.length}
                        </p>
                    </div>

                    {/* Opportunity */}
                    <div className="px-4 py-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Opportunity
                        </p>

                        <p className="mt-1.5 text-sm text-muted-foreground/60">
                            {summaryLoading
                                ? "Loading..."
                                : latestScore?.opportunity_value !== null &&
                                    latestScore?.opportunity_value !== undefined
                                    ? latestScore.opportunity_value.toLocaleString()
                                    : "Not established"}
                        </p>
                    </div>

                </CardContent>
            </Card>

            <MerchantTabs
                merchant={merchant}
                onMerchantRefresh={refreshMerchant}
                contacts={contacts}
                scores={scores}
                summaryLoading={summaryLoading}
                detections={detections}
                onScoresUpdated={loadScores}
                onContactsUpdated={loadContacts}
            />
        </div>
    );
}
