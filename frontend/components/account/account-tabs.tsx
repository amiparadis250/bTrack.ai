"use client";

import { Bell, Globe, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BusinessForm } from "@/components/business/business-form";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { ProfileForm } from "@/components/profile/profile-form";
import type { Business } from "@/types/business";
import type { User } from "@/types/auth";

const PREFERENCE_ROWS = [
  {
    icon: Globe,
    title: "Language",
    description: "bTrack.ai currently runs in English. Kinyarwanda support is coming with the AI Assistant.",
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Email and SMS alerts for unusual spending or low cash flow.",
  },
  {
    icon: Shield,
    title: "Security",
    description: "Two-factor authentication and active session management.",
  },
];

export function AccountTabs({ business, user }: { business: Business; user: User }) {
  return (
    <Tabs defaultValue="business">
      <TabsList>
        <TabsTrigger value="business">Business</TabsTrigger>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="preferences">Preferences</TabsTrigger>
      </TabsList>

      <TabsContent value="business" className="pt-5">
        <Card>
          <CardHeader>
            <CardTitle>Business Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <BusinessForm business={business} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="profile" className="flex flex-col gap-5 pt-5">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm user={user} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="preferences" className="flex flex-col gap-5 pt-5">
        {PREFERENCE_ROWS.map((row) => (
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
              <Badge variant="outline">Coming soon</Badge>
            </CardContent>
          </Card>
        ))}
      </TabsContent>
    </Tabs>
  );
}
