import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InsightList } from "@/components/insights/insight-list";
import { ProjectionCards } from "@/components/insights/projection-cards";
import { TrendProjectionChart } from "@/components/insights/trend-projection-chart";
import { getActiveBusinessId } from "@/lib/active-business";
import { getBusiness } from "@/lib/api/businesses";
import { getProjection, listInsights } from "@/lib/api/insights";

export default async function InsightsPage() {
  const businessId = await getActiveBusinessId();
  const [business, insights, projection] = await Promise.all([
    getBusiness(businessId),
    listInsights(businessId),
    getProjection(businessId),
  ]);

  return (
    <div className="flex flex-col gap-section-gap">
      <div>
        <p className="text-headline-sm text-text-dark">AI Insights</p>
        <p className="text-body-md text-text-muted">
          Proactive observations and a next-month projection, grounded in your own transactions.
        </p>
      </div>

      <ProjectionCards projection={projection} currency={business.currency} />

      {projection.history.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Expenses, with Next-Month Projection</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendProjectionChart projection={projection} currency={business.currency} />
          </CardContent>
        </Card>
      ) : null}

      <div>
        <p className="text-title-md mb-3 text-text-dark">What stands out</p>
        <InsightList insights={insights} />
      </div>
    </div>
  );
}
