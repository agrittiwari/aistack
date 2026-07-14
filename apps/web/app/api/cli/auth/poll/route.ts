import { NextResponse } from "next/server";
import { createAdminClient, decryptAccessToken, hashSecret } from "@/lib/cli-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { device_code?: unknown };
    if (typeof body.device_code !== "string" || !body.device_code.startsWith("adc_")) {
      return NextResponse.json({ error: "Invalid device_code" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: authRequest, error } = await admin
      .from("cli_auth_requests")
      .select("id,status,expires_at,workspace_id,user_email,access_token_id,token_ciphertext")
      .eq("device_code_hash", hashSecret(body.device_code))
      .maybeSingle();

    if (error) {
      console.error("[POST /api/cli/auth/poll] lookup failed:", error);
      return NextResponse.json({ error: "Unable to check CLI login" }, { status: 500 });
    }

    if (!authRequest || new Date(authRequest.expires_at).getTime() <= Date.now()) {
      if (authRequest && authRequest.status !== "expired") {
        await admin
          .from("cli_auth_requests")
          .update({ status: "expired", updated_at: new Date().toISOString() })
          .eq("id", authRequest.id);
      }
      return NextResponse.json({ status: "expired" }, { headers: { "Cache-Control": "no-store" } });
    }

    if (authRequest.status === "pending") {
      return NextResponse.json({ status: "pending" }, { headers: { "Cache-Control": "no-store" } });
    }

    if (
      authRequest.status !== "approved" ||
      !authRequest.token_ciphertext ||
      !authRequest.access_token_id ||
      !authRequest.workspace_id ||
      !authRequest.user_email
    ) {
      return NextResponse.json({ status: "expired" }, { headers: { "Cache-Control": "no-store" } });
    }

    const token = decryptAccessToken(authRequest.token_ciphertext);
    const completedAt = new Date().toISOString();
    const { error: activationError } = await admin
      .from("cli_access_tokens")
      .update({ activated_at: completedAt })
      .eq("id", authRequest.access_token_id)
      .is("activated_at", null);

    if (activationError) {
      console.error("[POST /api/cli/auth/poll] token activation failed:", activationError);
      return NextResponse.json({ error: "Unable to finish CLI login" }, { status: 500 });
    }

    const { data: completed, error: completionError } = await admin
      .from("cli_auth_requests")
      .update({
        status: "complete",
        token_ciphertext: null,
        completed_at: completedAt,
        updated_at: completedAt,
      })
      .eq("id", authRequest.id)
      .eq("status", "approved")
      .select("id")
      .maybeSingle();

    if (completionError || !completed) {
      return NextResponse.json({ status: "expired" }, { headers: { "Cache-Control": "no-store" } });
    }

    return NextResponse.json(
      {
        status: "complete",
        token,
        workspace_id: authRequest.workspace_id,
        email: authRequest.user_email,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[POST /api/cli/auth/poll] unexpected error:", error);
    return NextResponse.json({ error: "Unable to check CLI login" }, { status: 500 });
  }
}
