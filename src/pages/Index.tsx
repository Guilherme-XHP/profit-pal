import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InputsCard, type CalculatorInputs } from "@/components/InputsCard";
import { MoneyDiscount } from "@/components/MoneyDiscount";
import { CustomPercents } from "@/components/CustomPercents";
import { DiscountColumn } from "@/components/DiscountColumn";
import { SummaryStats } from "@/components/SummaryStats";
import { SmartSuggestions } from "@/components/SmartSuggestions";
import { buildDiscountRow, generateRange, type DiscountRow } from "@/lib/discount";

const Index = () => {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    finalPrice: 0,
    factoryPrice: 0,
    perColumn: 6,
  });
  const [moneyValue, setMoneyValue] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [customGroups, setCustomGroups] = useState<{
    safe: DiscountRow[];
    moderate: DiscountRow[];
    risky: DiscountRow[];
  }>({ safe: [], moderate: [], risky: [] });

  const gap = Math.max(inputs.finalPrice - inputs.factoryPrice, 0);
  const gapPercent = inputs.factoryPrice > 0 ? (gap / inputs.factoryPrice) * 100 : 0;

  const columns = useMemo(() => {
    const count = Math.max(1, Math.min(20, Math.floor(inputs.perColumn || 1)));
    const make = (start: number, end: number) =>
      generateRange(start, end, count).map((p) => buildDiscountRow(p, inputs.finalPrice, gap));

    const safe = [...make(0.01, 30), ...customGroups.safe].sort((a, b) => a.percent - b.percent);
    const moderate = [...make(30.01, 60), ...customGroups.moderate].sort((a, b) => a.percent - b.percent);
    const risky = [...make(60.01, 90), ...customGroups.risky].sort((a, b) => a.percent - b.percent);
    return { safe, moderate, risky };
  }, [inputs.finalPrice, inputs.perColumn, gap, customGroups]);

  const updatePerColumn = (raw: string) => {
    const num = raw === "" ? 1 : Number(raw);
    if (Number.isNaN(num)) return;
    setInputs({ ...inputs, perColumn: num });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/60 bg-card/50 backdrop-blur-sm">
        <div className="container flex items-center justify-between py-5">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl text-primary-foreground shadow-lg"
              style={{ background: "var(--gradient-hero)" }}
            >
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight tracking-tight text-foreground">
                Calculadora de Descontos
              </h1>
              <p className="text-xs text-muted-foreground">
                Decisões seguras de venda baseadas no GAP
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container space-y-6 py-8">
        {/* Inputs */}
        <InputsCard values={inputs} onChange={setInputs} />

        {/* Stats summary */}
        <SummaryStats
          finalPrice={inputs.finalPrice}
          factoryPrice={inputs.factoryPrice}
          gap={gap}
          gapPercent={gapPercent}
        />

        {/* Money discount — primary helper */}
        <MoneyDiscount
          value={moneyValue}
          onChange={setMoneyValue}
          finalPrice={inputs.finalPrice}
          gap={gap}
        />

        {/* Custom percents */}
        <CustomPercents
          value={customValue}
          onChange={setCustomValue}
          onParsed={setCustomGroups}
          finalPrice={inputs.finalPrice}
          gap={gap}
        />

        {/* Smart suggestions — adapts to money discount + custom percents */}
        <SmartSuggestions
          finalPrice={inputs.finalPrice}
          gap={gap}
          anchorAmount={moneyValue === "" ? 0 : Number(moneyValue) || 0}
          anchorPercents={customValue
            .split(/[,;\s]+/)
            .map((s) => Number(s.replace("%", "").replace(",", ".").trim()))
            .filter((n) => !Number.isNaN(n) && n > 0)}
        />

        {/* Result columns */}
        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Faixas de desconto sugeridas
              </h2>
              <p className="text-sm text-muted-foreground">
                Calculadas sobre o Lucro de {gap > 0 ? `R$ ${gap.toLocaleString("pt-BR")}` : "—"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Label
                htmlFor="perColumn"
                className="text-xs font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap"
              >
                Valores por coluna
              </Label>
              <Input
                id="perColumn"
                type="number"
                inputMode="numeric"
                min={1}
                max={20}
                step="1"
                value={inputs.perColumn === 0 ? "" : inputs.perColumn}
                placeholder="6"
                onChange={(e) => updatePerColumn(e.target.value)}
                className="h-10 w-20 text-base font-medium tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <DiscountColumn variant="safe" title="Seguro" range="0% – 30%" rows={columns.safe} />
            <DiscountColumn variant="moderate" title="Moderado" range="30% – 60%" rows={columns.moderate} />
            <DiscountColumn variant="risky" title="Arriscado" range="60% – 90%" rows={columns.risky} />
          </div>
        </section>

        <footer className="pt-4 text-center text-xs text-muted-foreground">
          Os percentuais são aplicados sobre o Lucro, não sobre o valor de fábrica.
        </footer>
      </main>
    </div>
  );
};

export default Index;
