import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "cn";
import { formatMoney, formatPercent } from "@/lib/format";

export function KpiCard({
  label,
  amount,
  currency,
  deltaPercent,
  upIsGood = true,
}: {
  label: string;
  amount: string;
  currency: string;
  /** Percent change vs the prior period, already signed; null when there's no baseline to compare against. */
  deltaPercent: number | null;
  /** Whether an increase counts as good news for this metric (true for revenue/profit, false for expenses). */
  upIsGood?: boolean;
}) {
  const isUp = (deltaPercent ?? 0) >= 0;
  const isGood = isUp === upIsGood;

  return (
    <Card>
      <CardContent className="flex flex-col gap-1.5">
        <p className="text-body-sm text-text-muted">{label}</p>
        <p className="text-headline-md text-text-dark">{formatMoney(amount, currency)}</p>
        {deltaPercent !== null ? (
          <span
            className={cn(
              "inline-flex w-fit items-center gap-1 text-caption font-semibold",
              isGood ? "text-success" : "text-destructive"
            )}
          >
            {isUp ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
            {formatPercent(Math.abs(deltaPercent))}
          </span>
        ) : (
          <span className="text-caption text-text-muted">No prior period to compare</span>
        )}
      </CardContent>
    </Card>
  );
}
