import type { LucideIcon } from "lucide-react";

export function ComingSoon({
  icon: Icon,
  title,
  description,
  phase,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  phase: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-icon-chip text-primary">
        <Icon className="size-6" />
      </span>
      <div>
        <p className="text-title-md text-text-dark">{title}</p>
        <p className="text-body-md mt-1 max-w-md text-text-muted">{description}</p>
      </div>
      <span className="text-caption rounded-full bg-chip-surface px-3 py-1 font-semibold text-text-muted">
        Coming in {phase}
      </span>
    </div>
  );
}
