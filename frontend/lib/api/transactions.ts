import { authedBackendFetch } from "@/lib/backend";
import type { TransactionPage, TransactionType } from "@/types/transaction";

export async function listTransactions(
  businessId: string,
  params: {
    type?: TransactionType;
    page?: number;
    pageSize?: number;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}
): Promise<TransactionPage> {
  const query = new URLSearchParams();
  if (params.type) query.set("type", params.type);
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("page_size", String(params.pageSize));
  if (params.search) query.set("search", params.search);
  if (params.dateFrom) query.set("date_from", params.dateFrom);
  if (params.dateTo) query.set("date_to", params.dateTo);

  const res = await authedBackendFetch(`/businesses/${businessId}/transactions?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to load transactions.");
  return res.json();
}
