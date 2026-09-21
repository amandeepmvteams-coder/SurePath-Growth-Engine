import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SettingsPublishProps {
    publishing: boolean;
    handlePublish: () => Promise<void>;
}

export default function SettingsPublish({
    publishing,
    handlePublish,
}: SettingsPublishProps) {
    return (
        <div className="space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                    placeholder="Your name (optional)"
                    className="h-9 w-full text-xs sm:w-50"
                />

                <Button
                    size="sm"
                    className="h-9 w-full px-4 text-xs sm:w-auto"
                    onClick={handlePublish}
                    disabled={publishing}
                >
                    {publishing ? "Publishing..." : "Publish new version"}
                </Button>
            </div>

            <p className="text-[10px] leading-4 text-muted-foreground">
                Publishing writes a new configuration and retires the current one;
                past scores keep pointing at the version that produced them, so a
                ranking can always be traced back.
            </p>
        </div>
    );
}
