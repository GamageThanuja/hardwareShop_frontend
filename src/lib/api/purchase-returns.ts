import { apiFetch } from "./client";
import type {
  ApiResponse,
  CreatePurchaseReturnDto,
  PagedQuery,
  PagedResult,
  PurchaseReturnDto,
} from "./types";

function buildQuery(params: PagedQuery & Record<string, unknown> = {}): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function listPurchaseReturns(params: PagedQuery & { purchaseOrderId?: string } = {}) {
  return apiFetch<ApiResponse<PagedResult<PurchaseReturnDto>>>(`/api/v1/purchase-returns${buildQuery(params)}`);
}

export function getPurchaseReturn(id: string) {
  return apiFetch<ApiResponse<PurchaseReturnDto>>(`/api/v1/purchase-returns/${id}`);
}

export function createPurchaseReturn(data: CreatePurchaseReturnDto) {
  return apiFetch<ApiResponse<PurchaseReturnDto>>("/api/v1/purchase-returns", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function cancelPurchaseReturn(id: string) {
  return apiFetch<ApiResponse<PurchaseReturnDto>>(`/api/v1/purchase-returns/${id}/cancel`, {
    method: "POST",
  });
}
