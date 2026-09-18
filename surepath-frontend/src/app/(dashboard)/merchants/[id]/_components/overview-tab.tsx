import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { Merchant } from "@/features/merchants/types/merchant.types";
import type { MerchantContact } from "@/features/contacts/types/contact.types";
import { getMerchantContacts } from "@/features/contacts/api/contacts.api";
import { getMerchantScores } from "@/features/scoring/api/scoring.api";
import type { MerchantScore } from "@/features/scoring/types/scoring.types";
import { getMerchantProfile } from "@/features/profiles/api/profile.api";
import type { MerchantProfile } from "@/features/profiles/types/profile.types";
import { getMerchantDetections } from "@/features/detections/api/detection.api";
import type { MerchantDetection } from "@/features/detections/types/detection.types";
import { getMerchantResearch } from "@/features/research/api/research.api";
import type { ResearchRun } from "@/features/research/types/research.types";
import { getMerchantStatusHistory } from "@/features/merchants/api/status-history.api";
import type { MerchantStatusHistory } from "@/features/merchants/types/status-history.types";

interface OverviewTabProps {
    merchant: Merchant;
}

export default function OverviewTab({
    merchant,
}: OverviewTabProps) {
    const [contacts, setContacts] = useState<MerchantContact[]>([]);
    const [contactsLoading, setContactsLoading] = useState(true);
    const [scores, setScores] = useState<MerchantScore[]>([]);
    const [scoresLoading, setScoresLoading] = useState(true);
    const [profile, setProfile] = useState<MerchantProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [detections, setDetections] = useState<MerchantDetection[]>([]);
    const [detectionsLoading, setDetectionsLoading] = useState(true);
    const [researchRuns, setResearchRuns] = useState<ResearchRun[]>([]);
    const [researchLoading, setResearchLoading] = useState(true);
    const [statusHistory, setStatusHistory] = useState<MerchantStatusHistory[]>([]);
    const [statusHistoryLoading, setStatusHistoryLoading] = useState(true);

    const latestCompletedResearch = researchRuns.find(
        (run) => run.status === "completed"
    );
    const latestScore = scores[0];

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
        const loadDetections = async () => {
            try {
                setDetectionsLoading(true);

                const result = await getMerchantDetections(merchant.id);

                setDetections(result);
            } catch (error) {
                console.error(
                    "Failed to load merchant detections:",
                    error
                );
            } finally {
                setDetectionsLoading(false);
            }
        };

        void loadDetections();
    }, [merchant.id]);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setProfileLoading(true);

                const result = await getMerchantProfile(merchant.id);

                setProfile(result);
            } catch (error) {
                console.error("Failed to load merchant profile:", error);
            } finally {
                setProfileLoading(false);
            }
        };

        void loadProfile();
    }, [merchant.id]);




    useEffect(() => {
        const loadScores = async () => {
            try {
                setScoresLoading(true);

                const result = await getMerchantScores(merchant.id);

                setScores(result);
            } catch (error) {
                console.error("Failed to load merchant scores:", error);
            } finally {
                setScoresLoading(false);
            }
        };

        void loadScores();
    }, [merchant.id]);

    useEffect(() => {
        const loadContacts = async () => {
            try {
                setContactsLoading(true);

                const result = await getMerchantContacts(
                    merchant.id
                );

                setContacts(result);
            } catch (error) {
                console.error(
                    "Failed to load merchant contacts:",
                    error
                );
            } finally {
                setContactsLoading(false);
            }
        };

        void loadContacts();
    }, [merchant.id]);
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
                            {scoresLoading ? (
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
                            {detectionsLoading ? (
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
                            {scoresLoading ? (
                                <p className="text-sm text-muted-foreground">
                                    Loading opportunity...
                                </p>
                            ) : latestScore?.opportunity_value !== null &&
                                latestScore?.opportunity_value !== undefined ? (
                                <div>
                                    <p className="text-2xl font-semibold">
                                        {latestScore?.opportunity_value.toLocaleString()}
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                        Estimated opportunity value
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Not established.
                                </p>
                            )}
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
                            {contactsLoading ? (
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
        </div>
    );
}
