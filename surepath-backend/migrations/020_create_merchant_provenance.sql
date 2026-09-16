CREATE TABLE merchant_provenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    merchant_id UUID NOT NULL
        REFERENCES merchants(id)
        ON DELETE CASCADE,

    field_key VARCHAR(100) NOT NULL,

    value TEXT,

    source VARCHAR(100) NOT NULL,

    confidence NUMERIC(10, 8),

    evidence JSONB,

    verified_at TIMESTAMPTZ,

    is_current BOOLEAN NOT NULL DEFAULT TRUE,

    is_manual_override BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_merchant_provenance_merchant_id
    ON merchant_provenance(merchant_id);

CREATE INDEX idx_merchant_provenance_field
    ON merchant_provenance(merchant_id, field_key);

CREATE UNIQUE INDEX idx_one_current_provenance_per_field
    ON merchant_provenance(merchant_id, field_key)
    WHERE is_current = TRUE;