CREATE TABLE IF NOT EXISTS subscribers (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  email               TEXT NOT NULL UNIQUE COLLATE NOCASE,
  source              TEXT DEFAULT 'website',
  ip_address          TEXT,
  user_agent          TEXT,
  country             TEXT,
  created_at          TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  confirmed_at        TEXT,
  launch_notified_at  TEXT,
  converted_at        TEXT,
  unsubscribed_at     TEXT
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email      ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_created_at ON subscribers(created_at);
