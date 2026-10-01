import Link from "next/link";
import { Receipt, UploadCloud } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function DashboardEmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-icon-chip text-primary">
        <Receipt className="size-6" />
      </span>
      <div>
        <p className="text-title-md text-text-dark">Welcome to bTrack.ai</p>
        <p className="text-body-md mt-1 max-w-sm text-text-muted">
          You haven&apos;t recorded any transactions yet. Start tracking your finances to see your business
          performance here.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/dashboard/transactions" className={buttonVariants({ size: "lg" })}>
          <Receipt className="size-4" />
          Add Transaction
        </Link>
        <Link href="/dashboard/imports" className={buttonVariants({ variant: "outline", size: "lg" })}>
          <UploadCloud className="size-4" />
          Import Transactions
        </Link>
      </div>
    </div>
  );
}
