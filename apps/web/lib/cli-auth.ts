import { createHash, createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const DEVICE_CODE_TTL_SECONDS = 10 * 60;
const DEFAULT_POLL_INTERVAL_SECONDS = 5;

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required for CLI authentication",
    );
  }

  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function createDeviceCode() {
  return `adc_${randomBytes(32).toString("base64url")}`;
}

export function createUserCode() {
  return randomBytes(5).toString("hex").toUpperCase().match(/.{1,5}/g)!.join("-");
}

export function createAccessToken() {
  return `ast_${randomBytes(32).toString("base64url")}`;
}

export function hashSecret(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function encryptionKey() {
  const secret = process.env.CLI_TOKEN_ENCRYPTION_KEY;
  if (!secret || secret.length < 32) {
    throw new Error("CLI_TOKEN_ENCRYPTION_KEY must contain at least 32 characters");
  }

  return createHash("sha256").update(secret).digest();
}

export function encryptAccessToken(token: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [iv, tag, ciphertext].map((part) => part.toString("base64url")).join(".");
}

export function decryptAccessToken(value: string) {
  const parts = value.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted CLI token");
  }

  const [iv, tag, ciphertext] = parts.map((part) => Buffer.from(part, "base64url"));
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

export function deviceCodeExpiry() {
  return new Date(Date.now() + DEVICE_CODE_TTL_SECONDS * 1000);
}

export const cliAuthConfig = {
  expiresIn: DEVICE_CODE_TTL_SECONDS,
  pollInterval: DEFAULT_POLL_INTERVAL_SECONDS,
};

export function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;

  const token = authorization.slice("Bearer ".length).trim();
  return token || null;
}

export async function authenticateCliRequest(request: Request) {
  const token = getBearerToken(request);
  if (!token?.startsWith("ast_")) return null;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("cli_access_tokens")
    .select("id,user_id,user_email,workspace_id,expires_at,revoked_at")
    .eq("token_hash", hashSecret(token))
    .not("activated_at", "is", null)
    .maybeSingle();

  const expired = data?.expires_at ? new Date(data.expires_at).getTime() <= Date.now() : false;
  if (error || !data || data.revoked_at || expired) return null;

  await admin.from("cli_access_tokens").update({ last_used_at: new Date().toISOString() }).eq("id", data.id);
  return { admin, token: data };
}
