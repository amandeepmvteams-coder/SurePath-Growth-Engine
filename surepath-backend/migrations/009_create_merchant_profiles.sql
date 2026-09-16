CREATE TABLE merchant_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    merchant_id UUID NOT NULL UNIQUE
        REFERENCES merchants(id)
        ON DELETE CASCADE,

    company_name VARCHAR(255),

    description TEXT,

    shipping_policy TEXT,

    return_policy TEXT,

    contact_email VARCHAR(255),

    contact_phone VARCHAR(50),

    shipping_policy_summary TEXT,

    return_policy_summary TEXT,

    research_summary TEXT,

    estimated_monthly_orders INTEGER,

    avg_order_value NUMERIC(38, 10),

    traffic_estimate BIGINT,

    tech_stack JSONB,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_merchant_profiles_merchant_id
    ON merchant_profiles(merchant_id);