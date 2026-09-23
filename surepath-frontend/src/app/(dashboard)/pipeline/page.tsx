"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import { Check, CircleX, Loader2 } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { getMerchantById } from "@/features/merchants/api/merchants.api";
import {
    runDetection,
    runDiscovery,
    runProfile,
    runResearch,
    runScoring,
} from "@/features/pipeline/api/pipeline.api";
import type {
    PipelineStageId,
    PipelineStageStatus,
} from "@/features/pipeline/types/pipeline.types";
import { runAI } from "@/features/ai/api/ai.api";

const merchantIdSchema = z.string().uuid();

const stageDefinitions: Record<
    PipelineStageId,
    { name: string; description: string }
> = {
    discovery: {
        name: "Discovery",
        description: "Finds new merchants using the configured source.",
    },
    research: {
        name: "Research",
        description: "Visits the merchant website and stores research pages.",
    },
    profile: {
        name: "Profile",
        description: "Builds the merchant profile from completed research.",
    },
    detection: {
        name: "Detection",
        description: "Detects providers and policies from research data.",
    },
    scoring: {
        name: "Scoring",
        description: "Calculates and stores the fit score.",
    },
    ai: {
        name: "AI Enrichment",
        description: "Enriches the merchant with AI-powered classification and summaries.",
    },
};

const getInitialStageState = (
    stageIds: PipelineStageId[]
): Record<PipelineStageId, PipelineStageStatus> =>
    stageIds.reduce(
        (state, stageId) => ({
            ...state,
            [stageId]: "pending",
        }),
        {} as Record<PipelineStageId, PipelineStageStatus>
    );

const formatStageErrors = (errors: unknown[]): string => {
    const formatted = errors
        .map((error) => {
            if (error instanceof Error) return error.message;
            if (typeof error === "string") return error;
            if (error && typeof error === "object") {
                try {
                    return JSON.stringify(error);
                } catch {
                    return "An unrecognized backend error occurred.";
                }
            }
            return String(error);
        })
        .filter(Boolean);

    return formatted.length > 0
        ? formatted.join("; ")
        : "The backend request could not be completed.";
};

