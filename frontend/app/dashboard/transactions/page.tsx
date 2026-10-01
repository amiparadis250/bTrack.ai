import { TransactionsPage } from "@/components/transactions/transactions-page";

export default function AllTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return <TransactionsPage title="All Transactions" searchParams={searchParams} />;
}
