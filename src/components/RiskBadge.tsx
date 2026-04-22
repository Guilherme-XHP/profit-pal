import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/discount";
import { riskMeta } from "@/lib/discount";

const styles: Record<Exclude<RiskLevel, "out">, string> = {
  safe: "bg-safe text-safe-foreground",
  moderate: "bg-moderate text-moderate-foreground",
  risky: "bg-risky text-risky-foreground",
};

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  if (level === "out") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground",
          className,
        )}
      >
        Fora da faixa
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        styles[level],
        className,
      )}
    >
      {riskMeta[level].label}
    </span>
  );
}
