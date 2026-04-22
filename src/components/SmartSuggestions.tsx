import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { buildDiscountRow, classifyRisk, formatBRL, formatPercent } from "@/lib/discount";
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
  conversionScore: number; // 0-100, higher = better chance
}

/**
 * Builds smart, "rounded-feel" suggestions around an anchor.
 * Strategy:
 *  - If anchor exists, generate variants slightly below (better seller margin)
 *    and slightly above (better customer perception, higher close chance).
 *  - Snap to psychologically appealing percentages (round numbers, halves).
 *  - Score by closeness to "sweet spot" (~ moderate risk = best close rate).
 */
function buildSuggestions(anchorPercent: number | null, anchorPercents: number[]): Suggestion[] {
  const anchors = new Set<number>();

  if (anchorPercent !== null && anchorPercent > 0) anchors.add(anchorPercent);
  anchorPercents.forEach((p) => p > 0 && anchors.add(p));

  // If no anchors at all, fall back to a curated default set.
  if (anchors.size === 0) {
    return [
      { percent: 12.5, reason: "Sutil, preserva margem", conversionScore: 55 },
      { percent: 22, reason: "Atrativo sem alarme", conversionScore: 72 },
      { percent: 37.5, reason: "Forte gatilho de compra", conversionScore: 85 },
      { percent: 49, reason: "Quase metade — alto apelo", conversionScore: 88 },
      { percent: 62, reason: "Agressivo, fecha rápido", conversionScore: 78 },
    ];
  }

  const out: Suggestion[] = [];
  const seen = new Set<number>();

  const push = (raw: number, reason: string) => {
    const p = Math.max(0.5, Math.min(89.5, +raw.toFixed(1)));
    const key = Math.round(p * 2) / 2; // snap to .5
    if (seen.has(key)) return;
    seen.add(key);
    // Conversion sweet spot ~ 35–55%
    const dist = Math.abs(key - 45);
    const conversionScore = Math.max(20, Math.round(95 - dist * 1.4));
    out.push({ percent: key, reason, conversionScore });
  };

  Array.from(anchors).forEach((a) => {
    // Slightly lower — protege margem
    push(a * 0.85, `Próximo a ${formatPercent(a)} com mais margem`);
    // Anchor itself, snapped
    push(a, "Alinhado ao seu pedido");
    // Slightly higher — aumenta chance de fechar
    push(a * 1.12, `Pequeno reforço sobre ${formatPercent(a)}`);
    // Psychological round number close to anchor
    const round = Math.round(a / 5) * 5;
    if (round > 0) push(round, `Número redondo (${round}%)`);
  });

  // Keep the best 5 by conversion score
  return out.sort((a, b) => b.conversionScore - a.conversionScore).slice(0, 5);
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
              ? "Variações otimizadas com base no que você digitou acima."
              : "Sugestões padrão. Digite um desconto em dinheiro ou porcentagens para personalizar."
            : "Preencha o valor final e o de fábrica para ver sugestões."}
        </p>
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
              return (
                <li
                  key={s.percent}
                  className="rounded-xl border border-border/60 bg-card/60 p-3 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold tabular-nums text-foreground">
                        {formatPercent(s.percent)}
                      </span>
                      <RiskBadge level={level} />
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
