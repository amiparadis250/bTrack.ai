import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { REPORT_TYPE_LABELS, type Report } from "@/types/report";

export function ReportHistory({ reports }: { reports: Report[] }) {
  if (reports.length === 0) {
    return <p className="py-6 text-center text-body-sm text-text-muted">No reports generated yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {reports.map((report) => (
        <li
          key={report.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
        >
          <div className="flex flex-col gap-0.5">
            <p className="text-body-sm font-semibold text-text-dark">{REPORT_TYPE_LABELS[report.report_type]}</p>
            <p className="text-caption text-text-muted">
              {formatDate(report.period_start)} -- {formatDate(report.period_end)} &middot; Generated{" "}
              {formatDate(report.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="uppercase">
              {report.format}
            </Badge>
            <a href={`/api/reports/${report.id}/download`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Download className="size-3.5" />
              Download
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
