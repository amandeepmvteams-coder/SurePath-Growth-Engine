import type { Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SettingsOpportunityProps {
    attachRate: string;
    setAttachRate: Dispatch<SetStateAction<string>>;
    revenuePerOrder: string;
    setRevenuePerOrder: Dispatch<SetStateAction<string>>;
}

export default function SettingsOpportunity({
    attachRate,
    setAttachRate,
    revenuePerOrder,
    setRevenuePerOrder,
}: SettingsOpportunityProps) {
    return (
        <Card className="gap-0 py-0">
            <CardHeader className="px-4 pt-4 pb-3">
                <CardTitle className="text-sm font-semibold">
                    Opportunity assumptions
                </CardTitle>

                <p className=" text-[11px] leading-4 text-muted-foreground">
                    Your commercial figures — nothing can derive these. Together with a
                    merchant&apos;s monthly order volume they produce the opportunity
                    value; without them it stays null.
                </p>
            </CardHeader>

            <CardContent className="grid grid-cols-1 gap-3 px-4 pb-4 sm:grid-cols-2 sm:gap-x-3 sm:gap-y-3">
                <div className="space-y-1">
                    <Label className="text-[10px] font-medium">
                        Attach rate
                    </Label>

                    <Input
                        type="number"
                        step="0.1"
                        value={attachRate}
                        onChange={(event) => setAttachRate(event.target.value)}
                        className="h-8 w-full text-xs"
                    />

                    <p className="text-[10px] text-muted-foreground">
                        Share of orders buying protection
                    </p>
                </div>

                <div className="space-y-1">
                    <Label className="text-[10px] font-medium">
                        Revenue per order
                    </Label>

                    <Input
                        type="number"
                        step="0.1"
                        value={revenuePerOrder}
                        onChange={(event) => setRevenuePerOrder(event.target.value)}
                        className="h-8 w-full text-xs"
                    />

                    <p className="text-[10px] text-muted-foreground">
                        What SurePath earns on each
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
