import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createAccessToken,
  createAdminClient,
  encryptAccessToken,
  hashSecret,
} from "@/lib/cli-auth";

export const runtime = "nodejs";

function authorizationUrl(request: Request, userCode: string, error?: string) {
  const url = new URL("/cli/authorize", request.url);
  url.searchParams.set("user_code", userCode);
  if (error) url.searchParams.set("error", error);
  return url;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const userCode = formData.get("user_code");
  if (typeof userCode !== "string" || !/^[A-F0-9]{5}-[A-F0-9]{5}$/.test(userCode)) {
    return NextResponse.redirect(new URL("/cli/authorized?status=invalid", request.url), 303);
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("next", `/cli/authorize?user_code=${encodeURIComponent(userCode)}`);
      return NextResponse.redirect(loginUrl, 303);
    }

    const admin = createAdminClient();
    const { data: authRequest, error: lookupError } = await admin
      .from("cli_auth_requests")
      .select("id,status,expires_at")
      .eq("user_code", userCode)
      .maybeSingle();

    if (lookupError || !authRequest) {
      return NextResponse.redirect(authorizationUrl(request, userCode, "invalid"), 303);
    }
    if (authRequest.status !== "pending" || new Date(authRequest.expires_at).getTime() <= Date.now()) {
      return NextResponse.redirect(authorizationUrl(request, userCode, "expired"), 303);
    }

    const accessToken = createAccessToken();
    const email = user.email ?? user.id;
    const { data: tokenRow, error: tokenError } = await admin
      .from("cli_access_tokens")
      .insert({
        user_id: user.id,
        workspace_id: user.id,
        user_email: email,
        token_hash: hashSecret(accessToken),
      })
      .select("id")
      .single();

    if (tokenError || !tokenRow) {
      console.error("[POST /api/cli/auth/approve] token insert failed:", tokenError);
      return NextResponse.redirect(authorizationUrl(request, userCode, "server"), 303);
    }

    const approvedAt = new Date().toISOString();
    const { data: approved, error: approvalError } = await admin
      .from("cli_auth_requests")
      .update({
        status: "approved",
        user_id: user.id,
        workspace_id: user.id,
        user_email: email,
        access_token_id: tokenRow.id,
        token_ciphertext: encryptAccessToken(accessToken),
        approved_at: approvedAt,
        updated_at: approvedAt,
      })
      .eq("id", authRequest.id)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();

    if (approvalError || !approved) {
      await admin.from("cli_access_tokens").delete().eq("id", tokenRow.id);
      return NextResponse.redirect(authorizationUrl(request, userCode, "expired"), 303);
    }

    return NextResponse.redirect(new URL("/cli/authorized?status=success", request.url), 303);
  } catch (error) {
    console.error("[POST /api/cli/auth/approve] unexpected error:", error);
    return NextResponse.redirect(authorizationUrl(request, userCode, "server"), 303);
  }
}
