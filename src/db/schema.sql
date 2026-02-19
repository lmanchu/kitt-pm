CREATE TABLE workspaces (
  team_id TEXT PRIMARY KEY,
  team_name TEXT,
  bot_token TEXT NOT NULL,
  bot_user_id TEXT,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE kb_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id TEXT REFERENCES workspaces(team_id),
  type TEXT NOT NULL, -- 'files', 'notion', 'gdrive'
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);