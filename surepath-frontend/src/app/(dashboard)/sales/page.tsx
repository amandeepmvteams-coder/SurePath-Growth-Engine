"use client"

import { useEffect, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import type { SalesTask } from "@/features/sales/types/sales.types";
import type { Merchant } from "@/features/merchants/types/merchant.types";
import { getSalesData } from "@/features/sales/api/sales.api";
import { useAuth } from "@/features/auth/context/auth.context";
export default function Page() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<SalesTask[]>([]);
    const [merchants, setMerchants] = useState<Merchant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState<number | null>(null);
    const [selectedWorkFilter, setSelectedWorkFilter] = useState<"my-work" | "all">("my-work");
    const [appliedWorkFilter, setAppliedWorkFilter] = useState<"my-work" | "all">("my-work");

    useEffect(() => {
        async function loadSales() {
            try {
                setLoading(true);
                setError(null);

                const data = await getSalesData();
              
                setTasks(data.tasks);
                setMerchants(data.merchants);
                setCurrentTime(Date.now());
            } catch (error) {
                console.error("Failed to load sales data:", error);
                setError("Failed to load sales data.");
            } finally {
                setLoading(false);
            }
        }

        loadSales();
    }, []);

    const filteredTasks =
        appliedWorkFilter === "my-work"
            ? tasks.filter(
                (task) => task.assigned_to_id === user?.id
            )
            : tasks;

    const openTasks = filteredTasks.filter(
        (task) => !task.completed_at
    );
    const overdueTasks = currentTime
        ? openTasks.filter(
            (task) =>
                task.due_at &&
                new Date(task.due_at).getTime() < currentTime
        )
        : [];
    const today = currentTime
        ? new Date(currentTime)
        : null;

    const dueTodayTasks = today
        ? openTasks.filter((task) => {
            if (!task.due_at) {
                return false;
            }

            const dueDate = new Date(task.due_at);

            return (
                dueDate.getFullYear() === today.getFullYear() &&
                dueDate.getMonth() === today.getMonth() &&
                dueDate.getDate() === today.getDate()
            );
        })
        : [];

    const comingUpTasks = currentTime
        ? openTasks
            .filter((task) => {
                if (!task.due_at) {
                    return false;
                }

                return (
                    new Date(task.due_at).getTime() >=
                    currentTime
                );
            })
            .sort(
                (a, b) =>
                    new Date(a.due_at!).getTime() -
                    new Date(b.due_at!).getTime()
            )
        : [];

    const followUpMerchants = merchants
        .filter((merchant) => merchant.next_follow_up_at)
        .sort(
            (a, b) =>
                new Date(a.next_follow_up_at!).getTime() -
                new Date(b.next_follow_up_at!).getTime()
        );

    const twoWeeksAgo = currentTime
        ? currentTime - 14 * 24 * 60 * 60 * 1000
        : null;

    const quietMerchants =
        twoWeeksAgo !== null
            ? merchants.filter((merchant) => {
                if (!merchant.last_activity_at) {
                    return false;
                }

                return (
                    new Date(
                        merchant.last_activity_at
                    ).getTime() < twoWeeksAgo
                );
            })
            : [];

    const formatTaskDate = (date: string | null) => {
        if (!date) {
            return "No due date";
        }

        return new Date(date).toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const formatFollowUpDate = (date: string | null) => {
        if (!date) {
            return "No follow-up date";
        }

        return new Date(date).toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };
    return (
        <section className="w-full h-full">
            {loading ? (
                <div className="mx-auto flex min-h-75 w-full max-w-7xl items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                        Loading sales data...
                    </p>
                </div>
            ) : error ? (
                <div className="mx-auto flex min-h-75 w-full max-w-7xl items-center justify-center">
                    <p className="text-sm text-destructive">
                        {error}
                    </p>
                </div>
            ) : (
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
                    <PageHeader
                        title="Sales"
                        subtitle="What you owe today, and what is going quiet."
                    />

                    {/* Filter */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Showing
                        </span>

                        <Select
                            value={selectedWorkFilter}
                            onValueChange={(value) =>
                                setSelectedWorkFilter(value as "my-work" | "all")
                            }
                        >
                            <SelectTrigger className="h-9! w-29">
                                <SelectValue />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="my-work">
                                    My work
                                </SelectItem>
                                <SelectItem value="all">
                                    All work
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9"
                            onClick={() => setAppliedWorkFilter(selectedWorkFilter)}
                        >
                            Show
                        </Button>
                    </div>
                    {/* Statistics */}
                    <Card className="gap-0 py-0">
                        <CardContent className="grid grid-cols-2 sm:grid-cols-4  p-0">
                            <div className="px-4 py-4">
                                <p className="text-2xl font-semibold">{overdueTasks.length}</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    overdue
                                </p>
                            </div>

                            <div className="px-4 py-4">
                                <p className="text-2xl font-semibold">{dueTodayTasks.length}</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    due today
                                </p>
                            </div>

                            <div className="px-4 py-4">
                                <p className="text-2xl font-semibold">{openTasks.length}</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    open tasks
                                </p>
                            </div>

                            <div className="px-4 py-4">
                                <p className="text-2xl font-semibold">{merchants.length}</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    merchants
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Sales sections */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Overdue */}
                        <Card className="gap-0 py-0">
                            <CardContent className="p-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Overdue
                                </p>

                                {overdueTasks.length === 0 ? (
                                    <p className="mt-4 text-sm text-muted-foreground">
                                        Nothing overdue.
                                    </p>
                                ) : (
                                    <div className="mt-4 space-y-3">
                                        {overdueTasks.map((task) => (
                                            <div
                                                key={task.id}
                                                className="rounded-md border p-3"
                                            >
                                                <p className="text-sm font-medium">
                                                    {task.title}
                                                </p>

                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {task.merchant_store_name ??
                                                        task.merchant_domain}
                                                </p>

                                                {task.due_at && (
                                                    <p className="mt-2 text-xs text-muted-foreground">
                                                        Due {formatTaskDate(task.due_at)}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Coming Up */}
                        <Card className="gap-0 py-0">
                            <CardContent className="p-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Coming Up
                                </p>

                                {comingUpTasks.length === 0 ? (
                                    <p className="mt-4 text-sm text-muted-foreground">
                                        No open tasks.
                                    </p>
                                ) : (
                                    <div className="mt-4 space-y-3">
                                        {comingUpTasks.map((task) => (
                                            <div
                                                key={task.id}
                                                className="rounded-md border p-3"
                                            >
                                                <p className="text-sm font-medium">
                                                    {task.title}
                                                </p>

                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {task.merchant_store_name ??
                                                        task.merchant_domain}
                                                </p>

                                                {task.due_at && (
                                                    <p className="mt-2 text-xs text-muted-foreground">
                                                        Due {formatTaskDate(task.due_at)}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Next Follow-ups */}
                        <Card className="gap-0 py-0">
                            <CardContent className="p-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Next Follow-ups
                                </p>

                                {followUpMerchants.length === 0 ? (
                                    <p className="mt-4 text-sm text-muted-foreground">
                                        No follow-up dates set.
                                    </p>
                                ) : (
                                    <div className="mt-4 space-y-3">
                                        {followUpMerchants.map((merchant) => (
                                            <div
                                                key={merchant.id}
                                                className="rounded-md border p-3"
                                            >
                                                <p className="text-sm font-medium">
                                                    {merchant.store_name ??
                                                        merchant.domain}
                                                </p>

                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {merchant.domain}
                                                </p>

                                                <p className="mt-2 text-xs text-muted-foreground">
                                                    Follow up {formatFollowUpDate(merchant.next_follow_up_at)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Going Quiet */}
                        <Card className="gap-0 py-0">
                            <CardContent className="p-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Going Quiet
                                </p>

                                {quietMerchants.length === 0 ? (
                                    <div className="mt-3">
                                        <p className="text-sm text-muted-foreground">
                                            Nothing logged in two weeks.
                                        </p>

                                        <p className="mt-2 text-sm">
                                            Everything has been touched recently.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="mt-3 space-y-3">
                                        {quietMerchants.map((merchant) => (
                                            <div
                                                key={merchant.id}
                                                className="rounded-md border p-3"
                                            >
                                                <p className="text-sm font-medium">
                                                    {merchant.store_name ??
                                                        merchant.domain}
                                                </p>

                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {merchant.domain}
                                                </p>

                                                <p className="mt-2 text-xs text-muted-foreground">
                                                    Last activity{" "}
                                                    {new Date(
                                                        merchant.last_activity_at!
                                                    ).toLocaleDateString(undefined, {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                    })}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

        </section>
    );
}