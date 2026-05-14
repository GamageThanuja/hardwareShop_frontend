import { apiFetch } from "./client";
import type { ApiResponse, CreateCustomerDto, CustomerDto, PagedQuery, PagedResult, UpdateCustomerDto } from "./types";

function buildQuery(params: PagedQuery & Record<string, unknown> = {}): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function listCustomers(params: PagedQuery = {}) {
  return apiFetch<ApiResponse<PagedResult<CustomerDto>>>(`/api/v1/Customers${buildQuery(params)}`);
}

export function getCustomer(id: string) {
  return apiFetch<ApiResponse<CustomerDto>>(`/api/v1/Customers/${id}`);
}

export function createCustomer(data: CreateCustomerDto) {
  return apiFetch<ApiResponse<CustomerDto>>("/api/v1/Customers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCustomer(id: string, data: UpdateCustomerDto) {
  return apiFetch<ApiResponse<CustomerDto>>(`/api/v1/Customers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteCustomer(id: string) {
  return apiFetch<void>(`/api/v1/Customers/${id}`, { method: "DELETE" });
}
