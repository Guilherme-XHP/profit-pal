import { formatBRL, formatPercent } from "@/lib/discount";
import { TrendingUp, Tag, Target } from "lucide-react";

interface Props {
  finalPrice: number;
  factoryPrice: number;
  gap: number;
  gapPercent: number;
}

export function SummaryStats({ finalPrice, factoryPrice, gap, gapPercent }: Props) {
  const items = [
    {
      icon: Tag,
      label: "Valor final",
      value: formatBRL(finalPrice),
      tone: "text-primary",
    },
    {
      icon: Target,
      label: "Valor de fábrica",
      value: formatBRL(factoryPrice),
      tone: "text-foreground",
    },
    {
      icon: TrendingUp,
      label: "GAP (lucro)",
      value: formatBRL(gap),
      sub: `${formatPercent(gapPercent)} sobre fábrica`,
      tone: "text-safe",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-2xl border border-border/60 bg-card p-4 shadow-[var(--shadow-card)]"
        >
          <div className="flex items-center gap-2">
            <it.icon className={`h-4 w-4 ${it.tone}`} />
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {it.label}
            </span>
          </div>
          <p className={`mt-2 text-2xl font-bold tabular-nums ${it.tone}`}>{it.value}</p>
          {it.sub && <p className="text-xs text-muted-foreground">{it.sub}</p>}
        </div>
      ))}
    </div>
  );
}
