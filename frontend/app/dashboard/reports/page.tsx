import { FileBarChart2 } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-section-gap">
      <p className="text-headline-sm text-text-dark">Reports</p>
      <ComingSoon
        icon={FileBarChart2}
        title="Generate PDF and Excel reports"
        description="Financial summaries, transaction reports, sales reports, and expense reports -- built from your real records -- are coming in a future update."
        phase="Phase 7"
      />
    </div>
  );
}
