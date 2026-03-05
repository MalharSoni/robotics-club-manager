"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { BackgroundBeams } from "@/components/ui/aceternity/background-beams";
import Link from "next/link";

export default function StatsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Stats page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      <BackgroundBeams className="opacity-40" />

      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <div className="relative">
            <div className="absolute inset-0 blur-xl bg-gradient-to-r from-red-500/30 to-orange-500/30 rounded-full"></div>
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto relative z-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
              Something went wrong
            </h2>
            <p className="text-slate-400">
              We encountered an error loading the student stats page.
            </p>
            {error.message && (
              <p className="text-sm text-slate-500 font-mono bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                {error.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={reset}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Link href="/dashboard">
              <Button variant="outline" className="border-cyan-500/30 text-cyan-400">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
