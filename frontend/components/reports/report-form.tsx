"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AlertCircle, FileBarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { currentMonthRange } from "@/lib/period";
import { REPORT_FORMATS, REPORT_TYPES, REPORT_TYPE_LABELS, type ReportFormat, type ReportType } from "@/types/report";

export function ReportForm() {
  const router = useRouter();
  const defaultRange = currentMonthRange();
  const [reportType, setReportType] = useState<ReportType>("financial_summary");
  const [format, setFormat] = useState<ReportFormat>("pdf");
  const [periodStart, setPeriodStart] = useState(defaultRange.from);
  const [periodEnd, setPeriodEnd] = useState(defaultRange.to);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report_type: reportType,
          format,
          period_start: periodStart,
          period_end: periodEnd,
        }),
      });
      const body = await res.json();

      if (!res.ok || !body.success) {
        setError(body?.error?.message ?? "We couldn't generate this report.");
        return;
      }

      const link = document.createElement("a");
      link.href = `/api/reports/${body.data.id}/download`;
      link.click();
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
        <Label htmlFor="report_type">Report Type</Label>
        <Select items={REPORT_TYPE_LABELS} value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
          <SelectTrigger id="report_type" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REPORT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {REPORT_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="period_start">From</Label>
          <Input id="period_start" type="date" required value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="period_end">To</Label>
          <Input id="period_end" type="date" required value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Format</Label>
        <div className="flex gap-4">
          {REPORT_FORMATS.map((value) => (
            <label key={value} className="flex items-center gap-2 text-body-sm text-text-dark">
              <input
                type="radio"
                name="format"
                value={value}
                checked={format === value}
                onChange={() => setFormat(value)}
                className="accent-primary"
              />
              {value === "pdf" ? "PDF" : "Excel"}
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="mt-2 w-fit">
        <FileBarChart2 className="size-4" />
        {isSubmitting ? "Generating..." : "Generate Report"}
      </Button>

      {error ? (
        <div className="flex gap-2 rounded-md bg-error/10 p-3">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <p className="text-body-sm font-semibold text-destructive">{error}</p>
        </div>
      ) : null}
    </form>
  );
}
