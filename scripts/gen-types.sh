#!/bin/bash
# Generate Supabase TypeScript types
# Usage: ./scripts/gen-types.sh

set -e

PROJECT_ID="aoqtkynfjnmvhxnkkeug"

echo "Generating TypeScript types from Supabase..."

supabase gen types typescript --project-id "$PROJECT_ID" --schema public > types/database.types.ts

echo "✓ Types generated at types/database.types.ts"