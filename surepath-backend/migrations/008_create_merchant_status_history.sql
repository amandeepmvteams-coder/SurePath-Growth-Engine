CREATE TABLE merchant_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    merchant_id UUID NOT NULL
        REFERENCES merchants(id)
        ON DELETE CASCADE,

    from_status VARCHAR(100),

    to_status VARCHAR(100) NOT NULL,

    changed_by UUID
        REFERENCES users(id),

    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_merchant_status_history_merchant_id
    ON merchant_status_history(merchant_id);

CREATE INDEX idx_merchant_status_history_changed_at
    ON merchant_status_history(changed_at);