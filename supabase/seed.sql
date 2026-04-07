-- Additional entities per layer for AiStack 2026

-- COMPUTE LAYER (Layer 1)
INSERT INTO tools (name, slug, description, layer_id, status, critical_text, website_url, year) 
SELECT * FROM (VALUES
  ('AWS Trainium', 'aws-trainium', 'Purpose-built ML training chips by AWS', (SELECT id FROM layers WHERE slug = 'compute'), 'active', 'Direct competition to NVIDIA for training workloads', 'https://aws.amazon.com/trainium/', 2024),
  ('AWS Inferentia', 'aws-inferentia', 'Purpose-built ML inference chips by AWS', (SELECT id FROM layers WHERE slug = 'compute'), 'active', 'Cost-effective inference at scale', 'https://aws.amazon.com/inferentia/', 2024),
  ('Google TPU v6', 'google-tpu-v6', 'Sixth generation Tensor Processing Units', (SELECT id FROM layers WHERE slug = 'compute'), 'active', 'Google''s secret weapon for frontier research', 'https://cloud.google.com/tpu', 2025),
  ('Tencent Cloud GPU', 'tencent-cloud-gpu', 'GPU instances for AI workloads in China', (SELECT id FROM layers WHERE slug = 'compute'), 'active', 'Primary GPU provider for Chinese market', 'https://cloud.tencent.com', 2024),
  ('Lambda Labs', 'lambda-labs', 'GPU cloud for deep learning training', (SELECT id FROM layers WHERE slug = 'compute'), 'active', 'Startup-friendly alternative to AWS', 'https://lambdalabs.com', 2024),
  ('Paperspace', 'paperspace', 'Cloud GPU platform for AI developers', (SELECT id FROM layers WHERE slug = 'compute'), 'active', 'Strong gradient notebooks offering', 'https://paperspace.com', 2024),
  ('RunPod', 'runpod', 'Serverless GPU infrastructure', (SELECT id FROM layers WHERE slug = 'compute'), 'active', 'Pay-per-second GPU scaling', 'https://runpod.io', 2025),
  ('Massed Compute', 'massed-compute', 'Distributed training compute', (SELECT id FROM layers WHERE slug = 'compute'), 'active', 'Focus on LLM pre-training clusters', 'https://massedcompute.com', 2025)
) AS t(name, slug, description, layer_id, status, critical_text, website_url, year)
ON CONFLICT (slug) DO NOTHING;

-- MODELS LAYER (Layer 2)
INSERT INTO tools (name, slug, description, layer_id, status, critical_text, website_url, year) 
SELECT * FROM (VALUES
  ('OpenAI GPT-5', 'openai-gpt-5', 'Fifth generation GPT with enhanced reasoning', (SELECT id FROM layers WHERE slug = 'model'), 'active', 'Current frontier model benchmark', 'https://openai.com', 2026),
  ('Google Gemini 2.5', 'google-gemini-2-5', 'Native multimodal reasoning model', (SELECT id FROM layers WHERE slug = 'model'), 'active', 'Strongest open-domain reasoning', 'https://deepmind.google', 2025),
  ('xAI Grok 3', 'xai-grok-3', 'Real-time knowledge access model', (SELECT id FROM layers WHERE slug = 'model'), 'active', 'Grok ecosystem integration', 'https://x.ai', 2025),
  ('Meta Llama 4', 'meta-llama-4', 'Open weights flagship model', (SELECT id FROM layers WHERE slug = 'model'), 'active', 'Most downloaded open model', 'https://llama.com', 2025),
  ('Mistral NeMo', 'mistral-nemo', 'Compact but powerful model', (SELECT id FROM layers WHERE slug = 'model'), 'active', 'European-made small model', 'https://mistral.ai', 2025),
  ('Qwen 3', 'qwen-3', 'Alibaba''s flagship model series', (SELECT id FROM layers WHERE slug = 'model'), 'active', 'Top Chinese open weights model', 'https://qwen.ai', 2025),
  ('DeepSeek V3', 'deepseek-v3', 'Mixture of experts architecture', (SELECT id FROM layers WHERE slug = 'model'), 'active', 'Most efficient frontier model', 'https://deepseek.com', 2025),
  ('Cohere Command R', 'cohere-command-r', 'Enterprise-focused reasoning model', (SELECT id FROM layers WHERE slug = 'model'), 'active', 'Best for business use cases', 'https://cohere.com', 2025),
  ('Anthropic Claude Sonnet 4', 'anthropic-claude-sonnet-4', 'Balanced capability model', (SELECT id FROM layers WHERE slug = 'model'), 'active', 'Best price-performance trade-off', 'https://anthropic.com', 2026),
  ('Google Gemma 3', 'google-gemma-3', 'Open weights instruction-tuned model', (SELECT id FROM layers WHERE slug = 'model'), 'active', 'Small but capable open model', 'https://huggingface.co/google/gemma', 2025),
  ('Stability AI Stable Diffusion 4', 'stability-sd4', 'Image generation model', (SELECT id FROM layers WHERE slug = 'model'), 'active', 'Leading open image gen', 'https://stability.ai', 2025),
  ('Runway Gen 4', 'runway-gen-4', 'Video generation model', (SELECT id FROM layers WHERE slug = 'model'), 'active', 'Professional video synthesis', 'https://runwayml.com', 2025)
) AS t(name, slug, description, layer_id, status, critical_text, website_url, year)
ON CONFLICT (slug) DO NOTHING;

