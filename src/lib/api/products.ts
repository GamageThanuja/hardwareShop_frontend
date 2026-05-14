import { apiFetch } from "./client";
import type { ApiResponse, CreateProductDto, PagedQuery, PagedResult, ProductDto, UpdateProductDto } from "./types";

function buildQuery(params: PagedQuery & Record<string, unknown> = {}): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function listProducts(params: PagedQuery = {}) {
  return apiFetch<ApiResponse<PagedResult<ProductDto>>>(`/api/v1/Products${buildQuery(params)}`);
}

export function getProduct(id: string) {
  return apiFetch<ApiResponse<ProductDto>>(`/api/v1/Products/${id}`);
}

export function createProduct(data: CreateProductDto) {
  return apiFetch<ApiResponse<ProductDto>>("/api/v1/Products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateProduct(id: string, data: UpdateProductDto) {
  return apiFetch<ApiResponse<ProductDto>>(`/api/v1/Products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteProduct(id: string) {
  return apiFetch<void>(`/api/v1/Products/${id}`, { method: "DELETE" });
}
