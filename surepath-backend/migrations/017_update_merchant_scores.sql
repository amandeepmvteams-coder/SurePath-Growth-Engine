ALTER TABLE merchant_scores
ADD COLUMN score_factors_assessed INTEGER NOT NULL DEFAULT 0,
ADD COLUMN score_factors_total INTEGER NOT NULL DEFAULT 0,
ADD COLUMN opportunity_value NUMERIC(38, 10),
ADD COLUMN opportunity_inputs JSONB NOT NULL DEFAULT '{}'::jsonb;