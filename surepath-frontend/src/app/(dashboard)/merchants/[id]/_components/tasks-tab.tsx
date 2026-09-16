"use client";

import { useState } from "react";

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

interface Task {
    id: string;
    title: string;
    details: string;
    assignee: string;
    dueDate: string;
}

export default function TasksTab() {
    const [tasks, setTasks] = useState<Task[]>([]);

    const [title, setTitle] = useState("");
    const [details, setDetails] = useState("");
    const [assignee, setAssignee] = useState("Nobody yet");
    const [dueDate, setDueDate] = useState("");

    const handleAddTask = () => {
        if (!title.trim()) return;

        const newTask: Task = {
            id: crypto.randomUUID(),
            title,
            details,
            assignee,
            dueDate,
        };

        setTasks((prev) => [...prev, newTask]);

        // Reset form
        setTitle("");
        setDetails("");
        setAssignee("Nobody yet");
        setDueDate("");
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
                {tasks.length === 0 ? (
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
                                <p className="break-words text-sm font-medium">
                                    {task.title}
                                </p>

                                {task.details && (
                                    <p className="mt-1 break-words text-xs text-muted-foreground">
                                        {task.details}
                                    </p>
                                )}

                                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                    <span>{task.assignee}</span>

                                    {task.dueDate && (
                                        <span>
                                            Due: {task.dueDate}
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
                        >
                            <SelectTrigger className="h-9 w-full sm:w-27.5">
                                <SelectValue />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="Nobody yet">
                                    Nobody yet
                                </SelectItem>

                                <SelectItem value="Admin">
                                    Admin
                                </SelectItem>

                                <SelectItem value="John Doe">
                                    John Doe
                                </SelectItem>

                                <SelectItem value="Jane Smith">
                                    Jane Smith
                                </SelectItem>
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
