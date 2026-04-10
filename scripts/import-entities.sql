-- =====================================================
-- AI Stack Entities Import SQL
-- Run in pgAdmin or Supabase SQL Editor
-- =====================================================
-- 34 entities - layer-specific details go in entity_layers table
-- =====================================================

-- First verify layer IDs:
-- SELECT id, slug, name FROM layers ORDER BY rank;

-- =====================================================
-- IMPORT ENTITIES (general info only)
-- =====================================================

-- FOUNDATION MODELS
INSERT INTO entities (id, name, slug, tagline, description, type, website_url, github_url, company_name, company_logo_char, license, is_featured, is_primitive, star_count, updated_at, verified_node)
VALUES 
(gen_random_uuid(), 'GPT-4o', 'gpt-4o', 'OpenAI flagship model', '"OpenAI''s most advanced flagship model with native multimodal capabilities"', 'model', 'https://openai.com/index/gpt-4o', 'https://github.com/openai/oai', 'OpenAI', 'O', 'proprietary', false, false, 0, NOW(), false),
(gen_random_uuid(), 'GPT-4 Turbo', 'gpt-4-turbo', 'Fast GPT-4', '"OpenAI''s fast and capable GPT-4 model"', 'model', 'https://openai.com/blog/new-gpts-4-turbo-and-11208', 'https://github.com/openai', 'OpenAI', 'O', 'proprietary', false, false, 0, NOW(), false),
(gen_random_uuid(), 'Claude 3.5 Sonnet', 'claude-3-5-sonnet', 'Anthropic best for coding', '"Anthropic''s best model for coding with improved reasoning"', 'model', 'https://www.anthropic.com/claude', 'https://github.com/anthropic', 'Anthropic', 'A', 'proprietary', false, false, 0, NOW(), false),
(gen_random_uuid(), 'Claude Code', 'claude-code', 'AI coding CLI', '"Anthropic''s CLI tool for autonomous coding"', 'tool', 'https://docs.anthropic.com/claude-code', 'https://github.com/anthropic/claude-code', 'Anthropic', 'A', 'open_source', false, false, 0, NOW(), false),
(gen_random_uuid(), 'Claude 3 Haiku', 'claude-3-haiku', 'Fast and efficient', '"Anthropic''s fast and efficient model"', 'model', 'https://www.anthropic.com/claude', 'https://github.com/anthropic', 'Anthropic', 'A', 'proprietary', false, false, 0, NOW(), false),
(gen_random_uuid(), 'Gemini 2.5 Pro', 'gemini-2-5-pro', 'Google top model', '"Google''s most capable model with reasoning"', 'model', 'https://gemini.google.com', 'https://github.com/google-deepmind', 'Google DeepMind', 'G', 'proprietary', false, false, 0, NOW(), false),
(gen_random_uuid(), 'Gemini 2.0 Flash', 'gemini-2-0-flash', 'Fast Google model', '"Google''s fast model for quick responses"', 'model', 'https://gemini.google.com', 'https://github.com/google-deepmind', 'Google DeepMind', 'G', 'proprietary', false, false, 0, NOW(), false),
(gen_random_uuid(), 'Llama 4 Scout', 'llama-4-scout', 'Meta open model', '"Meta''s open llama model with long context"', 'model', 'https://llama.meta.com', 'https://github.com/meta-llama', 'Meta', 'M', 'open_source', false, false, 0, NOW(), false),
(gen_random_uuid(), 'Llama 3.3 70B', 'llama-3-3-70b', 'Efficient open model', '"Meta''s efficient open model"', 'model', 'https://llama.meta.com', 'https://github.com/meta-llama', 'Meta', 'M', 'open_source', false, false, 0, NOW(), false),
(gen_random_uuid(), 'Mistral Large 2', 'mistral-large-2', 'Powerful coding model', '"Mistral''s powerful open model"', 'model', 'https://mistral.ai', 'https://github.com/mistral-ai', 'Mistral AI', 'M', 'proprietary', false, false, 0, NOW(), false),
(gen_random_uuid(), 'Codestral', 'codestral', 'Coding model', '"Mistral''s coding model"', 'model', 'https://mistral.ai', 'https://github.com/mistral-ai', 'Mistral AI', 'M', 'open_source', false, false, 0, NOW(), false)
ON CONFLICT (slug) DO UPDATE SET 
    tagline = EXCLUDED.tagline, description = EXCLUDED.description,
    website_url = EXCLUDED.website_url, company_name = EXCLUDED.company_name,
    updated_at = NOW();

