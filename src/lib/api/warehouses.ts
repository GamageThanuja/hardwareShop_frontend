import { apiFetch } from "./client";
import type { ApiResponse, CreateWarehouseDto, PagedQuery, PagedResult, UpdateWarehouseDto, WarehouseDto } from "./types";

function buildQuery(params: PagedQuery & Record<string, unknown> = {}): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function listWarehouses(params: PagedQuery = {}) {
  return apiFetch<ApiResponse<PagedResult<WarehouseDto>>>(`/api/v1/Warehouses${buildQuery(params)}`);
}

export function getWarehouse(id: string) {
  return apiFetch<ApiResponse<WarehouseDto>>(`/api/v1/Warehouses/${id}`);
}

export function createWarehouse(data: CreateWarehouseDto) {
  return apiFetch<ApiResponse<WarehouseDto>>("/api/v1/Warehouses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateWarehouse(id: string, data: UpdateWarehouseDto) {
  return apiFetch<ApiResponse<WarehouseDto>>(`/api/v1/Warehouses/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteWarehouse(id: string) {
  return apiFetch<void>(`/api/v1/Warehouses/${id}`, { method: "DELETE" });
}
