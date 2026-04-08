import Link from "next/link";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="bg-[#0a0a0c] border border-white/10 p-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold tracking-widest uppercase mb-4">
            Transmission Received
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase mb-4">
            Awaiting<span className="text-blue-500">.</span>Confirmation
          </h1>
          <p className="text-white/40 text-sm mb-8">
            Check your inbox for the verification signal. Once confirmed, you'll have full access to the intelligence directory.
          </p>
          <Link 
            href="/auth/login" 
            className="text-white/40 text-xs hover:text-white transition-colors"
          >
            ← Return to Authentication
          </Link>
        </div>
      </div>
    </div>
  );
}