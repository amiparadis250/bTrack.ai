import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { getActiveBusinessId } from "@/lib/active-business";
import { getBusiness } from "@/lib/api/businesses";
import { listCategories } from "@/lib/api/categories";
import { listTransactions } from "@/lib/api/transactions";
import type { TransactionType } from "@/types/transaction";

export async function TransactionsPage({
  title,
  type,
  searchParams,
}: {
  title: string;
  type?: TransactionType;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const businessId = await getActiveBusinessId();

  const [business, categories, page] = await Promise.all([
    getBusiness(businessId),
    listCategories(businessId),
    listTransactions(businessId, {
      type,
      search: params.q,
      dateFrom: params.date_from,
      dateTo: params.date_to,
      pageSize: 100,
    }),
  ]);

  const categoryNames = Object.fromEntries(categories.map((category) => [category.id, category.name]));
  const filteredByCategory = params.category_id
    ? page.items.filter((item) => item.category_id === params.category_id)
    : page.items;

  return (
    <div className="flex flex-col gap-section-gap">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-headline-sm text-text-dark">{title}</p>
        <Link
          href={`/dashboard/transactions/new?type=${type ?? "expense"}`}
          className={buttonVariants()}
        >
          <Plus className="size-4" />
          Add Transaction
        </Link>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-5">
          <TransactionFilters categories={categories} />
          <TransactionTable transactions={filteredByCategory} categoryNames={categoryNames} currency={business.currency} />
        </CardContent>
      </Card>
    </div>
  );
}
