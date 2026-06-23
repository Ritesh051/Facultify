import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  maxScore: number;
}

export default function ScoreBadge({ score, maxScore }: ScoreBadgeProps) {
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  const colorClass =
    pct >= 80
      ? "bg-green-100 text-green-700 border-green-200"
      : pct >= 60
      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
      : "bg-red-100 text-red-700 border-red-200";

  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={cn(
          "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border",
          colorClass
        )}
      >
        {pct}%
      </span>
      <span className="text-xs text-muted-foreground">
        {score} / {maxScore}
      </span>
    </div>
  );
}
