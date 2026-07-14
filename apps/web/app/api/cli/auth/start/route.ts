import { NextResponse } from "next/server";
import {
  cliAuthConfig,
  createAdminClient,
  createDeviceCode,
  createUserCode,
  deviceCodeExpiry,
  hashSecret,
} from "@/lib/cli-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const deviceCode = createDeviceCode();
    const userCode = createUserCode();
    const expiresAt = deviceCodeExpiry();
    const admin = createAdminClient();

    const { error } = await admin.from("cli_auth_requests").insert({
      device_code_hash: hashSecret(deviceCode),
      user_code: userCode,
      poll_interval: cliAuthConfig.pollInterval,
      expires_at: expiresAt.toISOString(),
    });

    if (error) {
      console.error("[POST /api/cli/auth/start] insert failed:", error);
      return NextResponse.json({ error: "Unable to start CLI login", code: "CLI_AUTH_DATABASE" }, { status: 500 });
    }

    const loginUrl = new URL("/cli/authorize", request.url);
    loginUrl.searchParams.set("user_code", userCode);

    return NextResponse.json(
      {
        device_code: deviceCode,
        user_code: userCode,
        login_url: loginUrl.toString(),
        expires_in: cliAuthConfig.expiresIn,
        poll_interval: cliAuthConfig.pollInterval,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[POST /api/cli/auth/start] unexpected error:", error);
    return NextResponse.json({ error: "CLI authentication is not configured", code: "CLI_AUTH_NOT_CONFIGURED" }, { status: 500 });
  }
}