-- INFERENCE LAYER (Layer 3)
INSERT INTO tools (name, slug, description, layer_id, status, critical_text, website_url, year) 
SELECT * FROM (VALUES
  ('Fireworks AI', 'fireworks-ai', 'Fast inference API platform', (SELECT id FROM layers WHERE slug = 'inference'), 'active', 'Sub-100ms latency for production', 'https://fireworks.ai', 2025),
  ('Together AI', 'together-ai', 'Open models inference platform', (SELECT id FROM layers WHERE slug = 'inference'), 'active', '150+ open models via API', 'https://together.ai', 2024),
  ('Anyscale', 'anycale', 'Ray-based inference infrastructure', (SELECT id FROM layers WHERE slug = 'inference'), 'active', 'OpenAI-compatible endpoints', 'https://anyscale.com', 2024),
  ('Baseten', 'baseten', 'ML inference platform', (SELECT id FROM layers WHERE slug = 'inference'), 'active', 'Truss-based model serving', 'https://baseten.co', 2024),
  ('Lepton AI', 'lepton-ai', 'Turnkey inference deployment', (SELECT id FROM layers WHERE slug = 'inference'), 'active', 'One-command model deployment', 'https://lepton.ai', 2025),
  ('Replicate', 'replicate', 'Open source model inference', (SELECT id FROM layers WHERE slug = 'inference'), 'active', 'Community model hub', 'https://replicate.com', 2024),
  ('Modal', 'modal', 'Serverless compute for AI', (SELECT id FROM layers WHERE slug = 'inference'), 'active', 'GPU serverless at scale', 'https://modal.com', 2024),
  ('SambaNova', 'samba-nova', 'AI inference chips and cloud', (SELECT id FROM layers WHERE slug = 'inference'), 'active', 'Dataflow architecture for LLMs', 'https://sambanova.ai', 2024),
  ('Mythic AI', 'mythic-ai', 'Analog AI inference chips', (SELECT id FROM layers WHERE slug = 'inference'), 'active', 'Ultra-low power inference', 'https://mythic-ai.com', 2025)
) AS t(name, slug, description, layer_id, status, critical_text, website_url, year)
ON CONFLICT (slug) DO NOTHING;

