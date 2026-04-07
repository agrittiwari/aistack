-- Core schema for AiStack 2026 AI Directory

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Layers table (the 8 stack layers)
CREATE TABLE layers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  long_description TEXT,
  icon TEXT,
  color_from TEXT,
  color_to TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tools table (AI tools in directory)
CREATE TABLE tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  layer_id UUID REFERENCES layers(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active',
  critical_text TEXT,
  website_url TEXT,
  year INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tool tags for categorization
CREATE TABLE tool_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for SEO & performance
CREATE INDEX idx_tools_layer ON tools(layer_id);
CREATE INDEX idx_tools_slug ON tools(slug);
CREATE INDEX idx_layers_slug ON layers(slug);
CREATE INDEX idx_tool_tags_tag ON tool_tags(tag);
CREATE INDEX idx_tools_seo ON tools(name, description);

-- Enable RLS
ALTER TABLE layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_tags ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read layers" ON layers FOR SELECT USING (true);
CREATE POLICY "Public read tools" ON tools FOR SELECT USING (true);
CREATE POLICY "Public read tool_tags" ON tool_tags FOR SELECT USING (true);