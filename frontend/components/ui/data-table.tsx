"use client"

import * as React from "react"
import {
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  metaHelper,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_text,
  tableFeatures,
  useTable,
  type ColumnDef,
  type RowData,
  type SortingState,
} from "@tanstack/react-table"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type DataTableColumnMeta = {
  headerClassName?: string
  cellClassName?: string
}

// One feature set for every table in the app: pagination, opt-in sorting, typed column meta.
export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text, basic: sortFn_basic },
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  columnMeta: metaHelper<DataTableColumnMeta>(),
})

export type DataTableFeatures = typeof dataTableFeatures
// `any` matches what helper.columns() returns, so columns with different value types fit one array.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DataTableColumn<TData extends RowData> = ColumnDef<DataTableFeatures, TData, any>

/** Column helper bound to the shared feature set. */
export function createDataTableColumns<TData extends RowData>() {
  return createColumnHelper<DataTableFeatures, TData>()
}

export const DEFAULT_PAGE_SIZE = 10

export function DataTable<TData extends RowData>({
  data,
  columns,
  getRowId,
  pageSize = DEFAULT_PAGE_SIZE,
  noun = "rows",
  emptyMessage = "No results.",
  onRowClick,
  rowClassName,
  headerRowClassName,
  footer,
  renderCard,
  mobileFooter,
  sortable = false,
  initialSorting,
}: {
  /** Keep this reference stable (memoize filtered arrays) -- a new array resets to page 1. */
  data: TData[]
  columns: DataTableColumn<TData>[]
  getRowId?: (row: TData) => string
  pageSize?: number
  /** Plural label in the pagination summary, e.g. "deliveries". */
  noun?: string
  emptyMessage?: React.ReactNode
  onRowClick?: (row: TData) => void
  rowClassName?: string
  headerRowClassName?: string
  /** Rows rendered inside <tfoot> on md and up. */
  footer?: React.ReactNode
  /** Phone layout: one card per row on the current page. Without it the table is shown at every width. */
  renderCard?: (row: TData) => React.ReactNode
  /** Rendered as the last item of the phone card list. */
  mobileFooter?: React.ReactNode
  /**
   * Click a header to sort by that column. Only data (accessor) columns sort;
   * empty values (return undefined from the accessor) always go last.
   */
  sortable?: boolean
  initialSorting?: SortingState
}) {
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    getRowId: getRowId ? (row) => getRowId(row) : undefined,
    enableSorting: sortable,
    enableSortingRemoval: false,
    defaultColumn: { sortUndefined: "last" },
    initialState: { pagination: { pageIndex: 0, pageSize }, sorting: initialSorting ?? [] },
  })

  const rows = table.getRowModel().rows

  return (
    <div className="flex flex-col gap-3">
      {/* Total count, not rows.length: after a filter the page index resets a tick later */}
      {table.getRowCount() === 0 ? (
        <p className="py-10 text-center text-sm font-medium text-text-muted">{emptyMessage}</p>
      ) : (
        <>
          <div className={cn(renderCard && "hidden md:block")}>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((group) => (
                  <TableRow key={group.id} className={cn("hover:bg-transparent", headerRowClassName)}>
                    {group.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className={header.column.columnDef.meta?.headerClassName}
                        aria-sort={
                          header.column.getIsSorted() === "asc"
                            ? "ascending"
                            : header.column.getIsSorted() === "desc"
                              ? "descending"
                              : undefined
                        }
                      >
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className="-mx-1 inline-flex items-center gap-1 rounded px-1 outline-none hover:text-text-dark focus-visible:ring-2 focus-visible:ring-primary/40"
                          >
                            <table.FlexRender header={header} />
                            {header.column.getIsSorted() === "asc" ? (
                              <ArrowUp className="size-3" />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <ArrowDown className="size-3" />
                            ) : (
                              <ArrowUpDown className="size-3 opacity-40" />
                            )}
                          </button>
                        ) : (
                          <table.FlexRender header={header} />
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                    className={cn(onRowClick && "cursor-pointer", rowClassName)}
                  >
                    {row.getAllCells().map((cell) => (
                      <TableCell key={cell.id} className={cell.column.columnDef.meta?.cellClassName}>
                        <table.FlexRender cell={cell} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
              {footer ? <TableFooter className="bg-transparent">{footer}</TableFooter> : null}
            </Table>
          </div>

          {renderCard ? (
            <ul className="flex flex-col gap-2.5 md:hidden">
              {rows.map((row) => (
                <li key={row.id}>{renderCard(row.original)}</li>
              ))}
              {mobileFooter ? <li>{mobileFooter}</li> : null}
            </ul>
          ) : null}
        </>
      )}

      <DataTablePagination
        pageIndex={table.state.pagination.pageIndex}
        pageSize={table.state.pagination.pageSize}
        pageCount={table.getPageCount()}
        rowCount={table.getRowCount()}
        noun={noun}
        onPageChange={(index) => table.setPageIndex(index)}
        onPageSizeChange={(size) => table.setPageSize(size)}
      />
    </div>
  )
}

const PAGE_SIZE_OPTIONS = [10, 20, 50]

/** Zero-based page indexes to show, with "gap" where pages are skipped: 1 … 4 5 6 … 12 */
function pageItems(current: number, count: number): (number | "gap")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i)
  const from = Math.max(1, Math.min(current - 1, count - 4))
  const to = Math.min(count - 2, Math.max(current + 1, 3))
  return [
    0,
    ...(from > 1 ? ["gap" as const] : []),
    ...Array.from({ length: to - from + 1 }, (_, i) => from + i),
    ...(to < count - 2 ? ["gap" as const] : []),
    count - 1,
  ]
}

// Disabled buttons keep a solid border and readable (muted) text instead of fading to 50%.
const NAV_BUTTON =
  "h-8 gap-1 rounded-full border-border px-3 text-xs font-semibold text-text-dark hover:bg-chip-surface disabled:opacity-100 disabled:bg-transparent disabled:text-text-muted"

function DataTablePagination({
  pageIndex,
  pageSize,
  pageCount,
  rowCount,
  noun,
  onPageChange,
  onPageSizeChange,
}: {
  pageIndex: number
  pageSize: number
  pageCount: number
  rowCount: number
  noun: string
  onPageChange: (pageIndex: number) => void
  onPageSizeChange: (pageSize: number) => void
}) {
  const pages = Math.max(pageCount, 1)
  const current = Math.min(pageIndex, pages - 1)
  const first = rowCount === 0 ? 0 : current * pageSize + 1
  const last = Math.min((current + 1) * pageSize, rowCount)
  const sizeOptions = PAGE_SIZE_OPTIONS.includes(pageSize)
    ? PAGE_SIZE_OPTIONS
    : [...PAGE_SIZE_OPTIONS, pageSize].sort((a, b) => a - b)

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-3 border-t border-border pt-3 text-xs font-medium text-text-muted sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span>
          Showing <span className="font-semibold text-text-dark">{first}–{last}</span> of{" "}
          <span className="font-semibold text-text-dark">{rowCount}</span> {noun}
        </span>
        <label className="flex items-center gap-2">
          Rows per page
          <span className="relative inline-flex">
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-7 w-20 cursor-pointer appearance-none rounded-full border border-primary/40 bg-on-primary-container pr-7 pl-3.5 text-xs font-semibold text-primary-deep outline-none transition-colors hover:bg-primary/20 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              {sizeOptions.map((size) => (
                <option key={size} value={size} className="bg-surface text-text-dark">
                  {size}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-primary-deep" />
          </span>
        </label>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(0)}
          disabled={current === 0}
          aria-label="First page"
          className={cn(NAV_BUTTON, "hidden px-2 sm:inline-flex")}
        >
          <ChevronsLeft className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(current - 1)}
          disabled={current === 0}
          aria-label="Previous page"
          className={NAV_BUTTON}
        >
          <ChevronLeft className="size-3.5" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {pageItems(current, pages).map((item, i) =>
          item === "gap" ? (
            <span key={`gap-${i}`} className="px-1 text-text-muted">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-label={`Page ${item + 1}`}
              aria-current={item === current ? "page" : undefined}
              className={cn(
                "inline-flex size-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                item === current
                  ? "border-primary bg-primary text-on-primary"
                  : "border-border text-text-dark hover:bg-chip-surface"
              )}
            >
              {item + 1}
            </button>
          )
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(current + 1)}
          disabled={current >= pages - 1}
          aria-label="Next page"
          className={NAV_BUTTON}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pages - 1)}
          disabled={current >= pages - 1}
          aria-label="Last page"
          className={cn(NAV_BUTTON, "hidden px-2 sm:inline-flex")}
        >
          <ChevronsRight className="size-3.5" />
        </Button>
      </div>
    </nav>
  )
}
