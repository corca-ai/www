-- The newsletter is intentionally separate from the static blog content.
-- Apply this migration to the production D1 database before adding the Worker binding.

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL CHECK (state IN ('pending', 'active', 'unsubscribed')),
  consented_at TEXT NOT NULL,
  confirmation_token_hash TEXT,
  confirmation_sent_at TEXT,
  confirmed_at TEXT,
  unsubscribed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS newsletter_subscribers_state_idx
  ON newsletter_subscribers(state);

CREATE TABLE IF NOT EXISTS newsletter_editions (
  id TEXT PRIMARY KEY,
  rss_guid TEXT NOT NULL UNIQUE,
  post_url TEXT NOT NULL,
  post_title TEXT NOT NULL,
  published_at TEXT,
  state TEXT NOT NULL CHECK (state IN ('baseline', 'queued')),
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS newsletter_editions_state_idx
  ON newsletter_editions(state, created_at);

CREATE TABLE IF NOT EXISTS newsletter_deliveries (
  id TEXT PRIMARY KEY,
  edition_id TEXT NOT NULL REFERENCES newsletter_editions(id),
  subscriber_id TEXT NOT NULL REFERENCES newsletter_subscribers(id),
  unsubscribe_token_hash TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sending', 'sent', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  claimed_at TEXT,
  provider_message_id TEXT,
  last_error TEXT,
  sent_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (edition_id, subscriber_id)
);

CREATE INDEX IF NOT EXISTS newsletter_deliveries_pending_idx
  ON newsletter_deliveries(status, created_at);

CREATE TABLE IF NOT EXISTS newsletter_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
