import { TransactionsPage } from "@/components/transactions/transactions-page";

export default function SalesTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return <TransactionsPage title="Sales" type="sale" searchParams={searchParams} />;
}
