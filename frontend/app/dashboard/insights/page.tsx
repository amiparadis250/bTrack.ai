import { Lightbulb } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export default function InsightsPage() {
  return (
    <div className="flex flex-col gap-section-gap">
      <p className="text-headline-sm text-text-dark">Insights</p>
      <ComingSoon
        icon={Lightbulb}
        title="AI-generated observations about your business"
        description="bTrack AI will proactively surface things worth noticing -- sales growth, rising expense categories, spending concentration -- grounded in your own data."
        phase="Phase 9"
      />
    </div>
  );
}
