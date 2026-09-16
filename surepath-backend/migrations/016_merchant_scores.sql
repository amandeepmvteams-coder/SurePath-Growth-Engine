CREATE TABLE merchant_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    merchant_id UUID NOT NULL
        REFERENCES merchants(id)
        ON DELETE CASCADE,

    scoring_config_id UUID NOT NULL
        REFERENCES scoring_configs(id),

    score NUMERIC(38, 10) NOT NULL,

    score_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,

    scored_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_merchant_scores_merchant_id
    ON merchant_scores(merchant_id);

CREATE INDEX idx_merchant_scores_scoring_config_id
    ON merchant_scores(scoring_config_id);

CREATE INDEX idx_merchant_scores_scored_at
    ON merchant_scores(scored_at);