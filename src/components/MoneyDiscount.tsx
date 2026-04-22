import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet } from "lucide-react";
import { classifyRisk, formatBRL, formatPercent } from "@/lib/discount";
import { RiskBadge } from "./RiskBadge";

interface Props {
  value: string;
  onChange: (v: string) => void;
  finalPrice: number;
  gap: number;
}

export function MoneyDiscount({ value, onChange, finalPrice, gap }: Props) {
  const amount = value === "" ? 0 : Number(value);
  const valid = !Number.isNaN(amount) && amount > 0 && gap > 0;
  const percent = valid ? (amount / gap) * 100 : 0;
  const newPrice = valid ? finalPrice - amount : finalPrice;
  const level = valid ? classifyRisk(percent) : "out";

  return (
    <Card className="border-border/60 shadow-[var(--shadow-card)]">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wallet className="h-5 w-5 text-primary" />
          Desconto em dinheiro
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="money" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Valor do desconto
          </Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
              R$
            </span>
            <Input
              id="money"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              placeholder="200"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="h-11 pl-10 text-base font-medium tabular-nums"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border/60 bg-muted/40 p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              % sobre o Lucro
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
              {valid ? formatPercent(percent) : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/40 p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Novo valor
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
              {valid ? formatBRL(newPrice) : "—"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-dashed border-border bg-background px-4 py-3">
          <span className="text-sm text-muted-foreground">Classificação</span>
          <RiskBadge level={level} />
        </div>
      </CardContent>
    </Card>
  );
}
