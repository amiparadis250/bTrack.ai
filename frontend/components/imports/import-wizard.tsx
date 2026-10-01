"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReviewTable } from "@/components/imports/review-table";
import type { Category } from "@/types/category";
import type { AnalyzeResponse, ColumnMapping, ConfirmRow, ValidateResponse } from "@/types/import";
import { MAPPING_FIELDS } from "@/types/import";

type Step = "upload" | "mapping" | "review" | "done";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImportWizard({ categories, currency }: { categories: Category[]; currency: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [fileMeta, setFileMeta] = useState<{ name: string; size: number } | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({
    transaction_date: null,
    description: null,
    amount: null,
    type: null,
    category: null,
    payment_method: null,
  });
  const [validation, setValidation] = useState<ValidateResponse | null>(null);
  const [categoryOverrides, setCategoryOverrides] = useState<Record<number, string>>({});
  const [importedCount, setImportedCount] = useState(0);

  async function handleFileSelected(file: File) {
    setError(null);
    setIsLoading(true);
    setFileMeta({ name: file.name, size: file.size });

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/imports/analyze", { method: "POST", body: formData });
      const body = await res.json();

      if (!res.ok || !body.success) {
        setError(body?.error?.message ?? "We couldn't read this file.");
        setFileMeta(null);
        return;
      }

      setAnalysis(body.data);
      setMapping(body.data.suggested_mapping);
      setStep("mapping");
    } catch {
      setError("Something went wrong reading this file. Please try again.");
      setFileMeta(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleValidate() {
    if (!analysis) return;
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/imports/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: analysis.rows, mapping }),
      });
      const body = await res.json();

      if (!res.ok || !body.success) {
        setError(body?.error?.message ?? "We couldn't validate this file.");
        return;
      }

      setValidation(body.data);
      setStep("review");
    } catch {
      setError("Something went wrong validating this file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConfirm() {
    if (!validation || !analysis) return;
    setError(null);
    setIsLoading(true);

    try {
      const rows: ConfirmRow[] = validation.rows
        .filter((row) => row.status !== "invalid")
        .map((row) => ({
          transaction_date: row.transaction_date as string,
          description: row.description,
          amount: row.amount as string,
          type: row.type,
          payment_method: row.payment_method,
          category_id: categoryOverrides[row.row_number] ?? row.category_id ?? row.suggested_category_id ?? null,
        }));

      const res = await fetch("/api/imports/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: analysis.filename, rows }),
      });
      const body = await res.json();

      if (!res.ok || !body.success) {
        setError(body?.error?.message ?? "We couldn't save these transactions.");
        return;
      }

      setImportedCount(body.data.imported_count);
      setStep("done");
      router.refresh();
    } catch {
      setError("Something went wrong saving these transactions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function reset() {
    setStep("upload");
    setFileMeta(null);
    setAnalysis(null);
    setValidation(null);
    setCategoryOverrides({});
    setError(null);
  }

  if (step === "upload") {
    return (
      <div className="flex flex-col gap-4">
        <div
          className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border p-10 text-center"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) handleFileSelected(file);
          }}
        >
          <UploadCloud className="size-8 text-text-muted" />
          <p className="text-body-md text-text-dark">Drag and drop your file here</p>
          <p className="text-body-sm text-text-muted">or</p>
          <Button type="button" variant="outline" disabled={isLoading} onClick={() => fileInputRef.current?.click()}>
            {isLoading ? "Reading file..." : "Choose File"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelected(file);
            }}
          />
          <p className="text-caption text-text-muted">CSV and Excel files supported</p>
        </div>
        {fileMeta && !analysis ? (
          <p className="text-body-sm text-text-muted">
            {fileMeta.name} &middot; {formatFileSize(fileMeta.size)}
          </p>
        ) : null}
        {error ? (
          <div className="flex gap-2 rounded-md bg-error/10 p-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <p className="text-body-sm font-semibold text-destructive">{error}</p>
          </div>
        ) : null}
      </div>
    );
  }

  if (step === "mapping" && analysis) {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-body-sm text-text-dark">
            {analysis.filename} &middot; {analysis.row_count} rows &middot; {analysis.columns.length} columns detected
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {MAPPING_FIELDS.map((field) => (
            <div key={field.key} className="grid grid-cols-2 items-center gap-4">
              <span className="text-body-sm font-medium text-text-dark">{field.label}</span>
              <Select
                value={mapping[field.key] ?? "none"}
                onValueChange={(value) => setMapping((prev) => ({ ...prev, [field.key]: value === "none" ? null : value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Not mapped --</SelectItem>
                  {analysis.columns.map((column) => (
                    <SelectItem key={column} value={column}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={reset} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleValidate} disabled={isLoading || !mapping.amount || !mapping.transaction_date}>
            {isLoading ? "Validating..." : "Continue"}
          </Button>
        </div>

        {error ? (
          <div className="flex gap-2 rounded-md bg-error/10 p-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <p className="text-body-sm font-semibold text-destructive">{error}</p>
          </div>
        ) : null}
      </div>
    );
  }

  if (step === "review" && validation) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap gap-4">
          <span className="text-body-sm font-semibold text-success">✓ {validation.valid_count} valid transactions</span>
          <span className="text-body-sm font-semibold text-system-yellow">⚠ {validation.warning_count} need review</span>
          <span className="text-body-sm font-semibold text-destructive">✕ {validation.invalid_count} invalid rows</span>
        </div>

        <ReviewTable
          rows={validation.rows}
          categories={categories}
          currency={currency}
          categoryOverrides={categoryOverrides}
          onCategoryChange={(rowNumber, categoryId) => setCategoryOverrides((prev) => ({ ...prev, [rowNumber]: categoryId }))}
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={reset} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={isLoading || validation.valid_count + validation.warning_count === 0}>
            {isLoading ? "Importing..." : `Continue Import (${validation.valid_count + validation.warning_count})`}
          </Button>
        </div>

        {error ? (
          <div className="flex gap-2 rounded-md bg-error/10 p-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <p className="text-body-sm font-semibold text-destructive">{error}</p>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <CheckCircle2 className="size-10 text-success" />
      <p className="text-title-md text-text-dark">Imported {importedCount} transactions</p>
      <Button type="button" onClick={reset}>
        Import Another File
      </Button>
    </div>
  );
}
