export type ActivityType =
    | "system"
    | "outreach";

export interface Activity {
    id: number;
    title: string;
    timestamp: string;
    type: ActivityType;

    channel?: string;
    direction?: string;
    summary?: string;
    notes?: string;
}