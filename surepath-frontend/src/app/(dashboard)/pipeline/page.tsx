"use client";

import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Loader2 } from "lucide-react";

const pipelineStages = [
    {
        id: 1,
        name: "Discovery",
        description: "Created:1 · total:1",
    },
    {
        id: 2,
        name: "Research",
        description: "Visits the store. 30-60s",
    },
    {
        id: 3,
        name: "Profile",
        description: "Builds the merchant profile.",
    },
    {
        id: 4,
        name: "Detection",
        description: "Detects providers and policies.",
    },
    {
        id: 5,
        name: "Scoring",
        description: "Calculates the fit score.",
    },
];

const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

export default function PipelinePage() {
    const [isRunning, setIsRunning] = useState(false);
    const [currentStage, setCurrentStage] = useState(0);

    const handleRunPipeline = async () => {
        if (isRunning) return;

        setIsRunning(true);
        setCurrentStage(0);

        for (let i = 0; i < pipelineStages.length; i++) {
            setCurrentStage(i);

            await wait(2000);
        }

        setCurrentStage(pipelineStages.length);
        setIsRunning(false);
    };

    return (
        <section className="w-full">
            <div className="flex flex-col gap-5">

                {/* Page Header */}
                <PageHeader
                    title="Pipeline"
                    subtitle="Each stage reads what the one before it stored, so the order is not cosmetic – running scoring before research has nothing to score. Discovery is optional: it brings in merchants the system has never seen."
                />

                {/* Scope Card */}
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
                                            {isRunning
                                                ? "Fetch up to"
                                                : "The least recently researched"}
                                        </span>

                                        <Input
                                            type="number"
                                            value={isRunning ? 1 : 10}
                                            readOnly
                                            className="h-8 w-16"
                                        />

                                        <span className="text-muted-foreground">
                                            merchants
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Checkbox id="find-merchants"
                                            
                                        />

                                        <label
                                            htmlFor="find-merchants"
                                            className="text-sm leading-5 text-muted-foreground"
                                        >
                                            Find new merchants first{" "}
                                            <span className="text-muted-foreground/70">
                                                – from Store Leads
                                            </span>
                                        </label>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Checkbox id="ai-enrichment" />

                                        <label
                                            htmlFor="ai-enrichment"
                                            className="flex flex-wrap items-center gap-2 text-sm leading-5 text-muted-foreground"
                                        >
                                            Include AI enrichment

                                            <span className="rounded bg-yellow-50 px-1.5 py-0.5 text-[10px] text-yellow-700">
                                                costs credit
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleRunPipeline}
                                    disabled={isRunning}
                                    className="w-full sm:w-auto md:self-auto"
                                >
                                    {isRunning ? "Running..." : "Run pipeline"}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Running Pipeline */}
                {(isRunning || currentStage === pipelineStages.length) && (
                    <Card className="w-full max-w-5xl">
                        <CardContent className="px-4 pt-6 sm:px-6">

                            {/* Header */}
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                                    {isRunning ? "Running" : "Completed"}
                                </p>

                                <span className="text-xs text-muted-foreground">
                                    {Math.min(currentStage + 1, pipelineStages.length)} of{" "}
                                    {pipelineStages.length}
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-neutral-900 transition-all duration-500"
                                    style={{
                                        width: `${(currentStage / pipelineStages.length) * 100}%`,
                                    }}
                                />
                            </div>

                            {/* Stages */}
                            <div className="mt-5 flex flex-col gap-4">
                                {pipelineStages.map((stage, index) => {
                                    const isComplete = index < currentStage;
                                    const isCurrent =
                                        index === currentStage && isRunning;

                                    return (
                                        <div
                                            key={stage.id}
                                            className="flex min-w-0 items-start gap-3"
                                        >
                                            {/* Status circle */}
                                            <div
                                                className={`mt-0.5 flex size-5 shrink-0 rounded-full items-center justify-center ${isComplete
                                                    ? "text-green-600 bg-green-100 text-center p-1"
                                                    : isCurrent
                                                        ? "text-neutral-900"
                                                        : "text-muted-foreground/30"
                                                    }`}
                                            >
                                                {isComplete && (
                                                    <Check className="size-4" />
                                                )}

                                                {isCurrent && (
                                                    <Loader2 className="size-4 animate-spin" />
                                                )}

                                                {!isComplete && !isCurrent && (
                                                    <div className="size-3.5 rounded-full border border-muted-foreground/30" />
                                                )}
                                            </div>

                                            {/* Stage information */}
                                            <div className="min-w-0">
                                                <div
                                                    className={`text-sm ${isComplete || isCurrent
                                                        ? "font-medium text-foreground"
                                                        : "text-muted-foreground/60"
                                                        }`}
                                                >
                                                    <span className="mr-2 text-xs text-muted-foreground">
                                                        0{stage.id}
                                                    </span>

                                                    {stage.name}
                                                </div>

                                                {(isCurrent || isComplete) && (
                                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                                        {isComplete
                                                            ? "Completed"
                                                            : stage.description}
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