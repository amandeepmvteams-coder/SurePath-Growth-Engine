import type { Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScoringConfig } from "@/features/settings/types/settings.types";

interface SettingsScoringProps {
    scoringConfig: ScoringConfig;
    factorWeights: Record<string, number>;
    setFactorWeights: Dispatch<SetStateAction<Record<string, number>>>;
    targetCountries: string;
    setTargetCountries: Dispatch<SetStateAction<string>>;
    targetIndustries: string;
    setTargetIndustries: Dispatch<SetStateAction<string>>;
}

export default function SettingsScoring({
    scoringConfig,
    factorWeights,
    setFactorWeights,
    targetCountries,
    setTargetCountries,
    targetIndustries,
    setTargetIndustries,
}: SettingsScoringProps) {
    const weights = [
        {
            id: "contactable",
            label: "Contactable",
            value: scoringConfig.factor_weights.contactable,
        },
        {
            id: "target_country",
            label: "Target Country",
            value: scoringConfig.factor_weights.target_country,
            config: scoringConfig.criteria.target_country.countries.join(", "),
        },
        {
            id: "target_industry",
            label: "Target Industry",
            value: scoringConfig.factor_weights.target_industry,
            config: scoringConfig.criteria.target_industry.industries.join(", "),
        },
        {
            id: "platform_confirmed",
            label: "Platform Confirmed",
            value: scoringConfig.factor_weights.platform_confirmed,
        },
        {
            id: "no_existing_provider",
            label: "No Existing Provider",
            value: scoringConfig.factor_weights.no_existing_provider,
        },
        {
            id: "weak_returns_coverage",
            label: "Weak Returns Coverage",
            value: scoringConfig.factor_weights.weak_returns_coverage,
        },
    ];

    return (
        <Card className="gap-0 py-0">
            <CardHeader className="flex flex-col gap-1 px-4 pt-4 pb-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-sm font-semibold">
                    Weights
                </CardTitle>

                <span className="text-[10px] text-muted-foreground">
                    100 points across 6 factors
                </span>
            </CardHeader>

            <CardContent className="space-y-2 px-4 pb-3">
                {weights.map((weight) => (
                    <div
                        key={weight.id}
                        className="grid grid-cols-1 gap-1 sm:grid-cols-[1fr_96px] sm:gap-x-2"
                    >
                        <Label className="text-xs font-medium">
                            {weight.label}
                        </Label>

                        <Input
                            type="number"
                            value={factorWeights[weight.id] ?? ""}
                            onChange={(event) => {
                                const value = Number(event.target.value);

                                setFactorWeights((current) => ({
                                    ...current,
                                    [weight.id]: value,
                                }));
                            }}
                            className="h-8 w-full text-xs sm:col-span-1"
                        />

                        {weight.id === "target_country" && (
                            <Input
                                value={targetCountries}
                                onChange={(event) => setTargetCountries(event.target.value)}
                                className="col-span-1 h-8 text-xs"
                            />
                        )}

                        {weight.id === "target_industry" && (
                            <Input
                                value={targetIndustries}
                                onChange={(event) => setTargetIndustries(event.target.value)}
                                className="col-span-1 h-8 text-xs"
                            />
                        )}
                    </div>
                ))}

                <p className="pt-1 text-[10px] leading-4 text-muted-foreground">
                    A factor whose input cannot be read is skipped, reducing the
                    points available rather than scoring zero — so a merchant is
                    never penalised for a page we could not fetch. A factor with an
                    empty values list can never match.
                </p>
            </CardContent>
        </Card>
    );
}
