#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: node excel-to-sql.js <file> [sheet-name]');
  console.error('Supports .xlsx, .xls, .csv files');
  console.error('Example: node excel-to-sql.js entities.xlsx');
  console.error('Example: node excel-to-sql.js entities.csv');
  process.exit(1);
}

const inputFile = args[0];
const sheetName = args[1] || 'Sheet1';

if (!fs.existsSync(inputFile)) {
  console.error(`File not found: ${inputFile}`);
  process.exit(1);
}

const ext = path.extname(inputFile).toLowerCase();
let rows = [];

if (ext === '.csv') {
  const content = fs.readFileSync(inputFile, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length === 0) {
    console.error('No data found in CSV');
    process.exit(1);
  }
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  rows = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] || '';
    });
    return obj;
  });
} else if (ext === '.xlsx' || ext === '.xls') {
  let XLSX;
  try {
    XLSX = require('xlsx');
  } catch {
    console.error('xlsx package not installed. Install with: npm install xlsx');
    console.error('Or use CSV format instead of Excel.');
    process.exit(1);
  }
  const workbook = XLSX.readFile(inputFile);
  const sheet = workbook.Sheets[sheetName] || workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) {
    console.error(`Sheet "${sheetName}" not found`);
    process.exit(1);
  }
  rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
} else {
  console.error('Unsupported file format. Use .xlsx, .xls, or .csv');
  process.exit(1);
}

if (rows.length === 0) {
  console.error('No data found');
  process.exit(1);
}

const columns = Object.keys(rows[0]);
console.log(`Detected columns: ${columns.join(', ')}`);

const entityColumns = [
  'id', 'name', 'slug', 'tagline', 'description', 'type',
  'website_url', 'github_url', 'logo_url', 'company_name',
  'company_logo_char', 'license', 'is_featured', 'is_primitive',
  'star_count', 'updated_at', 'verified_node'
];

const validColumns = columns.filter(col => 
  entityColumns.includes(col.toLowerCase()) || 
  entityColumns.includes(col)
);

console.log(`Valid columns for entities table: ${validColumns.join(', ')}`);

function escapeValue(value) {
  if (value === null || value === undefined || value === '') return 'NULL';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return value;
  if (value instanceof Date) {
    return `'${value.toISOString()}'`;
  }
  const str = String(value)
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\');
  return `'${str}'`;
}

function generateSlug(name) {
  if (!name) return `entity-${Date.now()}`;
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateUUID() {
  return 'gen_random_uuid()';
}

function isValidUrl(string) {
  if (!string) return false;
  try {
    new URL(String(string));
    return true;
  } catch {
    return false;
  }
}

const now = 'NOW()';
let sql = `-- =====================================================\n`;
sql += `-- Excel/CSV Import: ${path.basename(inputFile)}\n`;
sql += `-- Generated: ${new Date().toISOString()}\n`;
sql += `-- =====================================================\n\n`;

sql += `-- IMPORT ENTITIES (UPSERT BY SLUG)\n`;
sql += `-- Columns: ${validColumns.join(', ')}\n`;
sql += `-- Rows: ${rows.length}\n`;
sql += `-- =====================================================\n\n`;

const insertColumns = validColumns.map(col => {
  const lowerCol = col.toLowerCase();
  if (lowerCol === 'id') return 'id';
  if (lowerCol === 'updated_at') return 'updated_at';
  return col;
});

let valueList = [];

for (let i = 0; i < rows.length; i++) {
  const row = rows[i];
  const nameValue = row.name || row.Name || row.NAME || '';
  const values = insertColumns.map(col => {
    const lowerCol = col.toLowerCase();
    let value = row[col] !== undefined ? row[col] : row[col.toLowerCase()];
    
    if (value === '' || value === undefined || value === null) {
      if (lowerCol === 'id') return generateUUID();
      if (lowerCol === 'updated_at') return now;
      if (lowerCol === 'slug') return generateSlug(nameValue || `entity-${i}`);
      if (['is_featured', 'is_primitive', 'verified_node'].includes(lowerCol)) return 'false';
      if (['star_count'].includes(lowerCol)) return '0';
      return 'NULL';
    }
    
    if (lowerCol === 'id') {
      const strVal = String(value).trim();
      return strVal.match(/^[0-9a-f-]{36}$/i) 
        ? `'${strVal}'` 
        : generateUUID();
    }
    
    if (lowerCol === 'slug') {
      return escapeValue(value || generateSlug(nameValue));
    }
    
    if (lowerCol === 'name') {
      return escapeValue(value);
    }
    
    if (lowerCol === 'updated_at') {
      if (value instanceof Date) return `'${value.toISOString()}'`;
      if (value && typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
        return escapeValue(value);
      }
      return now;
    }
    
    if (['is_featured', 'is_primitive', 'verified_node'].includes(lowerCol)) {
      if (typeof value === 'boolean') return value ? 'true' : 'false';
      if (typeof value === 'number') return value === 1 ? 'true' : 'false';
      const lower = String(value).toLowerCase().trim();
      return (lower === 'true' || lower === 'yes' || lower === 'y' || lower === '1') ? 'true' : 'false';
    }
    
    if (['star_count'].includes(lowerCol)) {
      const num = parseInt(value, 10);
      return isNaN(num) ? 0 : num;
    }
    
    if (['website_url', 'github_url', 'logo_url'].includes(lowerCol)) {
      if (!value || !isValidUrl(value)) return 'NULL';
      return escapeValue(value);
    }
    
    return escapeValue(value);
  });

  valueList.push(`(${values.join(', ')})`);
}

sql += `INSERT INTO entities (${insertColumns.join(', ')})\n`;
sql += `VALUES \n`;
sql += valueList.join(',\n');
sql += `\n`;

const updateSet = insertColumns
  .filter(col => {
    const lower = col.toLowerCase();
    return lower !== 'id' && lower !== 'slug';
  })
  .map(col => `${col} = EXCLUDED.${col}`)
  .join(', ');

sql += `ON CONFLICT (slug) DO UPDATE SET ${updateSet};\n\n`;

sql += `-- =====================================================\n`;
sql += `-- VERIFY IMPORT\n`;
sql += `-- =====================================================\n`;
sql += `SELECT slug, name, company_name, logo_url, type FROM entities ORDER BY name LIMIT 20;\n`;

const outputFile = inputFile.replace(/\.(xlsx|xls|csv)$/i, '-import.sql');
fs.writeFileSync(outputFile, sql);
console.log(`\nSQL generated: ${outputFile}`);
console.log(`Total rows: ${rows.length}`);
console.log(`Columns: ${validColumns.join(', ')}`);