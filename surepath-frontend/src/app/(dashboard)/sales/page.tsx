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
import { tasks } from "@/data/tasks";
import { merchants } from "@/data/merchants";


export default function Page() {

    const openTasks = tasks.filter(
        (task) => !task.completed
    );
    const overdueTasks = openTasks.filter(
        (task) => task.dueDate && new Date(task.dueDate) < new Date()
    );
    const today = new Date().toISOString().split("T")[0];

    const dueTodayTasks = openTasks.filter(
        (task) => task.dueDate === today
    );

    return (
        <section className="w-full h-full">
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

                    <Select defaultValue="my-work">
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

                            <p className="mt-4 text-sm text-muted-foreground">
                                Nothing overdue.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Coming Up */}
                    <Card className="gap-0 py-0">
                        <CardContent className="p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Coming Up
                            </p>

                            <p className="mt-4 text-sm text-muted-foreground">
                                No open tasks.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Next Follow-ups */}
                    <Card className="gap-0 py-0">
                        <CardContent className="p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Next Follow-ups
                            </p>

                            <p className="mt-4 text-sm text-muted-foreground">
                                No follow-up dates set.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Going Quiet */}
                    <Card className="gap-0 py-0">
                        <CardContent className="p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Going Quiet
                            </p>

                            <div className="mt-3 space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    Nothing logged in two weeks.
                                </p>

                                <p className="text-sm">
                                    Everything has been touched recently.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}