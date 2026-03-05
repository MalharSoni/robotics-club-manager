import { Loader2 } from "lucide-react";
import { BackgroundBeams } from "@/components/ui/aceternity/background-beams";

export default function StatsLoading() {
  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      <BackgroundBeams className="opacity-40" />

      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 blur-xl bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded-full"></div>
            <Loader2 className="h-16 w-16 animate-spin text-cyan-400 mx-auto relative z-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              Loading Session Data
            </h2>
            <p className="text-slate-400">Preparing your student stats dashboard...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
