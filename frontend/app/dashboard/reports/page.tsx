import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportForm } from "@/components/reports/report-form";
import { ReportHistory } from "@/components/reports/report-history";
import { getActiveBusinessId } from "@/lib/active-business";
import { listReports } from "@/lib/api/reports";

export default async function ReportsPage() {
  const businessId = await getActiveBusinessId();
  const reports = await listReports(businessId);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-section-gap">
      <p className="text-headline-sm text-text-dark">Reports</p>

      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Report History</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportHistory reports={reports} />
        </CardContent>
      </Card>
    </div>
  );
}
