export interface DetectionRunRequest {
    merchant_id?: string;
    merchant_ids?: string[];
    limit?: number;
}

export interface DetectionRunResult {
    merchants: number;
    detections: number;
    errors: string[];
}