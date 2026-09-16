CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    domain VARCHAR(255) NOT NULL UNIQUE,

    platform VARCHAR(100),

    store_name VARCHAR(255),

    country VARCHAR(100),

    industry VARCHAR(100),

    status VARCHAR(100) NOT NULL DEFAULT 'New',

    assigned_rep_id UUID
        REFERENCES users(id),

    next_follow_up_at TIMESTAMPTZ,

    outcome_reason TEXT,

    outcome_at TIMESTAMPTZ,

    last_activity_at TIMESTAMPTZ,

    source VARCHAR(100),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);