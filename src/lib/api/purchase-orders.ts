import { apiFetch } from "./client";
import type {
  ApiResponse,
  CreatePurchaseOrderDto,
  PagedQuery,
  PagedResult,
  PurchaseOrderDto,
  ReceivePurchaseOrderItemDto,
  UpdatePurchaseOrderStatusDto,
} from "./types";

function buildQuery(params: PagedQuery & Record<string, unknown> = {}): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function listPurchaseOrders(params: PagedQuery = {}) {
  return apiFetch<ApiResponse<PagedResult<PurchaseOrderDto>>>(`/api/v1/PurchaseOrders${buildQuery(params)}`);
}

export function getPurchaseOrder(id: string) {
  return apiFetch<ApiResponse<PurchaseOrderDto>>(`/api/v1/PurchaseOrders/${id}`);
}

export function createPurchaseOrder(data: CreatePurchaseOrderDto) {
  return apiFetch<ApiResponse<PurchaseOrderDto>>("/api/v1/PurchaseOrders", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deletePurchaseOrder(id: string) {
  return apiFetch<void>(`/api/v1/PurchaseOrders/${id}`, { method: "DELETE" });
}

export function updatePurchaseOrderStatus(id: string, data: UpdatePurchaseOrderStatusDto) {
  return apiFetch<ApiResponse<PurchaseOrderDto>>(`/api/v1/PurchaseOrders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function receivePurchaseOrder(id: string, items: ReceivePurchaseOrderItemDto[]) {
  return apiFetch<ApiResponse<PurchaseOrderDto>>(`/api/v1/PurchaseOrders/${id}/receive`, {
    method: "POST",
    body: JSON.stringify(items),
  });
}
