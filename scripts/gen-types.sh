#!/bin/bash
# Generate Supabase TypeScript types
# Usage: ./scripts/gen-types.sh

set -e

PROJECT_ID="aoqtkynfjnmvhxnkkeug"

echo "Generating TypeScript types from Supabase..."

supabase gen types --project-id "$PROJECT_ID" --lang typescript -s public > types/supabase.ts

echo "✓ Types generated at types/supabase.ts"