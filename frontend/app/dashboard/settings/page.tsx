import Link from "next/link";
import { Bell, Globe, Shield, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getActiveBusinessId } from "@/lib/active-business";
import { getBusiness } from "@/lib/api/businesses";

export default async function SettingsPage() {
  const businessId = await getActiveBusinessId();
  const business = await getBusiness(businessId);

  const rows = [
    {
      icon: Globe,
      title: "Language",
      description: "bTrack.ai currently runs in English. Kinyarwanda support is coming with the AI Assistant.",
      status: "Coming soon",
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Email and SMS alerts for unusual spending or low cash flow.",
      status: "Coming soon",
    },
    {
      icon: Shield,
      title: "Security",
      description: "Two-factor authentication and active session management.",
      status: "Coming soon",
    },
  ];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-section-gap">
      <p className="text-headline-sm text-text-dark">Settings</p>

      <Card>
        <CardHeader>
          <CardTitle>Currency</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-icon-chip text-primary">
              <Wallet className="size-5" />
            </span>
            <div>
              <p className="text-body-md font-semibold text-text-dark">{business.currency}</p>
              <p className="text-body-sm text-text-muted">Set from your business profile.</p>
            </div>
          </div>
          <Link href="/dashboard/business" className="text-body-sm font-semibold text-primary hover:underline">
            Edit in My Business
          </Link>
        </CardContent>
      </Card>

      {rows.map((row) => (
        <Card key={row.title}>
          <CardContent className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-chip-surface text-text-muted">
                <row.icon className="size-5" />
              </span>
              <div>
                <p className="text-body-md font-semibold text-text-dark">{row.title}</p>
                <p className="text-body-sm text-text-muted">{row.description}</p>
              </div>
            </div>
            <Badge variant="outline">{row.status}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
