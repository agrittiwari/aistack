#!/bin/bash
# Import entities from CSV to database
# Usage: ./scripts/import-entities.sh <csv_file>
#
# CSV columns (all required unless marked optional):
# name, slug, tagline, description, type, website_url, github_url, logo_url, company_name, 
# company_logo_char, license, is_featured, is_primitive, star_count, layer_slug
#
# Valid types: tool, model, platform, framework, infrastructure, startup
# Valid licenses: open_source, proprietary, source_available

set -euo pipefail

CSV_FILE="${1:-scripts/entities.csv}"
TABLE="entities"

if [ ! -f "$CSV_FILE" ]; then
    echo "Error: CSV file '$CSV_FILE' not found"
    echo "Usage: $0 <csv_file>"
    exit 1
fi

source .env.local 2>/dev/null || true

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo "Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env.local"
    exit 1
fi

echo "Reading layer mappings..."
LAYERS_JSON=$(curl -s -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
    -H "apikey: $SUPABASE_URL" \
    "$SUPABASE_URL/rest/v1/layers?select=id,slug&apikey=$SUPABASE_URL")

declare -A LAYER_IDS
for row in $(echo "$LAYERS_JSON" | jq -r '.[] | "\(.id)|\(.slug)"'); do
    id="${row%|*}"
    slug="${row#*|}"
    LAYER_IDS["$slug"]="$id"
done

echo "Found layers: ${!LAYER_IDS[@]}"
echo ""

# UUID function
UUID_QUERY="gen_random_uuid()"

# Process CSV
row_num=0
imported=0
failed=0
skipped=0

while IFS=, read -r name slug tagline description type website_url github_url logo_url company_name company_logo_char license is_featured is_primitive star_count layer_slug; do
    row_num=$((row_num + 1))
    
    # Skip header
    if [ "$row_num" -eq 1 ]; then
        if [ "$name" = "name" ]; then
            echo "Skipping header row"
            continue
        fi
    fi
    
    # Skip empty lines
    [ -z "$name" ] && continue
    
    # Generate slug if empty
    if [ -z "$slug" ]; then
        slug=$(echo "$name" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-' | sed 's/-$//')
    fi
    
    # Validate layer
    layer_id="${LAYER_IDS[$layer_slug]}"
    if [ -z "$layer_id" ]; then
        echo "⚠ Skip: $name - unknown layer: '$layer_slug'"
        skipped=$((skipped + 1))
        continue
    fi
    
    # Map type to valid entry_type
    case "${type,,}" in
        tool*) TYPE_VAL="tool" ;;
        model*) TYPE_VAL="model" ;;
        platform*) TYPE_VAL="platform" ;;
        framework*) TYPE_VAL="framework" ;;
        infrastructure*) TYPE_VAL="infrastructure" ;;
        startup*) TYPE_VAL="startup" ;;
        *) TYPE_VAL="${type:-tool}" ;;
    esac
    
    # Map license
    case "${license,,}" in
        open*) LICENSE_VAL="open_source" ;;
        proprietary*) LICENSE_VAL="proprietary" ;;
        source_available*) LICENSE_VAL="source_available" ;;
        *) LICENSE_VAL="proprietary" ;;
    esac
    
    # Boolean values
    IS_FEATURED="${is_featured:-false}"
    IS_PRIMITIVE="${is_primitive:-false}"
    STAR_COUNT="${star_count:-0}"
    
    # Escape for JSON
    name_esc=$(echo "$name" | jq -Rs '.' | sed 's/^"//;s/"$//')
    slug_esc=$(echo "$slug" | jq -Rs '.' | sed 's/^"//;s/"$//')
    tagline_esc=$(echo "$tagline" | jq -Rs '.' | sed 's/^"//;s/"$//')
    description_esc=$(echo "$description" | jq -Rs '.' | sed 's/^"//;s/"$//')
    company_name_esc=$(echo "$company_name" | jq -Rs '.' | sed 's/^"//;s/"$//')
    company_logo_char_esc=$(echo "$company_logo_char" | jq -Rs '.' | sed 's/^"//;s/"$//')
    
    # Build JSON payload
    PAYLOAD=$(jq -n \
        --arg id "$UUID_QUERY" \
        --arg name "$name_esc" \
        --arg slug "$slug_esc" \
        --arg tagline "$tagline_esc" \
        --arg description "$description_esc" \
        --arg type "$TYPE_VAL" \
        --arg website_url "$website_url" \
        --arg github_url "$github_url" \
        --arg logo_url "$logo_url" \
        --arg company_name "$company_name_esc" \
        --arg company_logo_char "$company_logo_char_esc" \
        --arg license "$LICENSE_VAL" \
        --arg is_featured "$IS_FEATURED" \
        --arg is_primitive "$IS_PRIMITIVE" \
        --arg star_count "$STAR_COUNT" \
        '{
            id: $id,
            name: $name,
            slug: $slug,
            tagline: $tagline,
            description: $description,
            type: $type,
            website_url: $website_url,
            github_url: $github_url,
            logo_url: $logo_url,
            company_name: $company_name,
            company_logo_char: $company_logo_char,
            license: $license,
            is_featured: ($is_featured == "true"),
            is_primitive: ($is_primitive == "true"),
            star_count: ($star_count | tonumber)
        }')
    
    # Insert entity
    result=$(curl -s -w "\n%{http_code}" -X POST "$SUPABASE_URL/rest/v1/$TABLE?apikey=$SUPABASE_URL" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
        -H "Content-Type: application/json" \
        -H "Prefer: resolution=merge-duplicates" \
        -d "$PAYLOAD")
    
    http_code=$(echo "$result" | tail -1)
    body=$(echo "$result" | sed '$d')
    
    if [ "$http_code" = "201" ] || [ "$http_code" = "200" ]; then
        echo "✓ Imported: $name (layer: $layer_slug)"
        imported=$((imported + 1))
        
        # Link to layer
        entity_id=$(echo "$body" | jq -r '.id // empty')
        if [ -n "$entity_id" ] && [ "$entity_id" != "null" ]; then
            # Check if entity_layers exists
            exists=$(curl -s -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
                -H "apikey: $SUPABASE_URL" \
                "$SUPABASE_URL/rest/v1/entity_layers?entity_id=eq.$entity_id&layer_id=eq.$layer_id&select=entity_id")
            
            if [ "$(echo "$exists" | jq -r 'length')" = "0" ]; then
                curl -s -X POST "$SUPABASE_URL/rest/v1/entity_layers?apikey=$SUPABASE_URL" \
                    -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
                    -H "Content-Type: application/json" \
                    -d "{\"entity_id\": \"$entity_id\", \"layer_id\": $layer_id, \"is_primary\": true}" \
                    > /dev/null
            fi
        fi
    else
        echo "✗ Failed: $name - $http_code"
        failed=$((failed + 1))
    fi
    
done < "$CSV_FILE"

echo ""
echo "=== Import Summary ==="
echo "Imported: $imported"
echo "Skipped: $skipped"
echo "Failed: $failed"
echo "Total rows: $((imported + skipped + failed))"

if [ "$imported" -gt 0 ]; then
    echo ""
    echo "Done! Run './scripts/gen-types.sh' to regenerate types."
fi