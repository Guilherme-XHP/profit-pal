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
  const hasCustom = rows.some((r) => r.source === "custom");
  const hasMoney = rows.some((r) => r.source === "money");

  return (
    <div className={cn("flex h-full min-h-0 flex-col rounded-2xl border-2 p-3 shadow-[var(--shadow-card)]", s.card)}>
      <div className="mb-2 flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("h-2.5 w-2.5 rounded-full", s.dot)} />
          <h3 className={cn("text-sm font-bold", s.header)}>{title}</h3>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground">{range}</span>
      </div>

      {(hasCustom || hasMoney) && (
        <div className="mb-2 flex flex-wrap items-center gap-2 text-[9px] font-medium uppercase tracking-wide">
          {hasCustom && (
            <span className="flex items-center gap-1 text-source-custom">
              <span className="h-1.5 w-1.5 rounded-full bg-source-custom" />
              Personalizada
            </span>
          )}
          {hasMoney && (
            <span className="flex items-center gap-1 text-source-money">
              <span className="h-1.5 w-1.5 rounded-full bg-source-money" />
              Em dinheiro
            </span>
          )}
        </div>
      )}

      {rows.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">Sem valores nesta faixa.</p>
      ) : (
        <ul className="flex-1 min-h-0 space-y-1 overflow-y-auto pr-1">
          {rows.map((row, idx) => {
            const isCustom = row.source === "custom";
            const isMoney = row.source === "money";
            return (
              <li
                key={`${row.percent}-${idx}-${row.source ?? "auto"}`}
                className={cn(
                  "flex items-center justify-between rounded-lg border bg-card/60 px-2.5 py-1.5 transition-colors border-l-4",
                  s.row,
                  isCustom && "border-l-source-custom bg-source-custom-soft/40",
                  isMoney && "border-l-source-money bg-source-money-soft/40",
                  !isCustom && !isMoney && "border-l-transparent",
                )}
              >
                <div className="flex flex-col leading-tight">
                  <span
                    className={cn(
                      "text-xs font-bold tabular-nums",
                      isCustom ? "text-source-custom" : isMoney ? "text-source-money" : s.accent,
                    )}
                  >
                    {formatPercent(row.percent)}
                  </span>
                  {(isCustom || isMoney) && (
                    <span
                      className={cn(
                        "text-[9px] font-medium uppercase tracking-wide",
                        isCustom ? "text-source-custom/80" : "text-source-money/80",
                      )}
                    >
                      {isCustom ? "personalizada" : "em dinheiro"}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-end leading-tight">
                  <span className="text-xs font-semibold tabular-nums text-foreground">
                    {formatBRL(row.finalValue)}
                  </span>
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    −{formatBRL(row.discountValue)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