export default function PipelinePage() {
    const [includeAI, setIncludeAI] = useState(false);
    const searchParams = useSearchParams();
    const rawMerchantId = searchParams.get("merchant_id");
    const merchantId = rawMerchantId && merchantIdSchema.safeParse(rawMerchantId).success
        ? rawMerchantId
        : null;
    const hasInvalidMerchantId = Boolean(rawMerchantId && !merchantId);
    const isSingleMerchant = Boolean(merchantId);
    const [includeDiscovery, setIncludeDiscovery] = useState(false);

    const stageIds = useMemo<PipelineStageId[]>(() => {
        const stages: PipelineStageId[] = [];

        if (!isSingleMerchant && includeDiscovery) {
            stages.push("discovery");
        }

        stages.push("research", "profile", "detection", "scoring");

        if (includeAI) {
            stages.push("ai");
        }

        return stages;
    }, [isSingleMerchant, includeAI, includeDiscovery]);

    const [isRunning, setIsRunning] = useState(false);
    const [stageState, setStageState] = useState<
        Record<PipelineStageId, PipelineStageStatus>
    >(() => getInitialStageState(stageIds));
    const [stageMessages, setStageMessages] = useState<
        Partial<Record<PipelineStageId, string>>
    >({});
    const [merchantName, setMerchantName] = useState<string | null>(null);
    const [merchantLoadError, setMerchantLoadError] = useState<string | null>(
        null
    );

    useEffect(() => {
        if (!merchantId) {
            return;
        }

        let active = true;

        getMerchantById(merchantId)
            .then((merchant) => {
                if (active) {
                    setMerchantLoadError(null);
                    setMerchantName(merchant.store_name || merchant.domain);
                }
            })
            .catch((error: unknown) => {
                console.error("Failed to load pipeline merchant", error);
                if (active) {
                    setMerchantLoadError(
                        "The selected merchant could not be loaded."
                    );
                }
            });

        return () => {
            active = false;
        };
    }, [merchantId]);

    const setStage = (
        stageId: PipelineStageId,
        status: PipelineStageStatus,
        message?: string
    ) => {
        setStageState((current) => ({ ...current, [stageId]: status }));
        if (message) {
            setStageMessages((current) => ({
                ...current,
                [stageId]: message,
            }));
        }
    };

    const handleRunPipeline = async () => {
        if (isRunning || hasInvalidMerchantId) return;

        setIsRunning(true);
        setStageState(getInitialStageState(stageIds));
        setStageMessages({});

        try {
            let merchantIds = merchantId ? [merchantId] : [];

            if (!isSingleMerchant) {
                if (includeDiscovery) {
                    setStage("discovery", "running");
                    let discovery;
                    try {
                        discovery = await runDiscovery("mock", 10);
                    } catch (error) {
                        const message = formatStageErrors([error]);
                        setStage(
                            "discovery",
                            "failed",
                            message
                        );
                        setStage(
                            "research",
                            "skipped",
                            "Not executed because Discovery failed."
                        );
                        setStage(
                            "profile",
                            "skipped",
                            "Not executed because Discovery failed."
                        );
                        setStage(
                            "detection",
                            "skipped",
                            "Not executed because Discovery failed."
                        );
                        setStage(
                            "scoring",
                            "skipped",
                            "Not executed because Discovery failed."
                        );
                        if (includeAI) {
                            setStage(
                                "ai",
                                "skipped",
                                "Not executed because Discovery failed."
                            );
                        }
                        toast.error(`Discovery failed: ${message}`);
                        return;
                    }

                    if (discovery.errors.length > 0 || discovery.failed > 0) {
                        const message = formatStageErrors(discovery.errors);
                        setStage(
                            "discovery",
                            "failed",
                            message
                        );
                        setStage(
                            "research",
                            "skipped",
                            "Not executed because Discovery returned errors."
                        );
                        setStage(
                            "profile",
                            "skipped",
                            "Not executed because Discovery returned errors."
                        );
                        setStage(
                            "detection",
                            "skipped",
                            "Not executed because Discovery returned errors."
                        );
                        setStage(
                            "scoring",
                            "skipped",
                            "Not executed because Discovery returned errors."
                        );
                        if (includeAI) {
                            setStage(
                                "ai",
                                "skipped",
                                "Not executed because Discovery returned errors."
                            );
                        }
                        toast.error(`Discovery failed: ${message}`);
                        return;
                    }

                    merchantIds = discovery.merchant_ids;
                    if (merchantIds.length === 0) {
                        setStage(
                            "discovery",
                            "failed",
                            "No merchants were discovered."
                        );
                        setStage(
                            "research",
                            "skipped",
                            "Not executed because Discovery found no merchants."
                        );
                        setStage(
                            "profile",
                            "skipped",
                            "Not executed because Discovery found no merchants."
                        );
                        setStage(
                            "detection",
                            "skipped",
                            "Not executed because Discovery found no merchants."
                        );
                        setStage(
                            "scoring",
                            "skipped",
                            "Not executed because Discovery found no merchants."
                        );
                        if (includeAI) {
                            setStage(
                                "ai",
                                "skipped",
                                "Not executed because Discovery found no merchants."
                            );
                        }
                        toast.error("Discovery found no merchants.");
                        return;
                    }

                    setStage(
                        "discovery",
                        "completed",
                        `${merchantIds.length} merchant${merchantIds.length === 1 ? "" : "s"
                        } discovered.`
                    );
                }
            }

            if (merchantIds.length === 0) {
                setStage(
                    "research",
                    "skipped",
                    "No merchants were available for research."
                );
                setStage(
                    "profile",
                    "skipped",
                    "Not executed because there were no merchants to research."
                );
                setStage(
                    "detection",
                    "skipped",
                    "Not executed because there were no merchants to research."
                );
                setStage(
                    "scoring",
                    "skipped",
                    "Not executed because there were no merchants to research."
                );
                if (includeAI) {
                    setStage(
                        "ai",
                        "skipped",
                        "Not executed because there were no merchants to research."
                    );
                }
                toast.error(
                    "No merchants were available for research. Enable mock discovery or provide a merchant."
                );
                return;
            }

            setStage("research", "running");
            let research;
            try {
                research = await runResearch(
                    isSingleMerchant || includeDiscovery ? merchantIds : 10
                );
            } catch (error) {
                const message = formatStageErrors([error]);
                setStage("research", "failed", message);
                setStage(
                    "profile",
                    "skipped",
                    "Not executed because Research failed."
                );
                setStage(
                    "detection",
                    "skipped",
                    "Not executed because Research failed."
                );
                setStage(
                    "scoring",
                    "skipped",
                    "Not executed because Research failed."
                );
                if (includeAI) {
                    setStage(
                        "ai",
                        "skipped",
                        "Not executed because Research failed."
                    );
                }
                toast.error(`Research failed: ${message}`);
                return;
            }

            const successfulResearchIds = research.merchant_ids;
            const researchHasFailures =
                research.failed > 0 || research.errors.length > 0;

            if (
                isSingleMerchant &&
                (researchHasFailures || successfulResearchIds.length === 0)
            ) {
                const message =
                    research.errors.length > 0
                        ? formatStageErrors(research.errors)
                        : `${research.failed} merchant(s) failed during research.`;
                setStage(
                    "research",
                    "failed",
                    message
                );
                setStage(
                    "profile",
                    "skipped",
                    "Not executed because Research failed."
                );
                setStage(
                    "detection",
                    "skipped",
                    "Not executed because Research failed."
                );
                setStage(
                    "scoring",
                    "skipped",
                    "Not executed because Research failed."
                );
                if (includeAI) {
                    setStage(
                        "ai",
                        "skipped",
                        "Not executed because Research failed."
                    );
                }
                toast.error(`Research failed: ${message}`);
                return;
            }

            if (successfulResearchIds.length === 0) {
                const message =
                    research.errors.length > 0
                        ? formatStageErrors(research.errors)
                        : "No merchants completed research.";
                setStage("research", "failed", message);
                setStage(
                    "profile",
                    "skipped",
                    "Not executed because no merchants completed Research."
                );
                setStage(
                    "detection",
                    "skipped",
                    "Not executed because no merchants completed Research."
                );
                setStage(
                    "scoring",
                    "skipped",
                    "Not executed because no merchants completed Research."
                );
                if (includeAI) {
                    setStage(
                        "ai",
                        "skipped",
                        "Not executed because no merchants completed Research."
                    );
                }
                toast.error(`Research stopped: ${message}`);
                return;
            }

            merchantIds = successfulResearchIds;
            setStage(
                "research",
                "completed",
                researchHasFailures
                    ? `${research.researched} merchants researched, ${research.failed} failed.${research.errors.length > 0
                        ? ` ${formatStageErrors(research.errors)}`
                        : ""}`
                    : `${research.researched} merchant${research.researched === 1 ? "" : "s"} researched.`
            );

            setStage("profile", "running");
            setStage("detection", "running");

            const [profileResult, detectionResult] = await Promise.allSettled([
                runProfile(merchantIds),
                runDetection(merchantIds),
            ]);

            let profileFailed = false;
            let detectionFailed = false;

            if (profileResult.status === "rejected") {
                profileFailed = true;
                setStage(
                    "profile",
                    "failed",
                    formatStageErrors([profileResult.reason])
                );
                console.error("Profile stage failed", profileResult.reason);
            } else if (profileResult.value.errors.length > 0) {
                profileFailed = true;
                setStage(
                    "profile",
                    "failed",
                    formatStageErrors(profileResult.value.errors)
                );
            } else if (
                profileResult.value.built === 0 &&
                profileResult.value.skipped > 0
            ) {
                setStage(
                    "profile",
                    "skipped",
                    `${profileResult.value.skipped} merchant skipped; research data was insufficient.`
                );
            } else {
                setStage(
                    "profile",
                    "completed",
                    `${profileResult.value.built} profile${profileResult.value.built === 1 ? "" : "s"
                    } built.`
                );
            }

            if (detectionResult.status === "rejected") {
                detectionFailed = true;
                setStage(
                    "detection",
                    "failed",
                    formatStageErrors([detectionResult.reason])
                );
                console.error(
                    "Detection stage failed",
                    detectionResult.reason
                );
            } else if (detectionResult.value.errors.length > 0) {
                detectionFailed = true;
                setStage(
                    "detection",
                    "failed",
                    formatStageErrors(detectionResult.value.errors)
                );
            } else {
                setStage(
                    "detection",
                    "completed",
                    `${detectionResult.value.detections} detection${detectionResult.value.detections === 1 ? "" : "s"
                    } found.`
                );
            }

            if (profileFailed || detectionFailed) {
                setStage(
                    "scoring",
                    "skipped",
                    "Not executed because a preceding stage failed."
                );
                if (includeAI) {
                    setStage(
                        "ai",
                        "skipped",
                        "Not executed because a preceding stage failed."
                    );
                }
                const failedStages = [
                    profileFailed ? "Profile" : null,
                    detectionFailed ? "Detection" : null,
                ]
                    .filter(Boolean)
                    .join(" and ");
                toast.error(`Pipeline stopped: ${failedStages} failed.`);
                return;
            }

            setStage("scoring", "running");
            let scoring;
            try {
                scoring = await runScoring(merchantIds);
            } catch (error) {
                const message = formatStageErrors([error]);
                setStage("scoring", "failed", message);
                if (includeAI) {
                    setStage(
                        "ai",
                        "skipped",
                        "Not executed because Scoring failed."
                    );
                }
                toast.error(`Scoring failed: ${message}`);
                return;
            }
            if (scoring.errors.length > 0) {
                const message = formatStageErrors(scoring.errors);
                setStage("scoring", "failed", message);
                if (includeAI) {
                    setStage(
                        "ai",
                        "skipped",
                        "Not executed because Scoring failed."
                    );
                }
                toast.error(`Scoring failed: ${message}`);
                return;
            }
            if (scoring.scored === 0 && scoring.skipped > 0) {
                setStage(
                    "scoring",
                    "skipped",
                    `${scoring.skipped} merchant skipped.`
                );
            } else {
                setStage(
                    "scoring",
                    "completed",
                    `${scoring.scored} merchant${scoring.scored === 1 ? "" : "s"
                    } scored.`
                );
            }
            if (includeAI) {
                setStage("ai", "running");

                try {
                    const aiResult = await runAI({
                        merchant_ids: merchantIds,
                        tasks: [
                            "industry_classify",
                            "research_summary",
                            "policy_summary",
                        ],
                    });

                    if (
                        aiResult.errors.length > 0 ||
                        aiResult.rejected > 0
                    ) {
                        const message =
                            aiResult.errors.length > 0
                                ? formatStageErrors(aiResult.errors)
                                : `${aiResult.rejected} AI result(s) were rejected.`;
                        setStage(
                            "ai",
                            "failed",
                            message
                        );

                        toast.warning(
                            "Core pipeline completed, but AI enrichment had errors."
                        );
                    } else {
                        setStage(
                            "ai",
                            "completed",
                            `AI enrichment completed: ${aiResult.classified} classified, ${aiResult.summarised} researched, ${aiResult.policies_summarised} policies summarized.`
                        );

                        toast.success(
                            merchantName
                                ? `Pipeline and AI enrichment completed for ${merchantName}.`
                                : "Pipeline and AI enrichment completed."
                        );
                    }
                } catch (error) {
                    console.error("AI enrichment failed", error);

                    setStage(
                        "ai",
                        "failed",
                        formatStageErrors([error])
                    );

                    toast.warning(
                        "Core pipeline completed, but AI enrichment failed."
                    );
                }
            } else {
                toast.success(
                    merchantName
                        ? `Pipeline completed for ${merchantName}.`
                        : "Pipeline completed."
                );
            }

            if (merchantId) {
                await getMerchantById(merchantId);
            }
        } catch (error: unknown) {
            console.error("Pipeline execution failed", error);
            toast.error(formatStageErrors([error]));
        } finally {
            setIsRunning(false);
        }
    };

    const processedStages = stageIds.filter(
        (stageId) =>
            stageState[stageId] === "completed" ||
            stageState[stageId] === "skipped" ||
            stageState[stageId] === "failed"
    ).length;
    const hasStarted = stageIds.some(
        (stageId) => stageState[stageId] !== "pending"
    );
    const hasFinished = hasStarted && !isRunning;
    const hasFailures = stageIds.some(
        (stageId) => stageState[stageId] === "failed"
    );
    const progress = (processedStages / stageIds.length) * 100;

    return (
        <section className="w-full">
            <div className="flex flex-col gap-5">
                <PageHeader
                    title="Pipeline"
                    subtitle={
                        isSingleMerchant
                            ? `Run the existing merchant through Research, Profile, Detection, and Scoring in dependency order.`
                            : "Each stage reads what the one before it stored, so the order is not cosmetic. Discovery is optional and currently uses the mock source."
                    }
                />

                {isSingleMerchant && (
                    <p className="text-sm text-muted-foreground">
                        Merchant:{" "}
                        <span className="font-medium text-foreground">
                            {merchantName || merchantId}
                        </span>
                    </p>
                )}

                {(hasInvalidMerchantId || merchantLoadError) && (
                    <p className="text-sm text-red-600">
                        {hasInvalidMerchantId
                            ? "The merchant_id in this URL is not a valid merchant UUID."
                            : merchantLoadError}
                    </p>
                )}

                <Card className="w-full max-w-5xl">
                    <CardHeader className="pb-3">
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                            Scope
                        </p>
                    </CardHeader>

                    <CardContent>
                        <div className="flex flex-col gap-5">
                            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-6">
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-wrap items-center gap-2 text-sm">
                                        <span className="text-muted-foreground">
                                            {isSingleMerchant
                                                ? "Selected"
                                                : "Fetch up to"}
                                        </span>
                                        <Input
                                            type="number"
                                            value={isSingleMerchant ? 1 : 10}
                                            readOnly
                                            className="h-8 w-16"
                                        />
                                        <span className="text-muted-foreground">
                                            merchant{isSingleMerchant ? "" : "s"}
                                        </span>
                                    </div>

                                    {!isSingleMerchant && (
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="find-merchants"
                                                checked={includeDiscovery}
                                                onCheckedChange={(checked) =>
                                                    setIncludeDiscovery(
                                                        checked === true
                                                    )
                                                }
                                                disabled={isRunning}
                                            />
                                            <label
                                                htmlFor="find-merchants"
                                                className="text-sm leading-5 text-muted-foreground"
                                            >
                                                Find new merchants first{" "}
                                                <span className="text-muted-foreground/70">
                                                    – mock discovery
                                                </span>
                                            </label>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="ai-enrichment"
                                            checked={includeAI}
                                            onCheckedChange={(checked) =>
                                                setIncludeAI(checked === true)
                                            }
                                            disabled={isRunning}
                                        />

                                        <label
                                            htmlFor="ai-enrichment"
                                            className="flex flex-wrap items-center gap-2 text-sm leading-5 text-muted-foreground"
                                        >
                                            Include AI enrichment
                                            <span className="rounded bg-yellow-50 px-1.5 py-0.5 text-[10px] text-yellow-700">
                                                Optional
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleRunPipeline}
                                    disabled={
                                        isRunning ||
                                        hasInvalidMerchantId ||
                                        Boolean(merchantLoadError)
                                    }
                                    className="w-full sm:w-auto md:self-auto"
                                >
                                    {isRunning
                                        ? "Running..."
                                        : "Run pipeline"}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {(isRunning || hasFinished) && (
                    <Card className="w-full max-w-5xl">
                        <CardContent className="px-4 pt-6 sm:px-6">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                                    {isRunning
                                        ? "Running"
                                        : hasFailures
                                            ? "Finished with errors"
                                            : "Completed"}
                                </p>
                                <span className="text-xs text-muted-foreground">
                                    {processedStages} of {stageIds.length}
                                </span>
                            </div>

                            <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-neutral-900 transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>

                            <div className="mt-5 flex flex-col gap-4">
                                {stageIds.map((stageId, index) => {
                                    const status = stageState[stageId];
                                    const stage = stageDefinitions[stageId];
                                    const isCurrent = status === "running";
                                    const message =
                                        stageMessages[stageId] ||
                                        (status === "completed"
                                            ? "Completed"
                                            : status === "skipped"
                                                ? "Skipped"
                                                : status === "failed"
                                                    ? "Failed"
                                                    : stage.description);

                                    return (
                                        <div
                                            key={stageId}
                                            className="flex min-w-0 items-start gap-3"
                                        >
                                            <div
                                                className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${status === "completed"
                                                    ? "bg-green-100 p-1 text-green-600"
                                                    : status === "skipped"
                                                        ? "bg-yellow-100 p-1 text-yellow-700"
                                                        : status === "failed"
                                                            ? "bg-red-100 p-1 text-red-600"
                                                            : isCurrent
                                                                ? "text-neutral-900"
                                                                : "text-muted-foreground/30"
                                                    }`}
                                            >
                                                {status === "completed" && (
                                                    <Check className="size-4" />
                                                )}
                                                {status === "failed" && (
                                                    <CircleX className="size-4" />
                                                )}
                                                {isCurrent && (
                                                    <Loader2 className="size-4 animate-spin" />
                                                )}
                                                {(status === "pending" ||
                                                    status === "skipped") && (
                                                        <div className="size-3.5 rounded-full border border-current" />
                                                    )}
                                            </div>

                                            <div className="min-w-0">
                                                <div
                                                    className={`text-sm ${status !== "pending"
                                                        ? "font-medium text-foreground"
                                                        : "text-muted-foreground/60"
                                                        }`}
                                                >
                                                    <span className="mr-2 text-xs text-muted-foreground">
                                                        {String(index + 1).padStart(
                                                            2,
                                                            "0"
                                                        )}
                                                    </span>
                                                    {stage.name}
                                                </div>
                                                {status !== "pending" && (
                                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                                        {message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </section>
    );
}
