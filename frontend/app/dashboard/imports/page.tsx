import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImportHistory } from "@/components/imports/import-history";
import { ImportWizard } from "@/components/imports/import-wizard";
import { getActiveBusinessId } from "@/lib/active-business";
import { getBusiness } from "@/lib/api/businesses";
import { listCategories } from "@/lib/api/categories";
import { listImports } from "@/lib/api/imports";

export default async function ImportDataPage() {
  const businessId = await getActiveBusinessId();
  const [business, categories, files] = await Promise.all([
    getBusiness(businessId),
    listCategories(businessId),
    listImports(businessId),
  ]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-section-gap">
      <p className="text-headline-sm text-text-dark">Import Data</p>

      <Card>
        <CardHeader>
          <CardTitle>Import Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <ImportWizard categories={categories} currency={business.currency} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Import History</CardTitle>
        </CardHeader>
        <CardContent>
          <ImportHistory files={files} />
        </CardContent>
      </Card>
    </div>
  );
}
