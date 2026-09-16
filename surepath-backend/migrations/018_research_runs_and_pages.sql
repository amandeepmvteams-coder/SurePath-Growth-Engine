CREATE TABLE research_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    merchant_id UUID NOT NULL
        REFERENCES merchants(id)
        ON DELETE CASCADE,

    status VARCHAR(30) NOT NULL DEFAULT 'running',

    error TEXT,

    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    finished_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT research_runs_status_check
        CHECK (status IN ('running', 'completed', 'failed'))
);

CREATE INDEX idx_research_runs_merchant_id
    ON research_runs(merchant_id);

CREATE INDEX idx_research_runs_created_at
    ON research_runs(created_at DESC);

CREATE INDEX idx_research_runs_status
    ON research_runs(status);


CREATE TABLE research_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    research_run_id UUID NOT NULL
        REFERENCES research_runs(id)
        ON DELETE CASCADE,

    merchant_id UUID NOT NULL
        REFERENCES merchants(id)
        ON DELETE CASCADE,

    url TEXT NOT NULL,

    page_type VARCHAR(50),

    status VARCHAR(30) NOT NULL DEFAULT 'found',

    status_code INTEGER,

    content_type VARCHAR(255),

    title TEXT,

    content TEXT,

    fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    error TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT research_pages_status_check
        CHECK (status IN ('found', 'missing', 'failed'))
);

CREATE INDEX idx_research_pages_run_id
    ON research_pages(research_run_id);

CREATE INDEX idx_research_pages_merchant_id
    ON research_pages(merchant_id);

CREATE INDEX idx_research_pages_url
    ON research_pages(url);