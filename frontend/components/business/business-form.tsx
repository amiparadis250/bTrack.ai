"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BUSINESS_TYPES, BUSINESS_TYPE_LABELS, type Business, type BusinessType } from "@/types/business";

export function BusinessForm({ business }: { business: Business }) {
  const router = useRouter();
  const [name, setName] = useState(business.name);
  const [businessType, setBusinessType] = useState<BusinessType>(business.business_type);
  const [phone, setPhone] = useState(business.phone ?? "");
  const [email, setEmail] = useState(business.email ?? "");
  const [location, setLocation] = useState(business.location ?? "");
  const [description, setDescription] = useState(business.description ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/business/${business.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          business_type: businessType,
          phone,
          email,
          location,
          description,
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        setError(body?.error?.message ?? "We couldn't save your business profile.");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Business Name</Label>
        <Input id="name" required value={name} onChange={(event) => setName(event.target.value)} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="business_type">Business Type</Label>
          <Select value={businessType} onValueChange={(value) => setBusinessType(value as BusinessType)}>
            <SelectTrigger id="business_type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BUSINESS_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {BUSINESS_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" value={business.currency} disabled />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" value={location} onChange={(event) => setLocation(event.target.value)} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" value={description} onChange={(event) => setDescription(event.target.value)} />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        {saved ? (
          <span className="flex items-center gap-1.5 text-body-sm font-semibold text-success">
            <CheckCircle2 className="size-4" />
            Saved
          </span>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {error ? <p className="text-body-sm font-semibold text-destructive">{error}</p> : null}
    </form>
  );
}
