import { formatDate } from "@/lib/format";
import type { UploadedFile } from "@/types/import";

export function ImportHistory({ files }: { files: UploadedFile[] }) {
  if (files.length === 0) {
    return <p className="py-6 text-center text-body-sm text-text-muted">No files imported yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {files.map((file) => (
        <li key={file.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <p className="text-body-sm font-semibold text-text-dark">{file.filename}</p>
            <p className="text-caption text-text-muted">Imported {formatDate(file.created_at)}</p>
          </div>
          <span className="text-body-sm text-text-muted">{file.imported_count} transactions</span>
        </li>
      ))}
    </ul>
  );
}
