"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createDataTableColumns, DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { cn } from "cn";
import { formatDate, formatMoney } from "@/lib/format";
import {
  PAYMENT_METHOD_LABELS,
  TRANSACTION_TYPE_LABELS,
  type PaymentMethod,
  type Transaction,
  type TransactionType,
} from "@/types/transaction";

const columnHelper = createDataTableColumns<Transaction>();

export function TransactionTable({
  transactions,
  categoryNames,
  currency,
}: {
  transactions: Transaction[];
  categoryNames: Record<string, string>;
  currency: string;
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this transaction? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  const columns: DataTableColumn<Transaction>[] = [
    columnHelper.accessor("transaction_date", {
      header: "Date",
      cell: (info) => formatDate(info.getValue() as string),
      sortFn: "alphanumeric",
    }),
    columnHelper.accessor("description", {
      header: "Description",
      cell: (info) => <span className="font-medium text-text-dark">{info.getValue() as string}</span>,
      sortFn: "text",
    }),
    columnHelper.accessor((row) => (row.category_id ? categoryNames[row.category_id] : undefined), {
      id: "category",
      header: "Category",
      cell: (info) => (info.getValue() as string | undefined) ?? "Uncategorized",
      sortFn: "text",
    }),
    columnHelper.accessor("type", {
      header: "Type",
      cell: (info) => {
        const type = info.getValue() as TransactionType;
        return <Badge variant={type === "expense" ? "destructive" : "secondary"}>{TRANSACTION_TYPE_LABELS[type]}</Badge>;
      },
      sortFn: "text",
    }),
    columnHelper.accessor("payment_method", {
      header: "Payment Method",
      cell: (info) => PAYMENT_METHOD_LABELS[info.getValue() as PaymentMethod],
      sortFn: "text",
    }),
    columnHelper.accessor("amount", {
      header: "Amount",
      cell: (info) => {
        const row = info.row.original;
        const isOutflow = row.type === "expense";
        return (
          <span className={cn("font-semibold", isOutflow ? "text-destructive" : "text-success")}>
            {isOutflow ? "-" : "+"}
            {formatMoney(row.amount, currency)}
          </span>
        );
      },
      sortFn: "basic",
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: (info) => (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={deletingId === info.row.original.id}
          onClick={() => handleDelete(info.row.original.id)}
          aria-label="Delete transaction"
        >
          <Trash2 className="size-4 text-destructive" />
        </Button>
      ),
    }),
  ];

  return (
    <DataTable
      data={transactions}
      columns={columns}
      getRowId={(row) => row.id}
      noun="transactions"
      sortable
      emptyMessage="No transactions match your filters."
    />
  );
}
