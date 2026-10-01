import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "cn";
import { formatDate, formatMoney } from "@/lib/format";
import { PAYMENT_METHOD_LABELS, TRANSACTION_TYPE_LABELS, type Transaction } from "@/types/transaction";

export function RecentTransactionsTable({
  transactions,
  categoryNames,
  currency,
}: {
  transactions: Transaction[];
  categoryNames: Record<string, string>;
  currency: string;
}) {
  if (transactions.length === 0) {
    return <p className="py-10 text-center text-body-sm text-text-muted">No transactions recorded yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => {
            const isOutflow = transaction.type === "expense";
            return (
              <TableRow key={transaction.id}>
                <TableCell className="text-text-muted">{formatDate(transaction.transaction_date)}</TableCell>
                <TableCell className="font-medium text-text-dark">{transaction.description}</TableCell>
                <TableCell className="text-text-muted">
                  {transaction.category_id ? (categoryNames[transaction.category_id] ?? "Uncategorized") : "Uncategorized"}
                </TableCell>
                <TableCell>
                  <Badge variant={isOutflow ? "destructive" : "secondary"}>
                    {TRANSACTION_TYPE_LABELS[transaction.type]}
                  </Badge>
                </TableCell>
                <TableCell className="text-text-muted">{PAYMENT_METHOD_LABELS[transaction.payment_method]}</TableCell>
                <TableCell className={cn("text-right font-semibold", isOutflow ? "text-destructive" : "text-success")}>
                  {isOutflow ? "-" : "+"}
                  {formatMoney(transaction.amount, currency)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Link href="/dashboard/transactions" className="text-body-sm font-semibold text-primary hover:underline">
        View all transactions
      </Link>
    </div>
  );
}
