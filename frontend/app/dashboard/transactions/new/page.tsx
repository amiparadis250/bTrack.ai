import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { getActiveBusinessId } from "@/lib/active-business";
import { listCategories } from "@/lib/api/categories";

export default async function NewTransactionPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; from?: string }>;
}) {
  const { type, from } = await searchParams;
  const businessId = await getActiveBusinessId();
  const categories = await listCategories(businessId);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-section-gap">
      <Card>
        <CardHeader>
          <CardTitle>Add Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionForm
            categories={categories}
            defaultType={type === "income" || type === "sale" ? type : "expense"}
            returnTo={from ?? "/dashboard/transactions"}
          />
        </CardContent>
      </Card>
    </div>
  );
}
