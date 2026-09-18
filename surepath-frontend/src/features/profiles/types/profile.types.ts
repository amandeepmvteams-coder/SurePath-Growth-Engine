export interface MerchantProfile {
    id: string;
    merchant_id: string;

    company_name: string | null;
    description: string | null;

    shipping_policy: string | null;
    return_policy: string | null;

    contact_email: string | null;
    contact_phone: string | null;

    shipping_policy_summary: string | null;
    return_policy_summary: string | null;

    research_summary: string | null;

    estimated_monthly_orders: number | null;
    avg_order_value: string | null;

    traffic_estimate: number | null;

    tech_stack: Record<string, unknown> | null;

    updated_at: string;
}