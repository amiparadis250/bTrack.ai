import { TransactionsPage } from "@/components/transactions/transactions-page";

export default function IncomeTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return <TransactionsPage title="Income" type="income" searchParams={searchParams} />;
}
