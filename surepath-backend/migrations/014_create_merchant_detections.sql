CREATE TABLE merchant_detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    merchant_id UUID NOT NULL
        REFERENCES merchants(id)
        ON DELETE CASCADE,

    provider_name VARCHAR(100) NOT NULL,

    is_detected BOOLEAN NOT NULL,

    confidence NUMERIC(10, 8),

    evidence JSONB,

    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    source VARCHAR(100),

    is_manual_override BOOLEAN NOT NULL DEFAULT FALSE,

    overridden_by UUID
        REFERENCES users(id),

    override_reason TEXT
);

CREATE INDEX idx_merchant_detections_merchant_id
    ON merchant_detections(merchant_id);

CREATE INDEX idx_merchant_detections_provider_name
    ON merchant_detections(provider_name);

CREATE INDEX idx_merchant_detections_detected_at
    ON merchant_detections(detected_at);

CREATE INDEX idx_merchant_detections_is_manual_override
    ON merchant_detections(is_manual_override);