-- TRAINING LAYER (Layer 4)
INSERT INTO tools (name, slug, description, layer_id, status, critical_text, website_url, year) 
SELECT * FROM (VALUES
  ('Axolotl', 'axolotl', 'Open source fine-tuning framework', (SELECT id FROM layers WHERE slug = 'training'), 'active', 'Most popular LoRA fine-tuning tool', 'https://github.com/axolotl-ai/axolotl', 2024),
  ('PyTorch FSDP', 'pytorch-fsdp', 'Fully sharded data parallel', (SELECT id FROM layers WHERE slug = 'training'), 'active', 'Meta''s distributed training', 'https://pytorch.org', 2024),
  ('DeepSpeed', 'deepspeed', 'Microsoft''s optimization library', (SELECT id FROM layers WHERE slug = 'training'), 'active', 'ZeRO + RLHF training', 'https://github.com/microsoft/DeepSpeed', 2024),
  ('vLLM', 'vllm', 'Fast LLM inference and serving', (SELECT id FROM layers WHERE slug = 'training'), 'active', 'PagedAttention for efficiency', 'https://vllm.ai', 2024),
  ('TRL (Transformer Reinforcement Learning)', 'trl', 'SFT and RLHF training', (SELECT id FROM layers WHERE slug = 'training'), 'active', 'Full DPO/PPO pipeline', 'https://huggingface.co/docs/trl', 2024),
  ('OpenRLHF', 'openrlhf', 'Open source RLHF platform', (SELECT id FROM layers WHERE slug = 'training'), 'active', 'Ray-based RLHF training', 'https://github.com/openrlbenchmark/openrlhf', 2024),
  ('LoRAX', 'lorax', 'Multi-tenant LoRA serving', (SELECT id FROM layers WHERE slug = 'training'), 'active', '100+ LoRAs in one GPU', 'https://lorax.io', 2025),
  ('PEFT (Parameter-Efficient Fine-Tuning)', 'peft', 'Hugging Face fine-tuning lib', (SELECT id FROM layers WHERE slug = 'training'), 'active', 'LoRA + prefix tuning', 'https://huggingface.co/docs/peft', 2024),
  ('Xwin-LM', 'xwin-lm', 'Alignment training suite', (SELECT id FROM layers WHERE slug = 'training'), 'active', 'DPO + C-RM training', 'https://github.com/Xwin-LM/Xwin-LM', 2024)
) AS t(name, slug, description, layer_id, status, critical_text, website_url, year)
ON CONFLICT (slug) DO NOTHING;

-- DATA LAYER (Layer 5)
INSERT INTO tools (name, slug, description, layer_id, status, critical_text, website_url, year) 
SELECT * FROM (VALUES
  ('Weaviate', 'weaviate', 'Open source vector database', (SELECT id FROM layers WHERE slug = 'data'), 'active', 'Hybrid search + reranking', 'https://weaviate.io', 2024),
  ('Qdrant', 'qdrant', 'Vector similarity search engine', (SELECT id FROM layers WHERE slug = 'data'), 'active', 'Rust-based high performance', 'https://qdrant.tech', 2024),
  ('Chroma', 'chroma', 'AI-native embedding database', (SELECT id FROM layers WHERE slug = 'data'), 'active', 'Simplest vector DB for startups', 'https://trychroma.com', 2024),
  ('Milvus', 'milvus', 'Open source vector database', (SELECT id FROM layers WHERE slug = 'data'), 'active', 'Most mature open option', 'https://milvus.io', 2024),
  ('pgvector', 'pgvector', 'Vector extension for Postgres', (SELECT id FROM layers WHERE slug = 'data'), 'active', 'Simplest vector search', 'https://github.com/pgvector/pgvector', 2024),
  ('MongoDB Atlas Vector Search', 'mongodb-vector-search', 'Vector search in MongoDB', (SELECT id FROM layers WHERE slug = 'data'), 'active', 'Existing DB with vectors', 'https://mongodb.com', 2024),
  ('Elasticsearch Vector Search', 'elasticsearch-vector-search', 'Vector search in ES', (SELECT id FROM layers WHERE slug = 'data'), 'active', 'Full-text + vector hybrid', 'https://elastic.co', 2024),
  ('Neo4j Vector Search', 'neo4j-vector-search', 'Knowledge graph + vectors', (SELECT id FROM layers WHERE slug = 'data'), 'active', 'Graph-RAG native', 'https://neo4j.com', 2025),
  ('LlamaIndex', 'llamaindex', 'Data framework for LLMs', (SELECT id FROM layers WHERE slug = 'data'), 'active', 'Best for RAG pipelines', 'https://llamaindex.ai', 2024),
  ('LangChain', 'langchain', 'LLM application framework', (SELECT id FROM layers WHERE slug = 'data'), 'active', 'Chains + agents ecosystem', 'https://langchain.com', 2024),
  ('DataJinx', 'datajinx', 'Synthetic data generation', (SELECT id FROM layers WHERE slug = 'data'), 'active', 'Privacy-preserving training data', 'https://datajinx.ai', 2025)
) AS t(name, slug, description, layer_id, status, critical_text, website_url, year)
ON CONFLICT (slug) DO NOTHING;

