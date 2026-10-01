import { ImageOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { ProfileForm } from "@/components/profile/profile-form";
import { getCurrentUser } from "@/lib/api/auth";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-section-gap">
      <p className="text-headline-sm text-text-dark">Profile</p>

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

      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 text-body-sm text-text-muted">
            <ImageOff className="size-5" />
            Profile picture uploads are coming in a future update.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
