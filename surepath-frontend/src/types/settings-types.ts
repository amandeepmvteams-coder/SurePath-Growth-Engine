export type TeamMember = {
    id: number;
    name: string;
    email: string;
    lastSignedIn: string;
    role: "admin" | "sales";
};

export type WeightItem = {
    id: string;
    label: string;
    value: number;
    config?: string;
};

export type OpportunityAssumption = {
    id: string;
    label: string;
    value: string;
    description: string;
};

export type AiTask = {
    id: number;
    name: string;
    model: string;
    version: string;
};