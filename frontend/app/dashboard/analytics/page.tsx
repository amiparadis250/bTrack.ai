import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PeriodFilter } from "@/components/analytics/period-filter";
import { ExpenseBreakdown } from "@/components/dashboard/expense-breakdown";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RevenueExpenseChart } from "@/components/dashboard/revenue-expense-chart";
import { getActiveBusinessId } from "@/lib/active-business";
import { getBusiness } from "@/lib/api/businesses";
import { getExpenseBreakdown, getOverview, getTrend } from "@/lib/api/analytics";
import { percentChange, presetRange, previousPeriodRange, trailingMonthsRange, type PeriodPreset } from "@/lib/period";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; date_from?: string; date_to?: string }>;
}) {
  const params = await searchParams;
  const businessId = await getActiveBusinessId();
  const preset = (params.period as PeriodPreset | undefined) ?? "month";
  const range =
    preset === "custom" && params.date_from && params.date_to
      ? { from: params.date_from, to: params.date_to }
      : presetRange(preset);
  const previousRange = previousPeriodRange(range);

  const [business, overview, previousOverview, trend, expenseBreakdown] = await Promise.all([
    getBusiness(businessId),
    getOverview(businessId, range),
    getOverview(businessId, previousRange),
    getTrend(businessId, trailingMonthsRange(6)),
    getExpenseBreakdown(businessId, range),
  ]);

  return (
    <div className="flex flex-col gap-section-gap">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-headline-sm text-text-dark">Analytics</p>
        <PeriodFilter />
      </div>

      <div className="grid grid-cols-1 gap-gap sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Revenue"
          amount={overview.revenue}
          currency={business.currency}
          deltaPercent={percentChange(Number(overview.revenue), Number(previousOverview.revenue))}
          upIsGood
        />
        <KpiCard
          label="Expenses"
          amount={overview.expenses}
          currency={business.currency}
          deltaPercent={percentChange(Number(overview.expenses), Number(previousOverview.expenses))}
          upIsGood={false}
        />
        <KpiCard
          label="Profit"
          amount={overview.profit}
          currency={business.currency}
          deltaPercent={percentChange(Number(overview.profit), Number(previousOverview.profit))}
          upIsGood
        />
        <Card>
          <CardContent className="flex flex-col gap-1.5">
            <p className="text-body-sm text-text-muted">Profit Margin</p>
            <p className="text-headline-md text-text-dark">
              {overview.profit_margin !== null ? `${overview.profit_margin.toFixed(1)}%` : "--"}
            </p>
            <span className="text-caption text-text-muted">{overview.transaction_count} transactions</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-gap xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Revenue vs Expenses (last 6 months)</CardTitle>
          </CardHeader>
          <CardContent>
            {trend.length > 0 ? (
              <RevenueExpenseChart data={trend} currency={business.currency} />
            ) : (
              <p className="py-10 text-center text-body-sm text-text-muted">
                No transactions recorded yet -- add one to see your trend here.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseBreakdown items={expenseBreakdown} currency={business.currency} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
