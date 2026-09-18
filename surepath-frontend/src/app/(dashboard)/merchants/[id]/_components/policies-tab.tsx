"use client"
import { Card, CardContent } from "@/components/ui/card";

import { useEffect, useState } from "react";
import { getMerchantProfile } from "@/features/profiles/api/profile.api";
import type { MerchantProfile } from "@/features/profiles/types/profile.types";

interface PoliciesTabProps {
    merchantId: string;
}

export default function PoliciesTab({
    merchantId,
}: PoliciesTabProps) {
    const [profile, setProfile] =
        useState<MerchantProfile | null>(null);

    const [profileLoading, setProfileLoading] =
        useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setProfileLoading(true);

                const result =
                    await getMerchantProfile(merchantId);

                setProfile(result);
            } catch (error) {
                console.error(
                    "Failed to load merchant profile:",
                    error
                );
                setProfile(null);
            } finally {
                setProfileLoading(false);
            }
        };

        void loadProfile();
    }, [merchantId]);
    return (
        <Card className="max-w-xl">
            <CardContent className="p-0">
                {/* Header */}
                <div className="border-b px-4 py-3">
                    <p className="text-sm font-semibold">
                        Policies
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-5 px-4 py-4">
                    {/* Shipping */}
                    <div className="space-y-1">
                        <p className="text-xs font-medium uppercase text-foreground">
                            Shipping
                        </p>

                        {profileLoading ? (
                            <p className="text-sm text-muted-foreground">
                                Loading shipping policy...
                            </p>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                {profile?.shipping_policy_summary ||
                                    profile?.shipping_policy ||
                                    "Not published by this merchant, or the page could not be read."}
                            </p>
                        )}
                    </div>

                    {/* Returns */}
                    <div className="space-y-1">
                        <p className="text-xs font-medium uppercase text-foreground">
                            Returns
                        </p>

                        {profileLoading ? (
                            <p className="text-sm text-muted-foreground">
                                Loading return policy...
                            </p>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                {profile?.return_policy_summary ||
                                    profile?.return_policy ||
                                    "Not published by this merchant, or the page could not be read."}
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}