-- INFERENCE & HOSTING
INSERT INTO entities (id, name, slug, tagline, description, type, website_url, github_url, company_name, company_logo_char, license, is_featured, is_primitive, star_count, updated_at, verified_node)
VALUES 
(gen_random_uuid(), 'Groq LPU', 'groq-lpu', 'Ultra-fast inference', '"Groq''s LPU for sub-millisecond latency"', 'tool', 'https://groq.com', 'https://github.com/groq', 'Groq', 'G', 'proprietary', false, false, 0, NOW(), false),
(gen_random_uuid(), 'Together Inference', 'together-inference', 'Fast model hosting', '"Fast inference on open models"', 'tool', 'https://together.ai', 'https://github.com/togethercomputer', 'Together AI', 'T', 'proprietary', false, false, 0, NOW(), false),
(gen_random_uuid(), 'Anyscale Endpoints', 'anyscale-endpoints', 'Managed serving', '"Serverless model endpoints"', 'tool', 'https://anyscale.com', 'https://github.com/anyscale', 'Anyscale', 'A', 'proprietary', false, false, 0, NOW(), false),
(gen_random_uuid(), 'Fireworks Inference', 'fireworks-inference', 'GenAI inference', '"Fast generative AI inference"', 'tool', 'https://fireworks.ai', 'https://github.com/fireworks-ai', 'Fireworks', 'F', 'proprietary', false, false, 0, NOW(), false),
(gen_random_uuid(), 'vLLM', 'vllm', 'Fast inference', '"High-throughput inference with PagedAttention"', 'framework', 'https://docs.vllm.ai', 'https://github.com/vllm-project', 'vLLM Project', 'v', 'open_source', false, true, 0, NOW(), true)
ON CONFLICT (slug) DO UPDATE SET 
    tagline = EXCLUDED.tagline, description = EXCLUDED.description,
    website_url = EXCLUDED.website_url, company_name = EXCLUDED.company_name,
    updated_at = NOW();

-- TRAINING & FINE-TUNING
INSERT INTO entities (id, name, slug, tagline, description, type, website_url, github_url, company_name, company_logo_char, license, is_featured, is_primitive, star_count, updated_at, verified_node)
VALUES 
(gen_random_uuid(), 'Unsloth', 'unsloth', 'Fast fine-tuning', '"2x faster fine-tuning, 70% less memory"', 'tool', 'https://unsloth.ai', 'https://github.com/unsloth-ai', 'Unsloth', 'U', 'open_source', false, false, 0, NOW(), false),
(gen_random_uuid(), 'Axolotl', 'axolotl', 'Unified fine-tuning', '"Fine-tune Llama, Mistral, Qwen"', 'framework', 'https://github.com/axolotl-ai', 'https://github.com/axolotl-ai', 'Axolotl', 'A', 'open_source', false, true, 0, NOW(), true),
(gen_random_uuid(), 'PEFT', 'peft', 'Parameter-efficient', '"LoRA, QLoRA, IA3 fine-tuning"', 'framework', 'https://huggingface.co/docs/peft', 'https://github.com/huggingface/peft', 'Hugging Face', 'H', 'open_source', false, true, 0, NOW(), true),
(gen_random_uuid(), 'TRL', 'trl', 'Transformer trainer', '"SFT, PPO, DPO training"', 'framework', 'https://huggingface.co/docs/trl', 'https://github.com/huggingface/trl', 'Hugging Face', 'H', 'open_source', false, true, 0, NOW(), true)
ON CONFLICT (slug) DO UPDATE SET 
    tagline = EXCLUDED.tagline, description = EXCLUDED.description,
    website_url = EXCLUDED.website_url, company_name = EXCLUDED.company_name,
    updated_at = NOW();

-- ORCHESTRATION
INSERT INTO entities (id, name, slug, tagline, description, type, website_url, github_url, company_name, company_logo_char, license, is_featured, is_primitive, star_count, updated_at, verified_node)
VALUES 
(gen_random_uuid(), 'LangChain', 'langchain', 'LLM app framework', '"Build apps with language models"', 'framework', 'https://www.langchain.com', 'https://github.com/langchain-ai', 'LangChain', 'L', 'open_source', false, false, 0, NOW(), false),
(gen_random_uuid(), 'LangGraph', 'langgraph', 'Multi-agent', '"Build coordinated multi-agent apps"', 'framework', 'https://www.langchain.com/langgraph', 'https://github.com/langchain-ai/langgraph', 'LangChain', 'L', 'open_source', false, false, 0, NOW(), false)
ON CONFLICT (slug) DO UPDATE SET 
    tagline = EXCLUDED.tagline, description = EXCLUDED.description,
    website_url = EXCLUDED.website_url, company_name = EXCLUDED.company_name,
    updated_at = NOW();

