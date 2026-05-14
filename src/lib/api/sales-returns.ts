import { apiFetch } from "./client";
import type { ApiResponse, CreateSalesReturnDto, PagedQuery, PagedResult, SalesReturnDto } from "./types";

function buildQuery(params: PagedQuery & Record<string, unknown> = {}): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function listSalesReturns(params: PagedQuery & { salesOrderId?: string } = {}) {
  return apiFetch<ApiResponse<PagedResult<SalesReturnDto>>>(`/api/v1/sales-returns${buildQuery(params)}`);
}

export function getSalesReturn(id: string) {
  return apiFetch<ApiResponse<SalesReturnDto>>(`/api/v1/sales-returns/${id}`);
}

export function createSalesReturn(data: CreateSalesReturnDto) {
  return apiFetch<ApiResponse<SalesReturnDto>>("/api/v1/sales-returns", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function cancelSalesReturn(id: string) {
  return apiFetch<ApiResponse<SalesReturnDto>>(`/api/v1/sales-returns/${id}/cancel`, {
    method: "POST",
  });
}
