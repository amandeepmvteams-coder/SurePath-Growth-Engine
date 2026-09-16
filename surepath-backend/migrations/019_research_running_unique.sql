CREATE UNIQUE INDEX idx_one_running_research_per_merchant
ON research_runs (merchant_id)
WHERE status = 'running';