import { NextResponse } from "next/server";
import { createAdminClient, getBearerToken, hashSecret } from "@/lib/cli-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = getBearerToken(request);
  if (!token?.startsWith("ast_")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const { data: accessToken, error } = await admin
      .from("cli_access_tokens")
      .select("id,user_email,workspace_id,activated_at,expires_at,revoked_at")
      .eq("token_hash", hashSecret(token))
      .not("activated_at", "is", null)
      .maybeSingle();

    const isExpired = accessToken?.expires_at
      ? new Date(accessToken.expires_at).getTime() <= Date.now()
      : false;

    if (error || !accessToken || accessToken.revoked_at || isExpired) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await admin
      .from("cli_access_tokens")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", accessToken.id);

    return NextResponse.json(
      { email: accessToken.user_email, workspace_id: accessToken.workspace_id },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[GET /api/cli/whoami] unexpected error:", error);
    return NextResponse.json({ error: "Unable to validate CLI token" }, { status: 500 });
  }
}
