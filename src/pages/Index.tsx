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
    perColumn: 5,
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
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="shrink-0 border-b border-border/60 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground shadow-lg"
              style={{ background: "var(--gradient-hero)" }}
            >
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight tracking-tight text-foreground">
                Calculadora de Descontos
              </h1>
              <p className="text-[11px] text-muted-foreground">
                Decisões seguras de venda baseadas no Lucro
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main 3-pane layout */}
      <main className="flex-1 min-h-0 overflow-hidden p-3">
        <div className="grid h-full min-h-0 gap-3 grid-cols-1 lg:grid-cols-12">
          {/* LEFT — inputs & tools */}
          <aside className="lg:col-span-4 xl:col-span-3 flex flex-col gap-3 min-h-0 overflow-y-auto pr-1">
            <InputsCard values={inputs} onChange={setInputs} />
            <MoneyDiscount
              value={moneyValue}
              onChange={setMoneyValue}
              finalPrice={inputs.finalPrice}
              gap={gap}
            />
            <CustomPercents
              value={customValue}
              onChange={setCustomValue}
              onParsed={setCustomGroups}
              finalPrice={inputs.finalPrice}
              gap={gap}
            />
          </aside>

          {/* CENTER — stats + smart suggestions */}
          <section className="lg:col-span-3 xl:col-span-3 flex flex-col gap-3 min-h-0">
            <SummaryStats
              finalPrice={inputs.finalPrice}
              factoryPrice={inputs.factoryPrice}
              gap={gap}
              gapPercent={gapPercent}
            />
            <div className="flex-1 min-h-0 overflow-y-auto">
              <SmartSuggestions
                finalPrice={inputs.finalPrice}
                gap={gap}
                anchorAmount={moneyValue === "" ? 0 : Number(moneyValue) || 0}
                anchorPercents={customValue
                  .split(/[,;\s]+/)
                  .map((s) => Number(s.replace("%", "").replace(",", ".").trim()))
                  .filter((n) => !Number.isNaN(n) && n > 0)}
              />
            </div>
          </section>

          {/* RIGHT — discount range columns */}
          <section className="lg:col-span-5 xl:col-span-6 flex flex-col gap-2 min-h-0">
            <div className="flex items-center justify-between gap-3 px-1">
              <div>
                <h2 className="text-sm font-bold tracking-tight text-foreground">
                  Faixas de desconto
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Sobre o Lucro de {gap > 0 ? `R$ ${gap.toLocaleString("pt-BR")}` : "—"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="perColumn"
                  className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap"
                >
                  Por coluna
                </Label>
                <Input
                  id="perColumn"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={20}
                  step="1"
                  value={inputs.perColumn === 0 ? "" : inputs.perColumn}
                  placeholder="5"
                  onChange={(e) => updatePerColumn(e.target.value)}
                  className="h-8 w-16 text-sm font-medium tabular-nums"
                />
              </div>
            </div>

            <div className="grid flex-1 min-h-0 grid-cols-1 gap-2 md:grid-cols-3">
              <DiscountColumn variant="safe" title="Seguro" range="0–30%" rows={columns.safe} />
              <DiscountColumn variant="moderate" title="Moderado" range="30–60%" rows={columns.moderate} />
              <DiscountColumn variant="risky" title="Arriscado" range="60–90%" rows={columns.risky} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Index;
