import { formatMoney } from "@/lib/format";
import type { CategoryBreakdownItem } from "@/types/analytics";

const MAX_ROWS = 6;

function foldIntoOther(items: CategoryBreakdownItem[]): CategoryBreakdownItem[] {
  if (items.length <= MAX_ROWS) return items;
  const head = items.slice(0, MAX_ROWS - 1);
  const tail = items.slice(MAX_ROWS - 1);
  const otherTotal = tail.reduce((sum, item) => sum + Number(item.total), 0);
  const otherPercentage = tail.reduce((sum, item) => sum + item.percentage, 0);
  return [
    ...head,
    { category_id: null, category_name: "Other", total: otherTotal.toFixed(2), percentage: otherPercentage },
  ];
}

export function ExpenseBreakdown({ items, currency }: { items: CategoryBreakdownItem[]; currency: string }) {
  if (items.length === 0) {
    return <p className="py-10 text-center text-body-sm text-text-muted">No expenses recorded for this period.</p>;
  }

  const rows = foldIntoOther(items);

  return (
    <ul className="flex flex-col gap-4">
      {rows.map((item) => (
        <li key={item.category_id ?? item.category_name} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-body-sm font-medium text-text-dark">{item.category_name}</span>
            <span className="text-body-sm text-text-muted">
              {formatMoney(item.total, currency)} · {item.percentage.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-chip-surface">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.min(item.percentage, 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
