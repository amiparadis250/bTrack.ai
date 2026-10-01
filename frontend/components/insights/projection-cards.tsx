import { Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";
import type { Projection } from "@/types/insight";

export function ProjectionCards({ projection, currency }: { projection: Projection; currency: string }) {
  if (!projection.has_enough_data) {
    return (
      <Card>
        <CardContent className="flex items-start gap-2.5">
          <Info className="mt-0.5 size-4 shrink-0 text-text-muted" />
          <p className="text-body-sm text-text-muted">
            Record a couple more months of transactions and bTrack AI will project next month&apos;s revenue,
            expenses, and profit here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-gap sm:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col gap-1.5">
            <p className="text-body-sm text-text-muted">Projected Revenue</p>
            <p className="text-headline-md text-text-dark">{formatMoney(projection.projected_revenue, currency)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1.5">
            <p className="text-body-sm text-text-muted">Projected Expenses</p>
            <p className="text-headline-md text-text-dark">{formatMoney(projection.projected_expenses, currency)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1.5">
            <p className="text-body-sm text-text-muted">Projected Profit</p>
            <p className="text-headline-md text-text-dark">{formatMoney(projection.projected_profit, currency)}</p>
          </CardContent>
        </Card>
      </div>
      <p className="flex items-center gap-1.5 text-caption text-text-muted">
        <Info className="size-3.5 shrink-0" />
        Estimate based on your last {projection.based_on_months} months -- a projection, not a guarantee.
      </p>
    </div>
  );
}
