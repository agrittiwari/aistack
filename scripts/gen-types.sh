#!/bin/bash
# Generate Supabase TypeScript types
# Usage: ./scripts/gen-types.sh

set -euo pipefail

PROJECT_ID="aoqtkynfjnmvhxnkkeug"

echo "Generating TypeScript types from Supabase..."

tmpfile="$(mktemp)"
if ! supabase gen types --project-id "$PROJECT_ID" --lang typescript -s public > "$tmpfile"; then
  echo "✗ Failed to generate types. Run 'supabase login' or set SUPABASE_ACCESS_TOKEN." >&2
  rm -f "$tmpfile"
  exit 1
fi

mv "$tmpfile" types/supabase.ts

echo "✓ Types generated at types/supabase.ts"
