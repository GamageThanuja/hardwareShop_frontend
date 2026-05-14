import { apiFetch } from "./client";
import type { ApiResponse, PagedQuery, PagedResult, PaymentDto, RecordPaymentDto, VoidPaymentDto } from "./types";

function buildQuery(params: PagedQuery & Record<string, unknown> = {}): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function listPayments(params: PagedQuery & { salesOrderId?: string } = {}) {
  return apiFetch<ApiResponse<PagedResult<PaymentDto>>>(`/api/v1/Payments${buildQuery(params)}`);
}

export function getPayment(id: string) {
  return apiFetch<ApiResponse<PaymentDto>>(`/api/v1/Payments/${id}`);
}

export function recordPayment(data: RecordPaymentDto) {
  return apiFetch<ApiResponse<PaymentDto>>("/api/v1/Payments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function voidPayment(id: string, data: VoidPaymentDto) {
  return apiFetch<ApiResponse<PaymentDto>>(`/api/v1/Payments/${id}/void`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
