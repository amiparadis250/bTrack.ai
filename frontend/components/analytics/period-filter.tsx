"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "cn";
import { PERIOD_PRESETS, PERIOD_PRESET_LABELS, type PeriodPreset } from "@/lib/period";

export function PeriodFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activePreset = (searchParams.get("period") as PeriodPreset | null) ?? "month";

  function selectPreset(preset: PeriodPreset) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", preset);
    if (preset !== "custom") {
      params.delete("date_from");
      params.delete("date_to");
    }
    router.push(`?${params.toString()}`);
  }

  function updateCustomDate(key: "date_from" | "date_to", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", "custom");
    params.set(key, value);
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PERIOD_PRESETS.filter((preset) => preset !== "custom").map((preset) => (
        <Button
          key={preset}
          type="button"
          size="sm"
          variant={activePreset === preset ? "default" : "outline"}
          onClick={() => selectPreset(preset)}
        >
          {PERIOD_PRESET_LABELS[preset]}
        </Button>
      ))}

      <div className={cn("flex items-center gap-2", activePreset !== "custom" && "opacity-60")}>
        <Input
          type="date"
          aria-label="From date"
          className="h-8 w-36"
          value={searchParams.get("date_from") ?? ""}
          onChange={(event) => updateCustomDate("date_from", event.target.value)}
        />
        <span className="text-body-sm text-text-muted">to</span>
        <Input
          type="date"
          aria-label="To date"
          className="h-8 w-36"
          value={searchParams.get("date_to") ?? ""}
          onChange={(event) => updateCustomDate("date_to", event.target.value)}
        />
      </div>
    </div>
  );
}