-- DATA & VECTOR
INSERT INTO entities (id, name, slug, tagline, description, type, website_url, github_url, company_name, company_logo_char, license, is_featured, is_primitive, star_count, updated_at, verified_node)
VALUES 
(gen_random_uuid(), 'LlamaIndex', 'llamaindex', 'Data framework', '"Build LLM apps with your data"', 'framework', 'https://www.llamaindex.com', 'https://github.com/run-llama', 'LlamaIndex', 'L', 'open_source', false, false, 0, NOW(), false),
(gen_random_uuid(), 'Pinecone Serverless', 'pinecone-serverless', 'Vector database', '"Zero-maintenance vector DB"', 'infrastructure', 'https://www.pinecone.io', 'https://github.com/pinecone-io', 'Pinecone', 'P', 'proprietary', false, false, 0, NOW(), false),
(gen_random_uuid(), 'Weaviate', 'weaviate', 'Open vector DB', '"Open-source vector database"', 'infrastructure', 'https://weaviate.io', 'https://github.com/weaviate-io', 'Weaviate', 'W', 'open_source', false, false, 0, NOW(), false),
(gen_random_uuid(), 'Qdrant', 'qdrant', 'Vector search', '"Fast vector search engine"', 'infrastructure', 'https://qdrant.tech', 'https://github.com/qdrant', 'Qdrant', 'Q', 'open_source', false, false, 0, NOW(), false),
(gen_random_uuid(), 'Chroma', 'chroma', 'Embedding DB', '"Open-source embedding database"', 'infrastructure', 'https://cookbook.chroma.dev', 'https://github.com/chroma-core/chroma', 'Chroma', 'C', 'open_source', false, false, 0, NOW(), false)
ON CONFLICT (slug) DO UPDATE SET 
    tagline = EXCLUDED.tagline, description = EXCLUDED.description,
    website_url = EXCLUDED.website_url, company_name = EXCLUDED.company_name,
    updated_at = NOW();

-- OBSERVABILITY & SAFETY
INSERT INTO entities (id, name, slug, tagline, description, type, website_url, github_url, company_name, company_logo_char, license, is_featured, is_primitive, star_count, updated_at, verified_node)
VALUES 
(gen_random_uuid(), 'LangSmith', 'langsmith', 'LLM observability', '"Debug, test, monitor LLM apps"', 'tool', 'https://www.langchain.com/langsmith', 'https://github.com/langchain-ai/langsmith', 'LangChain', 'L', 'proprietary', false, false, 0, NOW(), false),
(gen_random_uuid(), 'LangGuardrails', 'langguardrails', 'AI safety', '"Add guardrails to LLM apps"', 'tool', 'https://www.langchain.com/langguardrails', 'https://github.com/GuardrailsAI', 'Guardrails AI', 'G', 'open_source', false, false, 0, NOW(), false)
ON CONFLICT (slug) DO UPDATE SET 
    tagline = EXCLUDED.tagline, description = EXCLUDED.description,
    website_url = EXCLUDED.website_url, company_name = EXCLUDED.company_name,
    updated_at = NOW();

-- EXECUTION & SANDBOX
INSERT INTO entities (id, name, slug, tagline, description, type, website_url, github_url, company_name, company_logo_char, license, is_featured, is_primitive, star_count, updated_at, verified_node)
VALUES 
(gen_random_uuid(), 'E2B Code', 'e2b-code', 'AI code execution', '"Secure code execution for AI agents"', 'tool', 'https://e2b.dev', 'https://github.com/e2b-dev', 'E2B', 'E', 'proprietary', false, false, 0, NOW(), false),
(gen_random_uuid(), 'Daytona', 'daytona', 'Cloud dev envs', '"Cloud development environments"', 'tool', 'https://daytona.io', 'https://github.com/daytona-io', 'Daytona', 'D', 'proprietary', false, false, 0, NOW(), false)
ON CONFLICT (slug) DO UPDATE SET 
    tagline = EXCLUDED.tagline, description = EXCLUDED.description,
    website_url = EXCLUDED.website_url, company_name = EXCLUDED.company_name,
    updated_at = NOW();

