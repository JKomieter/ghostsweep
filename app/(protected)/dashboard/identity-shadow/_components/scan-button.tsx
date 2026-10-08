"use client";

import { Scan, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ScanStatus =
  | "starting"
  | "scanning"
  | "processing"
  | "completed"
  | "failed"
  | null;

type ScanButtonProps = {
  isScanning: boolean;
  progress: number;
  status: ScanStatus;
  foundCount: number;
  message: string | null;
  onScan: () => void;
};

const STATUS_LABELS: Record<string, string> = {
  starting: "Initializing…",
  scanning: "Scanning…",
  processing: "Processing…",
};

export default function ScanButton({
  isScanning,
  progress,
  status,
  foundCount,
  message,
  onScan,
}: ScanButtonProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Progress info shown while scanning */}
      {isScanning && status && (
        <div className="hidden sm:flex items-center gap-3 text-xs text-foreground/40 font-mono">
          {message && (
            <span className="max-w-[180px] truncate text-foreground/25">
              {message}
            </span>
          )}
          {foundCount > 0 && (
            <span className="text-emerald-600/60 dark:text-emerald-400/60">
              {foundCount} found
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <div className="h-1 w-16 rounded-full bg-foreground/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-400/60 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] tabular-nums text-foreground/30">
              {progress}%
            </span>
          </div>
        </div>
      )}

      <Button
        onClick={onScan}
        disabled={isScanning}
        size="sm"
        className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 hover:border-emerald-500/50 transition-all text-xs font-mono uppercase tracking-wider gap-1.5"
      >
        {isScanning ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            {STATUS_LABELS[status ?? "scanning"] ?? "Scanning…"}
          </>
        ) : (
          <>
            <Scan className="h-3 w-3" />
            Scan Now
          </>
        )}
      </Button>
    </div>
  );
}
