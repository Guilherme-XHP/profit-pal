import { cn } from "@/lib/utils";
import { formatBRL, formatPercent, type DiscountRow } from "@/lib/discount";

type Variant = "safe" | "moderate" | "risky";

const variantStyles: Record<Variant, { card: string; header: string; dot: string; row: string; accent: string }> = {
  safe: {
    card: "border-safe-border bg-safe-soft/40",
    header: "text-safe",
    dot: "bg-safe",
    row: "border-safe-border/60 hover:bg-safe-soft",
    accent: "text-safe",
  },
  moderate: {
    card: "border-moderate-border bg-moderate-soft/40",
    header: "text-moderate",
    dot: "bg-moderate",
    row: "border-moderate-border/60 hover:bg-moderate-soft",
    accent: "text-moderate",
  },
  risky: {
    card: "border-risky-border bg-risky-soft/40",
    header: "text-risky",
    dot: "bg-risky",
    row: "border-risky-border/60 hover:bg-risky-soft",
    accent: "text-risky",
  },
};

interface Props {
  variant: Variant;
  title: string;
  range: string;
  rows: DiscountRow[];
}

export function DiscountColumn({ variant, title, range, rows }: Props) {
  const s = variantStyles[variant];
  return (
    <div className={cn("rounded-2xl border-2 p-5 shadow-[var(--shadow-card)]", s.card)}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("h-3 w-3 rounded-full", s.dot)} />
          <h3 className={cn("text-base font-bold", s.header)}>{title}</h3>
        </div>
        <span className="text-xs font-medium text-muted-foreground">{range}</span>
      </div>

      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Sem valores nesta faixa.</p>
      ) : (
        <ul className="space-y-1.5">
          {rows.map((row, idx) => (
            <li
              key={`${row.percent}-${idx}`}
              className={cn(
                "flex items-center justify-between rounded-lg border bg-card/60 px-3 py-2.5 transition-colors",
                s.row,
              )}
            >
              <span className={cn("text-sm font-bold tabular-nums", s.accent)}>
                {formatPercent(row.percent)}
              </span>
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  {formatBRL(row.finalValue)}
                </span>
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  −{formatBRL(row.discountValue)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
