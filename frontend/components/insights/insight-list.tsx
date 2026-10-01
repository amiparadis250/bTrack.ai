import { AlertTriangle, Percent, PieChart, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import type { Insight, InsightType } from "@/types/insight";

const ICONS: Record<InsightType, LucideIcon> = {
  revenue_growth: TrendingUp,
  revenue_decline: TrendingDown,
  expense_increase: AlertTriangle,
  expense_concentration: PieChart,
  margin_change: Percent,
};

const TONES: Record<InsightType, string> = {
  revenue_growth: "bg-success-soft text-success",
  revenue_decline: "bg-destructive/10 text-destructive",
  expense_increase: "bg-destructive/10 text-destructive",
  expense_concentration: "bg-icon-chip text-primary",
  margin_change: "bg-icon-chip text-primary",
};

export function InsightList({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) {
    return (
      <Card>
        <CardContent>
          <p className="text-body-sm text-text-muted">
            Nothing stands out this month yet -- check back as you record more transactions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {insights.map((insight) => {
        const Icon = ICONS[insight.type];
        return (
          <Card key={insight.id}>
            <CardContent className="flex items-start gap-3">
              <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${TONES[insight.type]}`}>
                <Icon className="size-4.5" />
              </span>
              <div className="flex flex-col gap-0.5">
                <p className="text-body-md font-semibold text-text-dark">{insight.title}</p>
                <p className="text-body-sm text-text-muted">{insight.description}</p>
                <p className="text-caption mt-1 text-text-muted">{formatDate(insight.period_end)}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
