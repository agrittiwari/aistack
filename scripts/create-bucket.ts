import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseKey) {
  console.error("Error: SUPABASE_SERVICE_ROLE_KEY not set");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createLogosBucket() {
  console.log("Creating 'logos' bucket...");
  
  const { data, error } = await supabase.storage.createBucket("logos", {
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ["image/*"],
  });

  if (error) {
    if (error.message.includes("already exists")) {
      console.log("Bucket 'logos' already exists");
      return;
    }
    console.error("Error creating bucket:", error);
    return;
  }

  console.log("Bucket created successfully:", data);
}

createLogosBucket();