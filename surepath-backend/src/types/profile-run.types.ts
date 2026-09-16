export interface ProfileRunRequest {
    merchant_id?: string;
    merchant_ids?: string[];
    limit?: number;
}

export interface ProfileRunResult {
    built: number;
    skipped: number;
    contacts_found: number;
    errors: string[];
}