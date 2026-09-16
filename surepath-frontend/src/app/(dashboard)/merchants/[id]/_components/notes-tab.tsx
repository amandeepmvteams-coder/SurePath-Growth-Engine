"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface NotesTabProps {
    merchantId: number;
}

export default function NotesTab({ merchantId }: NotesTabProps) {
    const [note, setNote] = useState("");
    const [notes, setNotes] = useState<string[]>([]);

    const handleAddNote = () => {
        if (!note.trim()) return;

        setNotes((prev) => [...prev, note]);
        setNote("");
    };

    return (
        <Card className="w-full max-w-200">
            <CardHeader className="flex flex-row items-center justify-between border-b px-4 py-4">
                <CardTitle className="text-xs font-semibold">
                    Notes
                </CardTitle>

                <span className="text-xs text-muted-foreground">
                    {notes.length}
                </span>
            </CardHeader>

            <CardContent className="p-3">
                <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="What did you learn? e.g. locked into Route until March, revisit Q2"
                    className="min-h-20 resize-none text-xs"
                />

                <div className="mt-2 flex justify-end">
                    <Button
                        size="sm"
                        className="h-9 px-4 text-xs"
                        onClick={handleAddNote}
                    >
                        Add note
                    </Button>
                </div>

                <div className="mt-3">
                    {notes.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                            No notes yet.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {notes.map((item, index) => (
                                <div
                                    key={index}
                                    className="border-b pb-2 text-xs"
                                >
                                    {item}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}