-- COMPUTE & HARDWARE
INSERT INTO entities (id, name, slug, tagline, description, type, website_url, github_url, company_name, company_logo_char, license, is_featured, is_primitive, star_count, updated_at, verified_node)
VALUES 
(gen_random_uuid(), 'NVIDIA CUDA', 'nvidia-cuda', 'GPU computing', '"NVIDIA parallel computing platform"', 'infrastructure', 'https://www.nvidia.com', 'https://github.com/NVIDIA', 'NVIDIA', 'N', 'proprietary', false, false, 0, NOW(), false),
(gen_random_uuid(), 'NVIDIA DGX Cloud', 'nvidia-dgx', 'AI infrastructure', '"NVIDIA AI in the cloud"', 'infrastructure', 'https://www.nvidia.com', 'https://github.com/NVIDIA', 'NVIDIA', 'N', 'proprietary', false, false, 0, NOW(), false),
(gen_random_uuid(), 'RunPod', 'runpod', 'Cloud GPU', '"Managed GPU infrastructure"', 'tool', 'https://runpod.io', 'https://github.com/runpod', 'RunPod', 'R', 'proprietary', false, false, 0, NOW(), false),
(gen_random_uuid(), 'Modal', 'modal', 'Serverless GPUs', '"Serverless GPUs for AI apps"', 'tool', 'https://modal.com', 'https://github.com/modal-labs', 'Modal', 'M', 'proprietary', false, false, 0, NOW(), false)
ON CONFLICT (slug) DO UPDATE SET 
    tagline = EXCLUDED.tagline, description = EXCLUDED.description,
    website_url = EXCLUDED.website_url, company_name = EXCLUDED.company_name,
    updated_at = NOW();


-- =====================================================
-- LINK ENTITIES TO LAYERS (with layer-specific details)
-- =====================================================

-- Clear existing links (run if needed):
-- DELETE FROM entity_layers;

-- Foundation Models (layer 2)
INSERT INTO entity_layers (entity_id, layer_id, is_primary) 
SELECT id, 2, true FROM entities WHERE slug IN (
    'gpt-4o', 'gpt-4-turbo', 'claude-3-5-sonnet', 'claude-3-haiku',
    'gemini-2-5-pro', 'gemini-2-0-flash', 'llama-4-scout', 'llama-3-3-70b',
    'mistral-large-2', 'codestral'
) ON CONFLICT DO NOTHING;

-- Inference & Hosting (layer 3)
INSERT INTO entity_layers (entity_id, layer_id, is_primary) 
SELECT id, 3, true FROM entities WHERE slug IN (
    'gpt-4o', 'groq-lpu', 'together-inference', 'anyscale-endpoints', 
    'fireworks-inference', 'vllm'
) ON CONFLICT DO NOTHING;

-- Training & Fine-tuning (layer 4)
INSERT INTO entity_layers (entity_id, layer_id, is_primary) 
SELECT id, 4, true FROM entities WHERE slug IN (
    'claude-code', 'axolotl', 'peft', 'trl', 'modal'
) ON CONFLICT DO NOTHING;

-- Data & Vector (layer 5)
INSERT INTO entity_layers (entity_id, layer_id, is_primary) 
SELECT id, 5, true FROM entities WHERE slug IN (
    'llamaindex', 'pinecone-serverless', 'weaviate', 'qdrant', 'chroma'
) ON CONFLICT DO NOTHING;

-- Orchestration (layer 6)
INSERT INTO entity_layers (entity_id, layer_id, is_primary) 
SELECT id, 6, true FROM entities WHERE slug IN (
    'claude-3-5-sonnet', 'langchain', 'langgraph'
) ON CONFLICT DO NOTHING;

-- Execution & Sandbox (layer 7)
INSERT INTO entity_layers (entity_id, layer_id, is_primary) 
SELECT id, 7, true FROM entities WHERE slug IN (
    'claude-code', 'e2b-code', 'daytona', 'modal'
) ON CONFLICT DO NOTHING;

-- Observability & Safety (layer 8)
INSERT INTO entity_layers (entity_id, layer_id, is_primary) 
SELECT id, 8, true FROM entities WHERE slug IN (
    'langsmith', 'langguardrails'
) ON CONFLICT DO NOTHING;

-- Compute & Hardware (layer 1)
INSERT INTO entity_layers (entity_id, layer_id, is_primary) 
SELECT id, 1, true FROM entities WHERE slug IN (
    'nvidia-cuda', 'nvidia-dgx', 'runpod', 'modal'
) ON CONFLICT DO NOTHING;


-- =====================================================
-- OPTIONAL: Add layer-specific details (after import, manually)
-- =====================================================
-- Run scripts/update-entity-layers-schema.sql first to add columns
-- Then update individual entity_layers with rich data:
-- UPDATE entity_layers SET ... WHERE entity_id = ... AND layer_id = ...;


-- =====================================================
-- VERIFY
-- =====================================================
SELECT e.name, e.company_name, l.name as layer, el.is_primary
FROM entity_layers el
JOIN entities e ON e.id = el.entity_id
JOIN layers l ON l.id = el.layer_id
ORDER BY l.rank, e.name;