import { apiFetch } from "./client";
import type {
  ApiResponse,
  CreateSalesOrderDto,
  PagedQuery,
  PagedResult,
  SalesOrderDto,
  UpdateSalesOrderStatusDto,
} from "./types";

function buildQuery(params: PagedQuery & Record<string, unknown> = {}): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function listSalesOrders(params: PagedQuery = {}) {
  return apiFetch<ApiResponse<PagedResult<SalesOrderDto>>>(`/api/v1/SalesOrders${buildQuery(params)}`);
}

export function getSalesOrder(id: string) {
  return apiFetch<ApiResponse<SalesOrderDto>>(`/api/v1/SalesOrders/${id}`);
}

export function createSalesOrder(data: CreateSalesOrderDto) {
  return apiFetch<ApiResponse<SalesOrderDto>>("/api/v1/SalesOrders", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteSalesOrder(id: string) {
  return apiFetch<void>(`/api/v1/SalesOrders/${id}`, { method: "DELETE" });
}

export function updateSalesOrderStatus(id: string, data: UpdateSalesOrderStatusDto) {
  return apiFetch<ApiResponse<SalesOrderDto>>(`/api/v1/SalesOrders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
