import type { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AIConfig } from "@/features/settings/types/settings.types";

interface SettingsAITasksProps {
    aiConfigs: AIConfig[];
    editingAI: string | null;
    setEditingAI: Dispatch<SetStateAction<string | null>>;
    aiPrompt: string;
    setAIPrompt: Dispatch<SetStateAction<string>>;
    aiModel: string;
    setAIModel: Dispatch<SetStateAction<string>>;
    aiTemperature: string;
    setAITemperature: Dispatch<SetStateAction<string>>;
    savingAI: boolean;
    handleEditAI: (config: AIConfig) => void;
    handleSaveAI: () => Promise<void>;
}

export default function SettingsAITasks({
    aiConfigs,
    editingAI,
    setEditingAI,
    aiPrompt,
    setAIPrompt,
    aiModel,
    setAIModel,
    aiTemperature,
    setAITemperature,
    savingAI,
    handleEditAI,
    handleSaveAI,
}: SettingsAITasksProps) {
    return (
        <Card className="gap-0 py-0">
            <CardHeader className="px-4 pt-4 pb-3">
                <CardTitle className="text-sm font-semibold">
                    AI tasks
                </CardTitle>

                <p className="text-[10px] leading-4 text-muted-foreground">
                    Prompts and model choice are versioned the same way, so a stored
                    summary can be traced to the prompt that wrote it. Editing them
                    here is not built yet — they are shown so the live configuration
                    is visible.
                </p>
            </CardHeader>

            <CardContent className="px-4 pb-4 ">
                <div className="space-y-2 ">
                    {aiConfigs.map((task) => (
                        <div
                            key={task.id}
                            className="rounded-md bg-muted p-3"
                        >
                            {editingAI === task.id ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-medium">
                                                {task.key}
                                            </p>

                                            <p className="text-[10px] text-muted-foreground">
                                                v{task.version}
                                            </p>
                                        </div>

                                        <span className="rounded-md px-2 py-1 text-[10px]">
                                            {task.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-medium">
                                            Prompt
                                        </Label>

                                        <Input
                                            value={aiPrompt}
                                            onChange={(event) =>
                                                setAIPrompt(event.target.value)
                                            }
                                            className="h-8 text-xs"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-medium">
                                                Model
                                            </Label>

                                            <Input
                                                value={aiModel}
                                                onChange={(event) =>
                                                    setAIModel(event.target.value)
                                                }
                                                className="h-8 text-xs"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-medium">
                                                Temperature
                                            </Label>

                                            <Input
                                                type="number"
                                                step="0.1"
                                                value={aiTemperature}
                                                onChange={(event) =>
                                                    setAITemperature(event.target.value)
                                                }
                                                className="h-8 text-xs"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-xs"
                                            onClick={() => setEditingAI(null)}
                                            disabled={savingAI}
                                        >
                                            Cancel
                                        </Button>

                                        <Button
                                            type="button"
                                            size="sm"
                                            className="h-8 text-xs"
                                            onClick={handleSaveAI}
                                            disabled={savingAI}
                                        >
                                            {savingAI ? "Saving..." : "Save new version"}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium">
                                                {task.key}
                                            </p>

                                            <span className="rounded-md border px-2 py-1 text-[10px]">
                                                v{task.version}
                                            </span>

                                            <span
                                                className={`rounded-md px-2 py-1 text-[10px] ${task.is_active
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-muted text-muted-foreground"
                                                    }`}
                                            >
                                                {task.is_active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </div>

                                        <p className="mt-1 wrap-break-word text-[10px] text-muted-foreground">
                                            {task.prompt_template}
                                        </p>

                                        <p className="mt-1 text-[10px] text-muted-foreground">
                                            {task.model} · temperature{" "}
                                            {String(task.params.temperature ?? "—")}
                                        </p>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 w-full text-xs sm:w-auto"
                                        onClick={() => handleEditAI(task)}
                                    >
                                        Edit
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
