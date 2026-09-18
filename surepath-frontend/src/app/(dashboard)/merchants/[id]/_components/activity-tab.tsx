"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    createMerchantActivity,
    getMerchantActivities,
} from "@/features/activities/api/activities.api";

import type { MerchantActivity } from "@/features/activities/types/activity.types";
import { toast } from "sonner";
import axios from "axios";

// Activity Tabs Types Interface
interface ActivityTabProps {
    merchantId: string;
    onActivityCountChange: (count: number) => void;
    onMerchantRefresh: () => Promise<void>;
}
export default function ActivityTab({
    merchantId,
    onActivityCountChange,
    onMerchantRefresh,
}: ActivityTabProps) {
    const [activities, setActivities] = useState<MerchantActivity[]>([]);
    const [activitiesLoading, setActivitiesLoading] = useState(true);
    // Activity Tabs States 
    const [isLoggingOutreach, setIsLoggingOutreach] = useState(false);
    const [outreachType, setOutreachType] = useState("Call");
    const [direction, setDirection] = useState("Outbound");
    const [channel, setChannel] = useState("");
    const [when, setWhen] = useState("");
    const [summary, setSummary] = useState("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        const loadActivities = async () => {
            try {
                setActivitiesLoading(true);

                const result = await getMerchantActivities(
                    merchantId
                );

                setActivities(result);
                onActivityCountChange(result.length);
            } catch (error) {
                console.error(
                    "Failed to load merchant activities:",
                    error
                );
            } finally {
                setActivitiesLoading(false);
            }
        };

        void loadActivities();
    }, [merchantId, onActivityCountChange]);

    // Reset Form Function 
    const resetOutreachForm = () => {
        setOutreachType("Call");
        setDirection("Outbound");
        setChannel("");
        setWhen("");
        setSummary("");
        setNotes("");
    };

    // Handle Cancel Function 
    const handleCancel = () => {
        resetOutreachForm();
        setIsLoggingOutreach(false);
    };


    // Handle LogOut Reach Submit Function 
    const handleLogOutreach = async () => {
        if (!summary.trim() && !notes.trim()) {
            toast.error("Please add a summary or notes.");
            return;
        }

        if (!when) {
            toast.error("Please select when the activity occurred.");
            return;
        }

        try {
            const activity = await createMerchantActivity(
                merchantId,
                {
                    activity_type: outreachType,
                    direction,
                    channel: channel.trim() || undefined,
                    subject: summary.trim() || undefined,
                    body: notes.trim() || undefined,
                    occurred_at: new Date(when).toISOString(),
                }
            );

            setActivities((prev) => [activity, ...prev]);

            onActivityCountChange(activities.length + 1);
            await onMerchantRefresh();
            toast.success("Activity logged successfully.");

            resetOutreachForm();
            setIsLoggingOutreach(false);
        } catch (error) {
            console.error("Failed to log activity:", error);

            if (axios.isAxiosError(error)) {
                toast.error(
                    error.response?.data?.message ||
                    "Failed to log activity."
                );
            } else {
                toast.error("Failed to log activity.");
            }
        }
    };

    return (
        <div className="w-full max-w-200 space-y-4">
            {/* Log Outreach */}
            <Card className="gap-0 py-0">
                <CardHeader className="border-b px-4 py-3">
                    <CardTitle className="text-sm font-semibold">
                        Log outreach
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-4">
                    {!isLoggingOutreach ? (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9"
                            onClick={() => setIsLoggingOutreach(true)}
                        >
                            Log outreach
                        </Button>
                    ) : (
                        <div className="space-y-4">

                            {/* What + Direction */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="min-w-0 space-y-2">
                                    <Label className="text-xs">What</Label>

                                    <Select
                                        value={outreachType}
                                        onValueChange={setOutreachType}
                                    >
                                        <SelectTrigger className="h-9! w-full">
                                            <SelectValue />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value="Call">Call</SelectItem>
                                            <SelectItem value="Email">Email</SelectItem>
                                            <SelectItem value="Meeting">Meeting</SelectItem>
                                            <SelectItem value="Outreach">Outreach</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="min-w-0 space-y-2">
                                    <Label className="text-xs">Direction</Label>

                                    <Select
                                        value={direction}
                                        onValueChange={setDirection}
                                    >
                                        <SelectTrigger className="h-9! w-full">
                                            <SelectValue />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value="Outbound">
                                                Outbound
                                            </SelectItem>

                                            <SelectItem value="Inbound">
                                                Inbound
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* Channel */}
                                <div className="min-w-0 space-y-2">
                                    <Label className="text-xs">Channel</Label>

                                    <Input
                                        value={channel}
                                        onChange={(e) => setChannel(e.target.value)}
                                        placeholder="phone, email, LinkedIn..."
                                        className="h-9! w-full min-w-0"
                                    />
                                </div>

                                {/* When */}
                                <div className="min-w-0 space-y-2">
                                    <Label className="text-xs">When</Label>

                                    <Input
                                        type="datetime-local"
                                        value={when}
                                        onChange={(e) => setWhen(e.target.value)}
                                        className="h-9! w-full min-w-0"
                                    />
                                </div>
                            </div>



                            {/* Summary */}
                            <div className="space-y-2">
                                <Label className="text-xs">Summary</Label>

                                <Input
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    placeholder="Spoke to the founder about pricing"
                                    className="h-9"
                                />
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label className="text-xs">Notes</Label>

                                <Textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="What was said and what happened next"
                                    className="min-h-20 resize-none"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap justify-end gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancel}
                                    className="h-9"

                                >
                                    Cancel
                                </Button>

                                <Button
                                    type="button"
                                    size="sm"
                                    className="h-9"
                                    onClick={handleLogOutreach}
                                >
                                    Log it
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Activity History */}
            <Card className="gap-0 py-0">
                <CardHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
                    <CardTitle className="text-sm font-semibold">
                        Activity
                    </CardTitle>

                    <span className="text-xs text-muted-foreground">
                        {activities.length}
                    </span>
                </CardHeader>

                <CardContent className="p-4">
                    <div className="space-y-3">
                        {activitiesLoading ? (
                            <p className="text-sm text-muted-foreground">
                                Loading activities...
                            </p>
                        ) : activities.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No activities yet.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {activities.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex gap-3"
                                    >
                                        <div className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/40" />

                                        <div>
                                            <p className="text-sm font-medium">
                                                {activity.subject ??
                                                    activity.activity_type}
                                            </p>

                                            {activity.body && (
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {activity.body}
                                                </p>
                                            )}

                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {activity.activity_type}
                                                {activity.direction
                                                    ? ` · ${activity.direction}`
                                                    : ""}
                                                {activity.channel
                                                    ? ` · ${activity.channel}`
                                                    : ""}
                                                {" · "}
                                                {new Date(
                                                    activity.occurred_at
                                                ).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
