import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings2 } from "lucide-react";

export interface CalculatorInputs {
  finalPrice: number;
  factoryPrice: number;
  perColumn: number;
}

interface Props {
  values: CalculatorInputs;
  onChange: (next: CalculatorInputs) => void;
}

const fields: { key: "finalPrice" | "factoryPrice"; label: string; suffix?: string; placeholder: string; step?: string }[] = [
  { key: "finalPrice", label: "Valor final do produto", suffix: "R$", placeholder: "0" },
  { key: "factoryPrice", label: "Valor de fábrica", suffix: "R$", placeholder: "0" },
];

export function InputsCard({ values, onChange }: Props) {
  const update = (key: keyof CalculatorInputs, raw: string) => {
    const num = raw === "" ? 0 : Number(raw);
    if (Number.isNaN(num)) return;
    onChange({ ...values, [key]: num });
  };

  return (
    <Card className="border-border/60 shadow-[var(--shadow-card)]">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings2 className="h-5 w-5 text-primary" />
          Parâmetros do produto
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {fields.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={f.key} className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {f.label}
              </Label>
              <div className="relative">
                {f.suffix && (
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                    {f.suffix}
                  </span>
                )}
                <Input
                  id={f.key}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={f.step ?? "0.01"}
                  value={values[f.key] === 0 ? "" : values[f.key]}
                  placeholder={f.placeholder}
                  onChange={(e) => update(f.key, e.target.value)}
                  className={f.suffix ? "pl-10 h-11 text-base font-medium tabular-nums" : "h-11 text-base font-medium tabular-nums"}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
