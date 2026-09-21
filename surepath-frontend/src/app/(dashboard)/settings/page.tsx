"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { getAIConfigs, getScoringConfig, getTeamMembers, updateAIConfig, updateScoringConfig } from "@/features/settings/api/settings.api";
import type { AIConfig, ScoringConfig, TeamMember } from "@/features/settings/types/settings.types";
import SettingsAITasks from "./components/settings-ai-tasks";
import SettingsOpportunity from "./components/settings-opportunity";
import SettingsPublish from "./components/settings-publish";
import SettingsScoring from "./components/settings-scoring";
import SettingsTeam from "./components/settings-team";

export default function SettingsPage() {
    const [scoringConfig, setScoringConfig] = useState<ScoringConfig | null>(null);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [aiConfigs, setAIConfigs] = useState<AIConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [factorWeights, setFactorWeights] = useState<Record<string, number>>({});
    const [targetCountries, setTargetCountries] = useState("");
    const [targetIndustries, setTargetIndustries] = useState("");
    const [attachRate, setAttachRate] = useState("");
    const [revenuePerOrder, setRevenuePerOrder] = useState("");
    const [publishing, setPublishing] = useState(false);
    const [editingAI, setEditingAI] = useState<string | null>(null);
    const [aiPrompt, setAIPrompt] = useState("");
    const [aiModel, setAIModel] = useState("");
    const [aiTemperature, setAITemperature] = useState("");
    const [savingAI, setSavingAI] = useState(false);

    useEffect(() => {
        async function loadSettings() {
            try {
                setLoading(true);
                setError(null);

                const [config, teamResponse, aiResponse] = await Promise.all([
                    getScoringConfig(),
                    getTeamMembers(),
                    getAIConfigs(),
                ]);

                setScoringConfig(config);
                setFactorWeights({
                    ...config.factor_weights,
                });
                setTargetCountries(
                    config.criteria.target_country.countries.join(", ")
                );
                setTargetIndustries(
                    config.criteria.target_industry.industries.join(", ")
                );
                setAttachRate(config.attach_rate);
                setRevenuePerOrder(config.revenue_per_order);
                setTeamMembers(teamResponse.users);
                setAIConfigs(aiResponse);
            } catch (error) {
                console.error("Failed to load settings:", error);
                setError("Failed to load settings.");
            } finally {
                setLoading(false);
            }
        }

        loadSettings();
    }, []);

    if (loading) {
        return (
            <section className="w-full">
                <div className="mx-auto max-w-260 py-10">
                    <p className="text-sm text-muted-foreground">
                        Loading settings...
                    </p>
                </div>
            </section>
        );
    }

    if (error || !scoringConfig) {
        return (
            <section className="w-full">
                <div className="mx-auto max-w-260 py-10">
                    <p className="text-sm text-destructive">
                        {error ?? "Settings could not be loaded."}
                    </p>
                </div>
            </section>
        );
    }

    const handlePublish = async () => {
        try {
            setPublishing(true);
            setError(null);

            const updatedConfig = await updateScoringConfig({
                scoring_factors: {
                    ...scoringConfig.scoring_factors,
                },
                factor_weights: factorWeights,
                criteria: {
                    ...scoringConfig.criteria,
                    target_country: {
                        countries: targetCountries
                            .split(",")
                            .map((country) => country.trim())
                            .filter(Boolean),
                    },
                    target_industry: {
                        industries: targetIndustries
                            .split(",")
                            .map((industry) => industry.trim())
                            .filter(Boolean),
                    },
                },
                attach_rate: attachRate === "" ? null : Number(attachRate),
                revenue_per_order:
                    revenuePerOrder === ""
                        ? null
                        : Number(revenuePerOrder),
                commercial_assumptions: {
                    ...scoringConfig.commercial_assumptions,
                },
            });

            setScoringConfig(updatedConfig);
            setFactorWeights({
                ...updatedConfig.factor_weights,
            });
            setTargetCountries(
                updatedConfig.criteria.target_country.countries.join(", ")
            );
            setTargetIndustries(
                updatedConfig.criteria.target_industry.industries.join(", ")
            );
            setAttachRate(updatedConfig.attach_rate);
            setRevenuePerOrder(updatedConfig.revenue_per_order);
        } catch (error) {
            console.error("Failed to publish scoring configuration:", error);
            setError("Failed to publish scoring configuration.");
        } finally {
            setPublishing(false);
        }
    };

    const handleEditAI = (config: AIConfig) => {
        setEditingAI(config.id);
        setAIPrompt(config.prompt_template);
        setAIModel(config.model);

        const temperature = config.params.temperature;

        setAITemperature(
            typeof temperature === "number"
                ? String(temperature)
                : ""
        );
    };

    const handleSaveAI = async () => {
        if (!editingAI) return;

        const currentConfig = aiConfigs.find(
            (config) => config.id === editingAI
        );

        if (!currentConfig) return;

        try {
            setSavingAI(true);
            setError(null);

            const updatedConfig = await updateAIConfig({
                key: currentConfig.key,
                prompt_template: aiPrompt,
                model: aiModel,
                params: {
                    ...currentConfig.params,
                    temperature:
                        aiTemperature === ""
                            ? currentConfig.params.temperature
                            : Number(aiTemperature),
                },
            });

            setAIConfigs((current) =>
                current.map((config) =>
                    config.id === editingAI
                        ? updatedConfig
                        : config
                )
            );

            setEditingAI(null);
        } catch (error) {
            console.error(
                "Failed to update AI configuration:",
                error
            );
            setError("Failed to update AI configuration.");
        } finally {
            setSavingAI(false);
        }
    };
    const handleUserUpdated = (updatedUser: TeamMember) => {
        setTeamMembers((currentMembers) =>
            currentMembers.map((member) =>
                member.id === updatedUser.id
                    ? updatedUser
                    : member
            )
        );
    };
    return (
        <section className="w-full">
            <div className="mx-auto w-full max-w-260 space-y-5 px-3 sm:px-4 md:px-5">
                {/* Page Header */}
                <PageHeader
                    title="Settings"
                    subtitle={`Scoring version #${scoringConfig.version} · changes take effect on the next scoring run`}
                />

                <SettingsTeam
                    teamMembers={teamMembers}
                    onUserUpdated={handleUserUpdated}
                />

                <SettingsScoring
                    scoringConfig={scoringConfig}
                    factorWeights={factorWeights}
                    setFactorWeights={setFactorWeights}
                    targetCountries={targetCountries}
                    setTargetCountries={setTargetCountries}
                    targetIndustries={targetIndustries}
                    setTargetIndustries={setTargetIndustries}
                />

                <SettingsOpportunity
                    attachRate={attachRate}
                    setAttachRate={setAttachRate}
                    revenuePerOrder={revenuePerOrder}
                    setRevenuePerOrder={setRevenuePerOrder}
                />

                <SettingsPublish
                    publishing={publishing}
                    handlePublish={handlePublish}
                />

                <SettingsAITasks
                    aiConfigs={aiConfigs}
                    editingAI={editingAI}
                    setEditingAI={setEditingAI}
                    aiPrompt={aiPrompt}
                    setAIPrompt={setAIPrompt}
                    aiModel={aiModel}
                    setAIModel={setAIModel}
                    aiTemperature={aiTemperature}
                    setAITemperature={setAITemperature}
                    savingAI={savingAI}
                    handleEditAI={handleEditAI}
                    handleSaveAI={handleSaveAI}
                />
            </div>
        </section>
    );
}
