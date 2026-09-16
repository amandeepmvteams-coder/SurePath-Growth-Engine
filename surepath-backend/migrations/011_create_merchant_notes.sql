CREATE TABLE merchant_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    merchant_id UUID NOT NULL
        REFERENCES merchants(id)
        ON DELETE CASCADE,

    author_id UUID
        REFERENCES users(id),

    body TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_merchant_notes_merchant_id
    ON merchant_notes(merchant_id);

CREATE INDEX idx_merchant_notes_author_id
    ON merchant_notes(author_id);

CREATE INDEX idx_merchant_notes_created_at
    ON merchant_notes(created_at);