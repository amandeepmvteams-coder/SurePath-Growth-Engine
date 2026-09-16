export interface Industry {
    id: string;
    name: string;
    is_active: boolean;
    created_at: Date;
}

export interface IndustryListResponse {
    industries: string[];
    fallback: string;
}