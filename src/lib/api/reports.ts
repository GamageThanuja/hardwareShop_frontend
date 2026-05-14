import { apiFetch } from "./client";
import type { ApiResponse, InventoryValuationDto, PagedQuery, PurchaseReportDto, SalesReportDto } from "./types";

function buildQuery(params: Record<string, unknown> = {}): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function getSalesReport(params: { dateFrom?: string; dateTo?: string } = {}) {
  return apiFetch<ApiResponse<SalesReportDto>>(`/api/v1/Reports/sales${buildQuery(params)}`);
}

export function getInventoryReport(params: PagedQuery = {}) {
  return apiFetch<ApiResponse<InventoryValuationDto>>(`/api/v1/Reports/inventory${buildQuery(params)}`);
}

export function getPurchaseReport(params: { dateFrom?: string; dateTo?: string } = {}) {
  return apiFetch<ApiResponse<PurchaseReportDto>>(`/api/v1/Reports/purchases${buildQuery(params)}`);
}
