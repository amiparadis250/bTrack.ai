"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <AuthBrandPanel />

      <div className="flex items-center justify-center bg-background p-12">
        <div className="flex w-full max-w-lg flex-col gap-8">
          <div className="lg:hidden">
            <p className="text-headline-sm text-text-dark">bTrack.ai</p>
          </div>

          {submitted ? (
            <div>
              <p className="text-headline-lg text-text-dark">Check your email</p>
              <p className="text-body-md mt-2 text-text-muted">
                If an account exists for <span className="font-semibold text-text-dark">{email}</span>, we&apos;ve
                sent instructions to reset your password.
              </p>
            </div>
          ) : (
            <>
              <div>
                <p className="text-headline-lg text-text-dark">Reset your password</p>
                <p className="text-body-md mt-1 text-text-muted">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email" className="text-body-sm">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-text-muted" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="you@yourbusiness.com"
                      className="h-12 pl-11 text-base"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="mt-2 h-12 text-base">
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </>
          )}

          <p className="text-body-sm text-text-muted">
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
