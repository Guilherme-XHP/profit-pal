export type RiskLevel = "safe" | "moderate" | "risky" | "out";

export function classifyRisk(percent: number): RiskLevel {
  if (percent < 0) return "out";
  if (percent <= 30) return "safe";
  if (percent <= 60) return "moderate";
  if (percent <= 90) return "risky";
  return "out";
}

export const riskMeta: Record<Exclude<RiskLevel, "out">, { label: string; description: string }> = {
  safe: { label: "Seguro", description: "0% – 30% do GAP" },
  moderate: { label: "Moderado", description: "30% – 60% do GAP" },
  risky: { label: "Arriscado", description: "60% – 90% do GAP" },
};

export function formatBRL(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number, fractionDigits = 2): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  })}%`;
}

export interface DiscountRow {
  percent: number;
  discountValue: number;
  finalValue: number;
}

export function buildDiscountRow(percent: number, finalPrice: number, gap: number): DiscountRow {
  const discountValue = gap * (percent / 100);
  return {
    percent,
    discountValue,
    finalValue: finalPrice - discountValue,
  };
}

export function generateRange(start: number, end: number, count: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [start];
  const step = (end - start) / count;
  const values: number[] = [];
  for (let i = 0; i < count; i++) {
    values.push(+(start + step * (i + 1)).toFixed(2));
  }
  // Ensure final value equals end
  values[values.length - 1] = end;
  return values;
}
