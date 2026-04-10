-- =====================================================
-- UPDATE entity_layers TABLE SCHEMA
-- Run this in pgAdmin / Supabase SQL Editor
-- =====================================================

-- Add new columns to entity_layers
ALTER TABLE entity_layers 
ADD COLUMN IF NOT EXISTS layer_description TEXT,
ADD COLUMN IF NOT EXISTS services JSONB DEFAULT '[]'::JSONB,
ADD COLUMN IF NOT EXISTS capabilities JSONB DEFAULT '[]'::JSONB,
ADD COLUMN IF NOT EXISTS pricing_model TEXT,  -- free, freemium, paid, per-token
ADD COLUMN IF NOT EXISTS pricing_notes TEXT,
ADD COLUMN IF NOT EXISTS getting_started_url TEXT,
ADD COLUMN IF NOT EXISTS documentation_url TEXT,
ADD COLUMN IF NOT EXISTS blog_urls JSONB DEFAULT '[]'::JSONB,
ADD COLUMN IF NOT EXISTS learning_resources JSONB DEFAULT '[]'::JSONB,  -- [{title, url, type}]
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::JSONB,
ADD COLUMN IF NOT EXISTS use_cases JSONB DEFAULT '[]'::JSONB,
ADD COLUMN IF NOT EXISTS version TEXT,
ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verified_by TEXT,
ADD COLUMN IF NOT EXISTS is_deprecated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deprecation_notice TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::JSONB;

-- Create index for querying
CREATE INDEX IF NOT EXISTS idx_entity_layers_entity ON entity_layers(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_layers_layer ON entity_layers(layer_id);
CREATE INDEX IF NOT EXISTS idx_entity_layers_primary ON entity_layers(is_primary) WHERE is_primary = TRUE;

-- =====================================================
-- EXAMPLE: Populate some data
-- =====================================================

-- Example: Update specific entity-layer relationships
UPDATE entity_layers
SET 
    layer_description = 'High-throughput inference with PagedAttention for self-hosted models',
    services = '["self-hosted", "docker", "api"]'::JSONB,
    capabilities = '["streaming", "batch", "continuous-batching"]'::JSONB,
    pricing_model = 'free',
    pricing_notes = 'Open source, self-host on your GPU',
    getting_started_url = 'https://docs.vllm.ai/en/latest/getting_started/quickstart.html',
    documentation_url = 'https://docs.vllm.ai/',
    blog_urls = '["https://blog.vllm.ai/", "https://docs.vllm.ai/en/latest/community/meetups/"]'::JSONB,
    learning_resources = '[
        {"title": "vLLM Tutorial", "url": "https://www.youtube.com/watch?v=Xp3Z-1Iy4qM", "type": "video"},
        {"title": "vLLM GitHub", "url": "https://github.com/vllm-project/vllm", "type": "repo"}
    ]'::JSONB,
    tags = '["inference", "open-source", "gpu", "production"]'::JSONB,
    use_cases = '["production-serving", "batch-inference", "high-throughput"]'::JSONB,
    version = '0.6.0',
    last_verified_at = NOW()
WHERE entity_id IN (SELECT id FROM entities WHERE slug = 'vllm')
AND layer_id = 3;  -- inference-and-hosting

-- Example: LangChain with many resources
UPDATE entity_layers
SET 
    layer_description = 'Build LLM applications with chains, agents, and memory abstractions',
    services = '["library", "api", "managed"]'::JSONB,
    capabilities = '["agents", "memory", "tools", "callbacks"]'::JSONB,
    pricing_model = 'free',
    getting_started_url = 'https://python.langchain.com/docs/tutorials/',
    documentation_url = 'https://python.langchain.com/docs/',
    blog_urls = '["https://blog.langchain.dev/", "https://python.langchain.com/blog"]'::JSONB,
    learning_resources = '[
        {"title": "LangChain Academy", "url": "https://academy.langchain.com/", "type": "course"},
        {"title": "YouTube Tutorials", "url": "https://www.youtube.com/@LangChain", "type": "video"}
    ]'::JSONB,
    tags = '["framework", "agents", "rag", "beginner-friendly"]'::JSONB,
    use_cases = '["rag", "chatbots", "agents", "automation"]'::JSONB,
    version = '0.3',
    last_verified_at = NOW()
WHERE entity_id IN (SELECT id FROM entities WHERE slug = 'langchain')
AND layer_id = 6;  -- orchestration

-- =====================================================
-- VERIFY
-- =====================================================
SELECT 
    e.name,
    l.name as layer,
    el.layer_description,
    el.services,
    el.capabilities,
    el.pricing_model,
    el.tags,
    el.use_cases
FROM entity_layers el
JOIN entities e ON e.id = el.entity_id
JOIN layers l ON l.id = el.layer_id
WHERE el.layer_description IS NOT NULL
ORDER BY l.rank, e.name;