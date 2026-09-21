
export interface SalesTask {
    id: string;
    merchant_id: string;
    merchant_domain: string;
    merchant_store_name: string | null;
    title: string;
    notes: string | null;
    due_at: string | null;
    completed_at: string | null;
    assigned_to: string | null;
    assigned_to_id: string | null;
    created_by: string;
    created_at: string;
}

export interface TaskSummary {
    open: number;
    overdue: number;
    due_today: number;
    undated: number;
}

