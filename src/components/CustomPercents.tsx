import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Percent } from "lucide-react";
import { useMemo } from "react";
import { buildDiscountRow, classifyRisk } from "@/lib/discount";
import type { DiscountRow } from "@/lib/discount";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onParsed: (groups: { safe: DiscountRow[]; moderate: DiscountRow[]; risky: DiscountRow[] }) => void;
  finalPrice: number;
  gap: number;
}

export function CustomPercents({ value, onChange, onParsed, finalPrice, gap }: Props) {
  const parsed = useMemo(() => {
    if (!value.trim()) return [];
    return value
      .split(/[,;\s]+/)
      .map((s) => s.replace("%", "").replace(",", ".").trim())
      .filter(Boolean)
      .map((s) => Number(s))
      .filter((n) => !Number.isNaN(n));
  }, [value]);

  useMemo(() => {
    const groups: { safe: DiscountRow[]; moderate: DiscountRow[]; risky: DiscountRow[] } = {
      safe: [],
      moderate: [],
      risky: [],
    };
    parsed.forEach((p) => {
      const level = classifyRisk(p);
      if (level === "out") return;
      groups[level].push(buildDiscountRow(p, finalPrice, gap));
    });
    onParsed(groups);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsed, finalPrice, gap]);

  return (
    <Card className="border-border/60 shadow-[var(--shadow-card)]">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Percent className="h-5 w-5 text-primary" />
          Porcentagens personalizadas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="custom" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Digite as porcentagens separadas por vírgula
          </Label>
          <Input
            id="custom"
            placeholder="ex: 10, 25, 45, 70"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            maxLength={200}
            className="h-11 text-base font-medium tabular-nums"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {parsed.length > 0
            ? `${parsed.length} valor(es) classificados nas colunas abaixo.`
            : "Os valores aparecerão classificados nas colunas de resultado."}
        </p>
      </CardContent>
    </Card>
  );
}
