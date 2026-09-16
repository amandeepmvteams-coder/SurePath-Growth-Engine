CREATE TABLE merchant_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    merchant_id UUID NOT NULL
        REFERENCES merchants(id)
        ON DELETE CASCADE,

    assigned_to_id UUID
        REFERENCES users(id),

    title VARCHAR(255) NOT NULL,

    notes TEXT,

    due_at TIMESTAMPTZ,

    completed_at TIMESTAMPTZ,

    created_by UUID
        REFERENCES users(id),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_merchant_tasks_merchant_id
    ON merchant_tasks(merchant_id);

CREATE INDEX idx_merchant_tasks_assigned_to_id
    ON merchant_tasks(assigned_to_id);

CREATE INDEX idx_merchant_tasks_due_at
    ON merchant_tasks(due_at);

CREATE INDEX idx_merchant_tasks_completed_at
    ON merchant_tasks(completed_at);