-- Retain failed delivery history while allowing bounded retries by the next
-- daily Worker run. A NULL next_attempt_at means the retry budget is exhausted.

ALTER TABLE newsletter_deliveries ADD COLUMN next_attempt_at TEXT;

CREATE INDEX IF NOT EXISTS newsletter_deliveries_retry_idx
  ON newsletter_deliveries(status, next_attempt_at, created_at);
