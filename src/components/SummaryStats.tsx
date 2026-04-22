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
      label: "Lucro",
      value: formatBRL(gap),
      sub: `${formatPercent(gapPercent)} sobre fábrica`,
      tone: "text-safe",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-xl border border-border/60 bg-card p-2.5 shadow-[var(--shadow-card)]"
        >
          <div className="flex items-center gap-1.5">
            <it.icon className={`h-3 w-3 ${it.tone}`} />
            <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground truncate">
              {it.label}
            </span>
          </div>
          <p className={`mt-1 text-sm font-bold tabular-nums truncate ${it.tone}`}>{it.value}</p>
          {it.sub && <p className="text-[9px] text-muted-foreground truncate">{it.sub}</p>}
        </div>
      ))}
    </div>
  );
}
