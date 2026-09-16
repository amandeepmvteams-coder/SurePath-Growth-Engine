import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { TEAM_MEMBERS, AI_TASKS, OPPORTUNITY_ASSUMPTIONS, WEIGHTS } from "@/data/settings";
export default function SettingsPage() {
    return (
        <section className="w-full">
            <div className="mx-auto w-full max-w-260 space-y-5 px-3 sm:px-4 md:px-5">

                {/* Page Header */}
                <PageHeader
                    title="Settings"
                    subtitle="Scoring version #243 · changes take effect on the next scoring run"
                />

                {/* Team */}
                <Card className="gap-0 py-0">
                    <CardHeader className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-sm font-semibold">
                                Team
                            </CardTitle>

                            <p className="mt-1 text-xs text-muted-foreground">
                                Who can sign in, and who merchants and follow-ups can be assigned to.
                            </p>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-full text-xs sm:w-auto"
                        >
                            Add someone
                        </Button>
                    </CardHeader>

                    <CardContent className="p-2 space-y-2">
                        {TEAM_MEMBERS.map((member) => (
                            <div
                                key={member.id}
                                className="flex flex-col gap-3 rounded-md bg-muted px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                            >
                                {/* Left */}
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium">
                                            {member.name}
                                        </p>

                                        <span
                                            className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${member.role === "admin"
                                                ? "bg-foreground text-background"
                                                : "bg-muted text-muted-foreground"
                                                }`}
                                        >
                                            {member.role}
                                        </span>
                                    </div>

                                    <p className="mt-1 break-all text-[10px] text-muted-foreground">
                                        {member.name} · {member.email} · {member.lastSignedIn}
                                    </p>
                                </div>

                                {/* Right */}
                                <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:gap-3">
                                    <Select defaultValue={member.role}>
                                        <SelectTrigger className="h-6! w-[90px] rounded-sm bg-white text-xs!">
                                            <SelectValue />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value="sales">
                                                Sales
                                            </SelectItem>

                                            <SelectItem value="admin">
                                                Admin
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <button
                                        type="button"
                                        className="text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        Reset password
                                    </button>

                                    <button
                                        type="button"
                                        className="text-xs text-muted-foreground hover:text-destructive"
                                    >
                                        Deactivate
                                    </button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Weights */}
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
                        {WEIGHTS.map((weight) => (
                            <div
                                key={weight.id}
                                className="grid grid-cols-1 gap-1 sm:grid-cols-[1fr_96px] sm:gap-x-2"
                            >
                                <Label className="text-xs font-medium">
                                    {weight.label}
                                </Label>

                                <Input
                                    type="number"
                                    defaultValue={weight.value}
                                    className="h-8 w-full text-xs sm:col-span-1"
                                />

                                {weight.config && (
                                    <Input
                                        defaultValue={weight.config}
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

                {/* Opportunity Assumptions */}
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
                        {OPPORTUNITY_ASSUMPTIONS.map((assumption) => (
                            <div
                                key={assumption.id}
                                className="space-y-1"
                            >
                                <Label className="text-[10px] font-medium">
                                    {assumption.label}
                                </Label>

                                <Input
                                    defaultValue={assumption.value}
                                    className="h-8 w-full text-xs"
                                />

                                <p className="text-[10px] text-muted-foreground">
                                    {assumption.description}
                                </p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Publish version */}
                <div className="space-y-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Input
                            placeholder="Your name (optional)"
                            className="h-9 w-full text-xs sm:w-50"
                        />

                        <Button
                            size="sm"
                            className="h-9 w-full px-4 text-xs sm:w-auto"

                        >
                            Publish new version
                        </Button>
                    </div>

                    <p className="text-[10px] leading-4 text-muted-foreground">
                        Publishing writes a new configuration and retires the current one;
                        past scores keep pointing at the version that produced them, so a
                        ranking can always be traced back.
                    </p>
                </div>

                {/* AI Tasks */}

                <Card className="gap-0 py-0">
                    <CardHeader className="px-4 pt-4 pb-3">
                        <CardTitle className="text-sm font-semibold">
                            AI tasks
                        </CardTitle>

                        <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                            Prompts and model choice are versioned the same way, so a stored
                            summary can be traced to the prompt that wrote it. Editing them
                            here is not built yet — they are shown so the live configuration
                            is visible.
                        </p>
                    </CardHeader>

                    <CardContent className="px-4 pb-4 ">
                        <div className="space-y-2">
                            {AI_TASKS.map((task) => (
                                <div
                                    key={task.id}
                                    className="flex flex-col gap-2 rounded-md bg-muted px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                                        <span className="text-xs font-medium">
                                            {task.name}
                                        </span>

                                        <span className="text-[10px] text-muted-foreground">
                                            {task.model}
                                        </span>
                                    </div>

                                    <span className="text-[10px] text-muted-foreground sm:shrink-0">
                                        {task.version}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </section>
    );
}