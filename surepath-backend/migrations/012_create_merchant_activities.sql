CREATE TABLE merchant_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    merchant_id UUID NOT NULL
        REFERENCES merchants(id)
        ON DELETE CASCADE,

    activity_type VARCHAR(50) NOT NULL,

    direction VARCHAR(20),

    channel VARCHAR(50),

    subject VARCHAR(255),

    body TEXT,

    detail JSONB,

    occurred_at TIMESTAMPTZ NOT NULL,

    logged_by UUID
        REFERENCES users(id),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_merchant_activities_merchant_id
    ON merchant_activities(merchant_id);

CREATE INDEX idx_merchant_activities_occurred_at
    ON merchant_activities(occurred_at);

CREATE INDEX idx_merchant_activities_logged_by
    ON merchant_activities(logged_by);

CREATE INDEX idx_merchant_activities_activity_type
    ON merchant_activities(activity_type);