import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseKey) {
  console.error("Error: SUPABASE_SERVICE_ROLE_KEY not set");
  console.log("Available env vars:", Object.keys(process.env).filter(k => k.includes("SUPABASE")));
  process.exit(1);
}

if (!supabaseKey) {
  console.error("Error: SUPABASE_SERVICE_ROLE_KEY not set");
  console.log("Make sure to run: source .env.local before this script");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("Download error:", error);
    return null;
  }
}

async function convertToWebp(inputBuffer: Buffer, width?: number): Promise<Buffer> {
  let sharpInstance = sharp(inputBuffer).webp({ quality: 80 });
  
  if (width) {
    sharpInstance = sharpInstance.resize(width, null, { fit: "inside" });
  }
  
  return sharpInstance.toBuffer();
}

async function uploadToSupabase(
  buffer: Buffer,
  entitySlug: string
): Promise<string | null> {
  const filename = `${entitySlug}/logo.webp`;
  
  const { data, error } = await supabase.storage
    .from("logos")
    .upload(filename, buffer, {
      contentType: "image/webp",
      upsert: true,
    });

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from("logos")
    .getPublicUrl(filename);

  return urlData.publicUrl;
}

export async function processAndUploadLogo(
  imageUrl: string,
  entitySlug: string,
  width: number = 256
): Promise<UploadResult> {
  try {
    console.log(`Downloading: ${imageUrl}`);
    const inputBuffer = await downloadImage(imageUrl);
    
    if (!inputBuffer) {
      return { success: false, error: "Failed to download image" };
    }

    console.log(`Converting to WebP (max width: ${width}px)...`);
    const webpBuffer = await convertToWebp(inputBuffer, width);
    
    console.log(`Uploading to Supabase Storage...`);
    const publicUrl = await uploadToSupabase(webpBuffer, entitySlug);
    
    if (!publicUrl) {
      return { success: false, error: "Failed to upload to Supabase" };
    }

    console.log(`✓ Uploaded: ${publicUrl}`);
    return { success: true, url: publicUrl };
  } catch (error) {
    console.error("Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateEntityLogo(
  entitySlug: string,
  logoUrl: string
): Promise<boolean> {
  const { error } = await supabase
    .from("entities")
    .update({ logo_url: logoUrl })
    .eq("slug", entitySlug);

  if (error) {
    console.error("Database update error:", error);
    return false;
  }

  return true;
}

// CLI execution
const args = process.argv.slice(2);
if (args.length >= 2) {
  const imageUrl = args[0];
  const entitySlug = args[1];
  
  processAndUploadLogo(imageUrl, entitySlug).then(async (result) => {
    if (result.success && result.url) {
      const updated = await updateEntityLogo(entitySlug, result.url);
      if (updated) {
        console.log(`\n✓ Database updated for ${entitySlug}`);
        console.log(`SQL: UPDATE entities SET logo_url = '${result.url}' WHERE slug = '${entitySlug}';`);
      }
    } else {
      console.error("Failed:", result.error);
      process.exit(1);
    }
  });
} else {
  console.log(`
Usage: npx tsx scripts/upload-logo.ts <image_url> <entity_slug>

Example:
  npx tsx scripts/upload-logo.ts https://example.com/logo.png openai
  
  This will:
  1. Download the image
  2. Convert to WebP (max 256px width)
  3. Upload to Supabase Storage (logos bucket)
  4. Update the entity's logo_url in the database
  `);
}