import { AccountTabs } from "@/components/account/account-tabs";
import { getActiveBusinessId } from "@/lib/active-business";
import { getCurrentUser } from "@/lib/api/auth";
import { getBusiness } from "@/lib/api/businesses";

export default async function AccountPage() {
  const businessId = await getActiveBusinessId();
  const [business, user] = await Promise.all([getBusiness(businessId), getCurrentUser()]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-section-gap">
      <p className="text-headline-sm text-text-dark">Account</p>
      <AccountTabs business={business} user={user} />
    </div>
  );
}
