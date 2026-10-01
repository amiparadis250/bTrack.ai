import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardEmptyState } from "@/components/dashboard/empty-state";
import { ExpenseBreakdown } from "@/components/dashboard/expense-breakdown";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RecentTransactionsTable } from "@/components/dashboard/recent-transactions-table";
import { RevenueExpenseChart } from "@/components/dashboard/revenue-expense-chart";
import { getActiveBusinessId } from "@/lib/active-business";
import { getBusiness } from "@/lib/api/businesses";
import { getExpenseBreakdown, getOverview, getTrend } from "@/lib/api/analytics";
import { listCategories } from "@/lib/api/categories";
import { listTransactions } from "@/lib/api/transactions";
import { currentMonthRange, percentChange, previousPeriodRange, trailingMonthsRange } from "@/lib/period";

export default async function DashboardPage() {
  const businessId = await getActiveBusinessId();
  const currentRange = currentMonthRange();
  const previousRange = previousPeriodRange(currentRange);
  const trendRange = trailingMonthsRange(6);

  const [business, overview, previousOverview, trend, expenseBreakdown, recent, allTimeCount] = await Promise.all([
    getBusiness(businessId),
    getOverview(businessId, currentRange),
    getOverview(businessId, previousRange),
    getTrend(businessId, trendRange),
    getExpenseBreakdown(businessId, currentRange),
    listTransactions(businessId, { page: 1, pageSize: 5 }),
    listTransactions(businessId, { page: 1, pageSize: 1 }),
  ]);

  if (allTimeCount.total === 0) {
    return <DashboardEmptyState />;
  }

  const categories = await listCategories(businessId);
  const categoryNames = Object.fromEntries(categories.map((category) => [category.id, category.name]));

  const revenueDelta = percentChange(Number(overview.revenue), Number(previousOverview.revenue));
  const expensesDelta = percentChange(Number(overview.expenses), Number(previousOverview.expenses));
  const profitDelta = percentChange(Number(overview.profit), Number(previousOverview.profit));
  const cashFlowDelta = percentChange(Number(overview.net_cash_flow), Number(previousOverview.net_cash_flow));

  return (
    <div className="flex flex-col gap-section-gap">
      <div>
        <p className="text-headline-sm text-text-dark">Good day, {business.name}</p>
        <p className="text-body-md text-text-muted">Here&apos;s how your business is performing this month.</p>
      </div>

      <div className="grid grid-cols-1 gap-gap sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Revenue" amount={overview.revenue} currency={business.currency} deltaPercent={revenueDelta} upIsGood />
        <KpiCard
          label="Expenses"
          amount={overview.expenses}
          currency={business.currency}
          deltaPercent={expensesDelta}
          upIsGood={false}
        />
        <KpiCard label="Profit" amount={overview.profit} currency={business.currency} deltaPercent={profitDelta} upIsGood />
        <KpiCard
          label="Cash Flow"
          amount={overview.net_cash_flow}
          currency={business.currency}
          deltaPercent={cashFlowDelta}
          upIsGood
        />
      </div>

      <div className="grid grid-cols-1 gap-gap xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueExpenseChart data={trend} currency={business.currency} />
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

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentTransactionsTable transactions={recent.items} categoryNames={categoryNames} currency={business.currency} />
        </CardContent>
      </Card>
    </div>
  );
}
