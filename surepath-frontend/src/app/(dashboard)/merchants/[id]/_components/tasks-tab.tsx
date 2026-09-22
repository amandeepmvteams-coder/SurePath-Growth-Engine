"use client";

import { useEffect, useState } from "react";
import { getTeamMembers } from "@/features/settings/api/settings.api";
import type { TeamMember } from "@/features/settings/types/settings.types";
import { createMerchantTask, getMerchantTasks } from "@/features/tasks/api/tasks.api";
import type { MerchantTask } from "@/features/tasks/types/task.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";



interface TasksTabProps {
    merchantId: string;
}

export default function TasksTab({
    merchantId,
}: TasksTabProps) {

    const [tasks, setTasks] = useState<MerchantTask[]>([]);
    const [tasksLoading, setTasksLoading] = useState(true);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [teamMembersLoading, setTeamMembersLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [details, setDetails] = useState("");
    const [assignee, setAssignee] = useState("Nobody yet");
    const [dueDate, setDueDate] = useState("");

    useEffect(() => {
        const loadTeamMembers = async () => {
            try {
                setTeamMembersLoading(true);

                const result = await getTeamMembers();

                setTeamMembers(result.users);
            } catch (error) {
                console.error(
                    "Failed to load team members:",
                    error
                );
            } finally {
                setTeamMembersLoading(false);
            }
        };

        void loadTeamMembers();
    }, []);

    useEffect(() => {
        const loadTasks = async () => {
            try {
                setTasksLoading(true);

                const result = await getMerchantTasks(
                    merchantId
                );

                setTasks(result);
            } catch (error) {
                console.error(
                    "Failed to load merchant tasks:",
                    error
                );
            } finally {
                setTasksLoading(false);
            }
        };

        void loadTasks();
    }, [merchantId]);

    const handleAddTask = async () => {
        if (!title.trim()) return;

        try {
            const task = await createMerchantTask(merchantId, {
                title: title.trim(),
                notes: details.trim() || undefined,
                assigned_to_id:
                    assignee !== "Nobody yet"
                        ? assignee
                        : undefined,
                due_at: dueDate
                    ? new Date(`${dueDate}T00:00:00`).toISOString()
                    : undefined,
            });

            setTasks((prev) => [...prev, task]);

            setTitle("");
            setDetails("");
            setAssignee("Nobody yet");
            setDueDate("");
        } catch (error) {
            console.error(
                "Failed to create merchant task:",
                error
            );
        }
    };

    const handleCancel = () => {
        setTitle("");
        setDetails("");
        setAssignee("Nobody yet");
        setDueDate("");
    };

    return (
        <Card className="w-full max-w-186.25 py-0 gap-0">
            {/* Header */}
            <CardHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
                <CardTitle className="text-sm font-semibold">
                    Tasks
                </CardTitle>

                <span className="text-xs text-muted-foreground">
                    all done
                </span>
            </CardHeader>

            <CardContent className="space-y-3 p-4">
                {/* Task list / Empty state */}
                {tasksLoading ? (
                    <p className="text-sm text-muted-foreground">
                        Loading tasks...
                    </p>
                ) : tasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No open tasks.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {tasks.map((task) => (
                            <div
                                key={task.id}
                                className="rounded-md border px-3 py-2"
                            >
                                <p className="wrap-break-word text-sm font-medium">
                                    {task.title}
                                </p>

                                {task.notes && (
                                    <p className="mt-1 wrap-break-word text-xs text-muted-foreground">
                                        {task.notes}
                                    </p>
                                )}

                                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                    <span>
                                        {task.assigned_to?.display_name ??
                                            task.assigned_to?.username ??
                                            "Nobody yet"}
                                    </span>

                                    {task.due_at && (
                                        <span>
                                            Due:{" "}
                                            {new Date(
                                                task.due_at
                                            ).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add task form */}
                <div className="space-y-3">
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Send the pricing sheet"
                        className="h-9"
                    />

                    <Input
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="Any detail worth remembering"
                        className="h-9"
                    />

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        {/* Assignee */}
                        <Select
                            value={assignee}
                            onValueChange={setAssignee}
                            disabled={teamMembersLoading}

                        >
                            <SelectTrigger className="h-9 w-full sm:w-27.5">
                                <SelectValue />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="Nobody yet">
                                    Nobody yet
                                </SelectItem>

                                {teamMembers.map((member) => (
                                    <SelectItem
                                        key={member.id}
                                        value={member.id}
                                    >
                                        {member.display_name || member.username}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Due date */}
                        <Input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="h-9 w-full sm:w-35"
                        />

                        {/* Add */}
                        <Button
                            type="button"
                            size="sm"
                            className="h-9 w-full bg-foreground px-3 text-xs text-background hover:bg-foreground/90 sm:w-auto"
                            onClick={handleAddTask}
                        >
                            Add task
                        </Button>

                        {/* Cancel */}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 w-full px-3 text-xs sm:w-auto"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
