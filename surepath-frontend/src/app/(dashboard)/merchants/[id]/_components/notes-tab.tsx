"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
    createMerchantNote,
    getMerchantNotes,
} from "@/features/notes/api/notes.api";

import type { MerchantNote } from "@/features/notes/types/note.types";

interface NotesTabProps {
    merchantId: string;
}

export default function NotesTab({ merchantId }: NotesTabProps) {
    const [note, setNote] = useState("");
    const [notes, setNotes] = useState<MerchantNote[]>([]);
    const [notesLoading, setNotesLoading] = useState(true);

    useEffect(() => {
        const loadNotes = async () => {
            try {
                setNotesLoading(true);

                const result = await getMerchantNotes(merchantId);

                setNotes(result);
            } catch (error) {
                console.error(
                    "Failed to load merchant notes:",
                    error
                );
            } finally {
                setNotesLoading(false);
            }
        };

        void loadNotes();
    }, [merchantId]);

    const handleAddNote = async () => {
        if (!note.trim()) return;

        try {
            const createdNote = await createMerchantNote(
                merchantId,
                {
                    body: note.trim(),
                }
            );

            setNotes((prev) => [createdNote, ...prev]);

            setNote("");
        } catch (error) {
            console.error(
                "Failed to create merchant note:",
                error
            );
        }
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
                    {notesLoading ? (
                        <p className="text-xs text-muted-foreground">
                            Loading notes...
                        </p>
                    ) : notes.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                            No notes yet.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {notes.map((item) => (
                                <div
                                    key={item.id}
                                    className="border-b pb-2 text-xs"
                                >
                                    <p>{item.body}</p>

                                    <div className="mt-1 text-muted-foreground">
                                        {item.author ?? "Unknown"} ·{" "}
                                        {new Date(
                                            item.created_at
                                        ).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}