-- ORCHESTRATION LAYER (Layer 6)
INSERT INTO tools (name, slug, description, layer_id, status, critical_text, website_url, year) 
SELECT * FROM (VALUES
  ('AutoGen', 'autogen', 'Microsoft''s multi-agent framework', (SELECT id FROM layers WHERE slug = 'orchestration'), 'active', 'Conversational agents', 'https://microsoft.github.io/autogen', 2024),
  ('CrewAI', 'crewai', 'Multi-agent orchestration', (SELECT id FROM layers WHERE slug = 'orchestration'), 'active', 'Role-based agent teams', 'https://crewai.com', 2024),
  ('LangGraph', 'langgraph', 'Graph-based agent workflows', (SELECT id FROM layers WHERE slug = 'orchestration'), 'active', 'Cyclic state machines', 'https://langchain.ai/langgraph', 2024),
  ('OpenAI Swarm', 'openai-swarm', 'Lightweight agent orchestration', (SELECT id FROM layers WHERE slug = 'orchestration'), 'active', 'Simple agent handoffs', 'https://github.com/openai/swarm', 2024),
  ('TaskMatrix', 'taskmatrix', 'Task automation platform', (SELECT id FROM layers WHERE slug = 'orchestration'), 'active', 'Visual workflow builder', 'https://taskmatrix.ai', 2024),
  ('n8n', 'n8n', 'Workflow automation engine', (SELECT id FROM layers WHERE slug = 'orchestration'), 'active', 'Self-hosted automation', 'https://n8n.io', 2024),
  ('Temporal', 'temporal', 'Workflow orchestration', (SELECT id FROM layers WHERE slug = 'orchestration'), 'active', 'Durable executions', 'https://temporal.io', 2024),
  ('Inngest', 'inngest', 'Event-driven workflows', (SELECT id FROM layers WHERE slug = 'orchestration'), 'active', 'Serverless workflow events', 'https://inngest.com', 2024),
  ('Composio', 'composio', 'Tool-use agent platform', (SELECT id FROM layers WHERE slug = 'orchestration'), 'active', '80+ app integrations', 'https://composio.dev', 2025),
  ('MCP (Model Context Protocol)', 'mcp', 'Standard agent-tool protocol', (SELECT id FROM layers WHERE slug = 'orchestration'), 'active', 'OpenAI''s tool standard', 'https://modelcontextprotocol.io', 2025)
) AS t(name, slug, description, layer_id, status, critical_text, website_url, year)
ON CONFLICT (slug) DO NOTHING;

-- EXECUTION LAYER (Layer 7)
INSERT INTO tools (name, slug, description, layer_id, status, critical_text, website_url, year) 
SELECT * FROM (VALUES
  ('CodeSandbox', 'codesandbox', 'Cloud dev environments', (SELECT id FROM layers WHERE slug = 'execution'), 'active', 'Instant dev environments', 'https://codesandbox.io', 2024),
  ('GitHub Codespaces', 'github-codespaces', 'Browser-based IDE', (SELECT id FROM layers WHERE slug = 'execution'), 'active', 'VS Code in browser', 'https://github.com/features/codespaces', 2024),
  ('Cursor', 'cursor', 'AI-first code editor', (SELECT id FROM layers WHERE slug = 'execution'), 'active', 'Best AI coding experience', 'https://cursor.sh', 2024),
  ('Windsurf', 'windsurf', 'AI coding assistant', (SELECT id FROM layers WHERE slug = 'execution'), 'active', 'Flow-based AI agent', 'https://codeium.com/windsurf', 2025),
  ('Devin', 'devin', 'Autonomous coding agent', (SELECT id FROM layers WHERE slug = 'execution'), 'active', 'Full-stack AI engineer', 'https://devin.ai', 2025),
  ('Amazon Q Developer', 'amazon-q-developer', 'Enterprise AI coding', (SELECT id FROM layers WHERE slug = 'execution'), 'active', 'AWS-native code assistant', 'https://aws.amazon.com/q', 2024),
  ('Bolt.new', 'bolt-new', 'AI full-stack builder', (SELECT id FROM layers WHERE slug = 'execution'), 'active', 'Browser-to-prod in minutes', 'https://bolt.new', 2025),
  ('Replit Agent', 'replit-agent', 'Autonomous coding platform', (SELECT id FROM layers WHERE slug = 'execution'), 'active', 'From idea to deployed app', 'https://replit.com', 2025),
  ('Jina AI', 'jina-ai', 'Reader and search APIs', (SELECT id FROM layers WHERE slug = 'execution'), 'active', 'Web content extraction', 'https://jina.ai', 2024),
  ('Browseless', 'browseless', 'Headless browser for agents', (SELECT id FROM layers WHERE slug = 'execution'), 'active', 'Automated web interaction', 'https://browseless.com', 2025)
) AS t(name, slug, description, layer_id, status, critical_text, website_url, year)
ON CONFLICT (slug) DO NOTHING;

