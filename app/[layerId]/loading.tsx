import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
      </div>
    </div>
  );
}
