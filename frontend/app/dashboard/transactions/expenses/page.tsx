import { TransactionsPage } from "@/components/transactions/transactions-page";

export default function ExpenseTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return <TransactionsPage title="Expenses" type="expense" searchParams={searchParams} />;
}
