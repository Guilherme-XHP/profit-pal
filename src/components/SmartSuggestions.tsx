import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { buildDiscountRow, classifyRisk, formatBRL, formatPercent, type DiscountSource } from "@/lib/discount";
import { RiskBadge } from "./RiskBadge";
import { cn } from "@/lib/utils";

interface Props {
  finalPrice: number;
  gap: number;
  /** Anchor in BRL (e.g. money discount typed by the seller). 0 means no anchor. */
  anchorAmount: number;
  /** Anchor percentages (custom percentages typed). */
  anchorPercents: number[];
}

interface Suggestion {
  percent: number;
  reason: string;
  conversionScore: number;
  source: DiscountSource;
  basedOn?: number; // anchor percent that produced it
}

function buildSuggestions(
  anchorPercent: number | null,
  anchorPercents: number[],
): Suggestion[] {
  const seen = new Set<number>();
  const out: Suggestion[] = [];

  const score = (p: number) => {
    const dist = Math.abs(p - 45);
    return Math.max(20, Math.round(95 - dist * 1.4));
  };

  const push = (raw: number, reason: string, source: DiscountSource, basedOn?: number) => {
    const p = Math.max(0.5, Math.min(89.5, +raw.toFixed(1)));
    const key = Math.round(p * 2) / 2;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ percent: key, reason, conversionScore: score(key), source, basedOn });
  };

  // Money anchor variants
  if (anchorPercent !== null && anchorPercent > 0) {
    push(anchorPercent * 0.85, `Mais margem que ${formatPercent(anchorPercent)}`, "money", anchorPercent);
    push(anchorPercent, "Alinhado ao desconto em dinheiro", "money", anchorPercent);
    push(anchorPercent * 1.12, `Reforço sobre ${formatPercent(anchorPercent)}`, "money", anchorPercent);
    const round = Math.round(anchorPercent / 5) * 5;
    if (round > 0) push(round, `Número redondo (${round}%)`, "money", anchorPercent);
  }

  // Custom percent variants
  anchorPercents.forEach((a) => {
    if (a <= 0) return;
    push(a * 0.9, `Variação suave de ${formatPercent(a)}`, "custom", a);
    push(a, "Alinhado à porcentagem personalizada", "custom", a);
    push(a * 1.1, `Reforço sobre ${formatPercent(a)}`, "custom", a);
  });

  // Default fallback
  if (out.length === 0) {
    return [
      { percent: 12.5, reason: "Sutil, preserva margem", conversionScore: 55, source: "auto" },
      { percent: 22, reason: "Atrativo sem alarme", conversionScore: 72, source: "auto" },
      { percent: 37.5, reason: "Forte gatilho de compra", conversionScore: 85, source: "auto" },
      { percent: 49, reason: "Quase metade — alto apelo", conversionScore: 88, source: "auto" },
      { percent: 62, reason: "Agressivo, fecha rápido", conversionScore: 78, source: "auto" },
    ];
  }

  return out.sort((a, b) => b.conversionScore - a.conversionScore).slice(0, 6);
}

export function SmartSuggestions({ finalPrice, gap, anchorAmount, anchorPercents }: Props) {
  const anchorPercent = useMemo(() => {
    if (gap <= 0 || anchorAmount <= 0) return null;
    return (anchorAmount / gap) * 100;
  }, [anchorAmount, gap]);

  const suggestions = useMemo(
    () => buildSuggestions(anchorPercent, anchorPercents),
    [anchorPercent, anchorPercents],
  );

  const ready = gap > 0 && finalPrice > 0;

  return (
    <Card className="border-border/60 shadow-[var(--shadow-card)]">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          Sugestões inteligentes
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {ready
            ? anchorPercent || anchorPercents.length > 0
              ? "Variações otimizadas com base no que você digitou."
              : "Sugestões padrão. Digite um desconto em dinheiro ou porcentagens para personalizar."
            : "Preencha o valor final e o de fábrica para ver sugestões."}
        </p>
        {(anchorPercent || anchorPercents.length > 0) && (
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase tracking-wide">
            {anchorPercent !== null && (
              <span className="flex items-center gap-1 text-source-money">
                <span className="h-1.5 w-1.5 rounded-full bg-source-money" />
                Em dinheiro
              </span>
            )}
            {anchorPercents.length > 0 && (
              <span className="flex items-center gap-1 text-source-custom">
                <span className="h-1.5 w-1.5 rounded-full bg-source-custom" />
                Personalizada
              </span>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {!ready ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Aguardando os parâmetros do produto…
          </p>
        ) : (
          <ul className="space-y-2">
            {suggestions.map((s) => {
              const row = buildDiscountRow(s.percent, finalPrice, gap);
              const level = classifyRisk(s.percent);
              const isCustom = s.source === "custom";
              const isMoney = s.source === "money";
              return (
                <li
                  key={`${s.percent}-${s.source}-${s.basedOn ?? ""}`}
                  className={cn(
                    "rounded-xl border bg-card/60 p-3 transition-colors hover:bg-muted/40 border-l-4",
                    isCustom && "border-l-source-custom border-source-custom/30",
                    isMoney && "border-l-source-money border-source-money/30",
                    !isCustom && !isMoney && "border-l-transparent border-border/60",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "text-lg font-bold tabular-nums",
                          isCustom ? "text-source-custom" : isMoney ? "text-source-money" : "text-foreground",
                        )}
                      >
                        {formatPercent(s.percent)}
                      </span>
                      <RiskBadge level={level} />
                      {(isCustom || isMoney) && (
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
                            isCustom && "bg-source-custom-soft text-source-custom",
                            isMoney && "bg-source-money-soft text-source-money",
                          )}
                        >
                          {isCustom ? "Personalizada" : "Em dinheiro"}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums text-foreground">
                        {formatBRL(row.finalValue)}
                      </p>
                      <p className="text-[11px] text-muted-foreground tabular-nums">
                        −{formatBRL(row.discountValue)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          s.conversionScore >= 75
                            ? "bg-safe"
                            : s.conversionScore >= 50
                            ? "bg-moderate"
                            : "bg-risky",
                        )}
                        style={{ width: `${s.conversionScore}%` }}
                      />
                    </div>
                    <span className="flex items-center gap-1 text-[11px] font-medium tabular-nums text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      {s.conversionScore}%
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">{s.reason}</p>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
