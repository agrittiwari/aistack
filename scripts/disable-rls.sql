-- =====================================================
-- RLS POLICY: Public read, authenticated write
-- Run in pgAdmin or Supabase SQL Editor
-- =====================================================

-- First enable RLS on all tables (if not already)
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE layers ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PUBLIC READ (anyone can view)
-- =====================================================
DROP POLICY IF EXISTS "Public read access" ON entities;
DROP POLICY IF EXISTS "Public read access" ON entity_layers;
DROP POLICY IF EXISTS "Public read access" ON layers;

CREATE POLICY "Public read access" ON entities FOR SELECT USING (true);
CREATE POLICY "Public read access" ON entity_layers FOR SELECT USING (true);
CREATE POLICY "Public read access" ON layers FOR SELECT USING (true);

-- =====================================================
-- AUTHENTICATED WRITE (only logged in users)
-- =====================================================
DROP POLICY IF EXISTS "Authenticated insert" ON entities;
DROP POLICY IF EXISTS "Authenticated update" ON entities;
DROP POLICY IF EXISTS "Authenticated delete" ON entities;

DROP POLICY IF EXISTS "Authenticated insert" ON entity_layers;
DROP POLICY IF EXISTS "Authenticated update" ON entity_layers;
DROP POLICY IF EXISTS "Authenticated delete" ON entity_layers;

-- Entities: Authenticated users can insert/update/delete
CREATE POLICY "Authenticated insert" ON entities FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated update" ON entities FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated delete" ON entities FOR DELETE USING (auth.uid() IS NOT NULL);

-- Entity layers: Authenticated users can link/unlink
CREATE POLICY "Authenticated insert" ON entity_layers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated update" ON entity_layers FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated delete" ON entity_layers FOR DELETE USING (auth.uid() IS NOT NULL);

-- =====================================================
-- VERIFY
-- =====================================================
-- This should return data for anonymous:
-- SELECT e.id, e.name FROM entities LIMIT 5;

-- This should fail for anonymous:
-- INSERT INTO entities (name, slug, ...) VALUES (...);