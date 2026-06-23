"use client";

import { useCountdown } from "@/hooks/use-countdown";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  totalSeconds: number;
  onExpire: () => void;
}

export default function CountdownTimer({
  totalSeconds,
  onExpire,
}: CountdownTimerProps) {
  const { timeLeft, formatted } = useCountdown(totalSeconds, onExpire);

  const progress = totalSeconds > 0 ? (timeLeft / totalSeconds) * 100 : 0;
  const isWarning = timeLeft <= 300 && timeLeft > 60;
  const isCritical = timeLeft <= 60;

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
        Time Remaining
      </span>

      <span
        className={cn(
          "text-5xl font-mono font-bold tabular-nums leading-none",
          isCritical
            ? "text-red-600 animate-pulse"
            : isWarning
            ? "text-yellow-600"
            : "text-slate-700"
        )}
      >
        {formatted}
      </span>

      <Progress
        value={progress}
        className={cn(
          "h-2 w-40",
          isCritical
            ? "[&>div]:bg-red-500"
            : isWarning
            ? "[&>div]:bg-yellow-500"
            : "[&>div]:bg-slate-500"
        )}
      />
    </div>
  );
}
