"use client";

import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createDataTableColumns, DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatMoney } from "@/lib/format";
import type { Category } from "@/types/category";
import type { ValidatedRow } from "@/types/import";

const STATUS_BADGE: Record<ValidatedRow["status"], { variant: "default" | "secondary" | "destructive"; icon: typeof CheckCircle2 }> = {
  valid: { variant: "secondary", icon: CheckCircle2 },
  warning: { variant: "default", icon: AlertTriangle },
  invalid: { variant: "destructive", icon: XCircle },
};

const columnHelper = createDataTableColumns<ValidatedRow>();

export function ReviewTable({
  rows,
  categories,
  currency,
  categoryOverrides,
  onCategoryChange,
}: {
  rows: ValidatedRow[];
  categories: Category[];
  currency: string;
  categoryOverrides: Record<number, string>;
  onCategoryChange: (rowNumber: number, categoryId: string) => void;
}) {
  const columns: DataTableColumn<ValidatedRow>[] = [
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const status = info.getValue() as ValidatedRow["status"];
        const { variant, icon: Icon } = STATUS_BADGE[status];
        return (
          <Badge variant={variant} className="gap-1">
            <Icon className="size-3" />
            {status}
          </Badge>
        );
      },
    }),
    columnHelper.accessor("transaction_date", {
      header: "Date",
      cell: (info) => (info.getValue() as string | null) ?? "--",
    }),
    columnHelper.accessor("description", {
      header: "Description",
      cell: (info) => <span className="font-medium text-text-dark">{info.getValue() as string}</span>,
    }),
    columnHelper.accessor("type", {
      header: "Type",
      cell: (info) => <span className="capitalize">{info.getValue() as string}</span>,
    }),
    columnHelper.accessor("amount", {
      header: "Amount",
      cell: (info) => {
        const amount = info.getValue() as string | null;
        return amount ? formatMoney(amount, currency) : "--";
      },
    }),
    columnHelper.display({
      id: "category",
      header: "Category",
      cell: (info) => {
        const row = info.row.original;
        if (row.status === "invalid") return <span className="text-text-muted">--</span>;
        const bucket = row.type === "expense" ? "expense" : "income";
        const options = categories.filter((c) => c.type === bucket);
        const current = categoryOverrides[row.row_number] ?? row.category_id ?? row.suggested_category_id ?? "";
        return (
          <div className="flex flex-col gap-1">
            <Select
              items={Object.fromEntries(options.map((c) => [c.id, c.name]))}
              value={current}
              onValueChange={(value) => onCategoryChange(row.row_number, value ?? "")}
            >
              <SelectTrigger className="h-8 w-40">
                <SelectValue placeholder="Uncategorized" />
              </SelectTrigger>
              <SelectContent>
                {options.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {row.suggested_category_name && !row.category_id ? (
              <span className="text-caption text-text-muted">
                AI suggests: {row.suggested_category_name}
                {row.suggested_category_confidence !== null ? ` (${row.suggested_category_confidence.toFixed(0)}%)` : ""}
              </span>
            ) : null}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "issues",
      header: "Notes",
      cell: (info) => {
        const issues = info.row.original.issues;
        if (issues.length === 0) return null;
        return (
          <ul className="flex flex-col gap-0.5">
            {issues.map((issue) => (
              <li key={issue} className="text-caption text-text-muted">
                {issue}
              </li>
            ))}
          </ul>
        );
      },
    }),
  ];

  return <DataTable data={rows} columns={columns} getRowId={(row) => String(row.row_number)} noun="rows" pageSize={20} />;
}
