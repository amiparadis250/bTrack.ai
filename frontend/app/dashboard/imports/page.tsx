import { UploadCloud } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export default function ImportDataPage() {
  return (
    <div className="flex flex-col gap-section-gap">
      <p className="text-headline-sm text-text-dark">Import Data</p>
      <ComingSoon
        icon={UploadCloud}
        title="Import your historical transactions"
        description="Upload a CSV or Excel file, map the columns, and let bTrack AI help categorize everything automatically. Until then, you can add transactions manually."
        phase="Phase 5"
      />
    </div>
  );
}
