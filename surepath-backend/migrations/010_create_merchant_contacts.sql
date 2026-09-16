CREATE TABLE merchant_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    merchant_id UUID NOT NULL
        REFERENCES merchants(id)
        ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    role VARCHAR(100),

    email VARCHAR(255),
    phone VARCHAR(50),

    is_primary BOOLEAN NOT NULL DEFAULT FALSE,

    owner_id UUID
        REFERENCES users(id),

    source VARCHAR(100),

    confidence NUMERIC(10, 8),

    verified_at TIMESTAMPTZ,

    is_manual_override BOOLEAN NOT NULL DEFAULT FALSE,

    created_by UUID
        REFERENCES users(id),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT contact_email_or_phone
        CHECK (
            email IS NOT NULL
            OR phone IS NOT NULL
        )
);

CREATE INDEX idx_merchant_contacts_merchant_id
    ON merchant_contacts(merchant_id);

CREATE INDEX idx_merchant_contacts_owner_id
    ON merchant_contacts(owner_id);

CREATE INDEX idx_merchant_contacts_email
    ON merchant_contacts(email);