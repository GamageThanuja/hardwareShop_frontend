import { apiFetch } from "./client";
import type { ApiResponse, CategoryDto, CreateCategoryDto, PagedQuery, PagedResult, UpdateCategoryDto } from "./types";

function buildQuery(params: PagedQuery & Record<string, unknown> = {}): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function listCategories(params: PagedQuery = {}) {
  return apiFetch<ApiResponse<PagedResult<CategoryDto>>>(`/api/v1/Categories${buildQuery(params)}`);
}

export function getCategory(id: string) {
  return apiFetch<ApiResponse<CategoryDto>>(`/api/v1/Categories/${id}`);
}

export function createCategory(data: CreateCategoryDto) {
  return apiFetch<ApiResponse<CategoryDto>>("/api/v1/Categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCategory(id: string, data: UpdateCategoryDto) {
  return apiFetch<ApiResponse<CategoryDto>>(`/api/v1/Categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteCategory(id: string) {
  return apiFetch<void>(`/api/v1/Categories/${id}`, { method: "DELETE" });
}
