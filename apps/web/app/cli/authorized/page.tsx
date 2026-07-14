type AuthorizedPageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function CliAuthorizedPage({ searchParams }: AuthorizedPageProps) {
  const { status } = await searchParams;
  const successful = status === "success";

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">
          {successful ? "CLI authorized" : "Authorization failed"}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {successful
            ? "You can close this window and return to your terminal."
            : "Return to your terminal and run aistack login again."}
        </p>
      </div>
    </div>
  );
}
