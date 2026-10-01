import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BusinessForm } from "@/components/business/business-form";
import { getActiveBusinessId } from "@/lib/active-business";
import { getBusiness } from "@/lib/api/businesses";

export default async function MyBusinessPage() {
  const businessId = await getActiveBusinessId();
  const business = await getBusiness(businessId);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-section-gap">
      <p className="text-headline-sm text-text-dark">My Business</p>
      <Card>
        <CardHeader>
          <CardTitle>Business Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <BusinessForm business={business} />
        </CardContent>
      </Card>
    </div>
  );
}