-- OBSERVABILITY LAYER (Layer 8)
INSERT INTO tools (name, slug, description, layer_id, status, critical_text, website_url, year) 
SELECT * FROM (VALUES
  ('LangSmith', 'langsmith', 'LLM debugging and observability', (SELECT id FROM layers WHERE slug = 'observability'), 'active', 'Full trace visibility', 'https://smith.langchain.com', 2024),
  ('Arize AI', 'arize-ai', 'ML observability platform', (SELECT id FROM layers WHERE slug = 'observability'), 'active', 'Production ML monitoring', 'https://arize.com', 2024),
  ('Weights & Biases', 'weights-and-biases', 'ML experiment tracking', (SELECT id FROM layers WHERE slug = 'observability'), 'active', 'Training visibility', 'https://wandb.ai', 2024),
  ('MLflow', 'mlflow', 'ML lifecycle platform', (SELECT id FROM layers WHERE slug = 'observability'), 'active', 'Open source MLOps', 'https://mlflow.org', 2024),
  ('arize-phoenix', 'arize-phoenix', 'ML observability open source', (SELECT id FROM layers WHERE slug = 'observability'), 'active', 'Self-hosted tracing', 'https://phoenix.arize.com', 2024),
  ('Opik', 'opik', 'Open source LLM tracing', (SELECT id FROM layers WHERE slug = 'observability'), 'active', 'LangChain compatible', 'https://www.comet.com/opik', 2025),
  ('Humanloop', 'humanloop', 'Feedback collection for LLMs', (SELECT id FROM layers WHERE slug = 'observability'), 'active', 'Human-in-the-loop data', 'https://humanloop.com', 2024),
  ('Scale AI', 'scale-ai', 'Data labeling and evaluation', (SELECT id FROM layers WHERE slug = 'observability'), 'active', 'RLHF training data', 'https://scale.com', 2024),
  ('OpenAI Evals', 'openai-evals', 'Model evaluation framework', (SELECT id FROM layers WHERE slug = 'observability'), 'active', 'Open source evals', 'https://github.com/openai/evals', 2024),
  ('DeepEval', 'deep-eval', 'LLM evaluation framework', (SELECT id FROM layers WHERE slug = 'observability'), 'active', 'Open source benchmarking', 'https://github.com/confident-ai/deepeval', 2024),
  ('Guardrails AI', 'guardrails-ai', 'Output validation and safety', (SELECT id FROM layers WHERE slug = 'observability'), 'active', 'Structured output enforcement', 'https://www.guardrailsai.com', 2024),
  ('NeMo Guardrails', 'nemo-guardrails', 'NVIDIA''s safety framework', (SELECT id FROM layers WHERE slug = 'observability'), 'active', 'Enterprise-grade safety', 'https://github.com/NVIDIA/NeMo-Guardrails', 2024),
  ('Rebuff', 'rebuff', 'Prompt injection detection', (SELECT id FROM layers WHERE slug = 'observability'), 'active', 'Security hardening', 'https://rebuff.dev', 2024),
  ('Promptfoo', 'promptfoo', 'Prompt testing framework', (SELECT id FROM layers WHERE slug = 'observability'), 'active', 'Prompt reliability', 'https://promptfoo.dev', 2024)
) AS t(name, slug, description, layer_id, status, critical_text, website_url, year)
ON CONFLICT (slug) DO NOTHING;

-- Verify counts
SELECT l.slug, l.name, COUNT(t.id) as tool_count 
FROM layers l 
LEFT JOIN tools t ON t.layer_id = l.id AND t.status = 'active' 
GROUP BY l.id, l.slug, l.name 
ORDER BY l.id;