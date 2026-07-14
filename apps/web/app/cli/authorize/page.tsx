import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/cli-auth";

export const dynamic = "force-dynamic";

type AuthorizePageProps = {
  searchParams: Promise<{ user_code?: string; error?: string }>;
};

const errorMessages: Record<string, string> = {
  expired: "This login request has expired. Start a new login from the CLI.",
  invalid: "This login request is invalid.",
  server: "The login request could not be approved. Please try again.",
};

export default async function CliAuthorizePage({ searchParams }: AuthorizePageProps) {
  const { user_code: userCode, error } = await searchParams;
  if (!userCode || !/^[A-F0-9]{5}-[A-F0-9]{5}$/.test(userCode)) {
    return <AuthorizationError message="This login request is invalid." />;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent(`/cli/authorize?user_code=${userCode}`)}`);
  }

  let authRequest: { user_code: string; status: string; expires_at: string } | null = null;
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("cli_auth_requests")
      .select("user_code,status,expires_at")
      .eq("user_code", userCode)
      .maybeSingle();
    authRequest = data;
  } catch {
    return <AuthorizationError message="CLI authentication is not configured on this deployment." />;
  }

  if (
    !authRequest ||
    authRequest.status !== "pending" ||
    new Date(authRequest.expires_at).getTime() <= Date.now()
  ) {
    return <AuthorizationError message={errorMessages[error ?? ""] ?? errorMessages.expired} />;
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          aistack CLI
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Authorize this terminal?</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{user.email ?? user.id}</span>.
          Only continue if you started <code>aistack login</code> yourself.
        </p>

        <div className="mt-6 rounded-md border bg-muted/40 p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Verification code</p>
          <p className="mt-1 font-mono text-xl font-semibold tracking-wider">{authRequest.user_code}</p>
        </div>

        {error ? (
          <p className="mt-4 text-sm text-destructive">
            {errorMessages[error] ?? "The request could not be approved."}
          </p>
        ) : null}

        <form action="/api/cli/auth/approve" method="post" className="mt-6">
          <input type="hidden" name="user_code" value={userCode} />
          <button
            type="submit"
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Authorize CLI
          </button>
        </form>
      </div>
    </div>
  );
}

function AuthorizationError({ message }: { message: string }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold">Unable to authorize CLI</h1>
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
