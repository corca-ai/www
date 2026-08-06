-- Explicit release switch for the public Korean blog newsletter forms.
-- Apply this migration only with the newsletter release deployment.

INSERT INTO newsletter_settings (key, value, updated_at)
VALUES ('public_enabled', 'true', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
ON CONFLICT(key) DO UPDATE SET
  value = excluded.value,
  updated_at = excluded.updated_at;
