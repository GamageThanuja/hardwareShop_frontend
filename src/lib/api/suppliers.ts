import { apiFetch } from "./client";
import type { ApiResponse, CreateSupplierDto, PagedQuery, PagedResult, SupplierDto, UpdateSupplierDto } from "./types";

function buildQuery(params: PagedQuery & Record<string, unknown> = {}): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function listSuppliers(params: PagedQuery = {}) {
  return apiFetch<ApiResponse<PagedResult<SupplierDto>>>(`/api/v1/Suppliers${buildQuery(params)}`);
}

export function getSupplier(id: string) {
  return apiFetch<ApiResponse<SupplierDto>>(`/api/v1/Suppliers/${id}`);
}

export function createSupplier(data: CreateSupplierDto) {
  return apiFetch<ApiResponse<SupplierDto>>("/api/v1/Suppliers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateSupplier(id: string, data: UpdateSupplierDto) {
  return apiFetch<ApiResponse<SupplierDto>>(`/api/v1/Suppliers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteSupplier(id: string) {
  return apiFetch<void>(`/api/v1/Suppliers/${id}`, { method: "DELETE" });
}
