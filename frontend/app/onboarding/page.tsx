"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BUSINESS_TYPES, BUSINESS_TYPE_LABELS, type BusinessType } from "@/types/business";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>("retail");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, business_type: businessType, location, phone, currency: "RWF" }),
      });
      const body = await res.json();

      if (!res.ok || !body.success) {
        setError(body?.error?.message ?? "We couldn't create your business.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="flex w-full max-w-lg flex-col gap-8 rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <div>
          <p className="text-title-lg text-primary">bTrack.ai</p>
          <p className="text-headline-md mt-3 text-text-dark">Welcome to bTrack.ai</p>
          <p className="text-body-md mt-1 text-text-muted">Let&apos;s set up your business.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="text-body-sm">
              Business Name
            </Label>
            <Input
              id="name"
              required
              placeholder="Kigali Fresh Foods"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="business_type" className="text-body-sm">
              Business Type
            </Label>
            <Select
              items={BUSINESS_TYPE_LABELS}
              value={businessType}
              onValueChange={(value) => setBusinessType(value as BusinessType)}
            >
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
            <Label htmlFor="location" className="text-body-sm">
              Location
            </Label>
            <Input
              id="location"
              placeholder="Kigali"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="phone" className="text-body-sm">
              Phone
            </Label>
            <Input
              id="phone"
              placeholder="+250 788 123 456"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-body-sm">Currency</Label>
            <Input value="RWF" disabled />
          </div>

          <Button type="submit" disabled={isSubmitting} className="mt-2 h-12 text-base">
            {isSubmitting ? "Creating business..." : "Create Business"}
          </Button>

          {error ? (
            <div className="flex gap-2 rounded-md bg-error/10 p-3">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
              <p className="text-body-sm font-semibold text-destructive">{error}</p>
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}
