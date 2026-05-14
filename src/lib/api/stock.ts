import { apiFetch } from "./client";
import type {
  ApiResponse,
  CreateInventoryTransactionDto,
  InventoryTransactionDto,
  PagedQuery,
  PagedResult,
  StockItemDto,
  StockTransferResultDto,
  TransferStockDto,
} from "./types";

function buildQuery(params: Record<string, unknown> = {}): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function getStockByProduct(productId: string) {
  return apiFetch<ApiResponse<StockItemDto[]>>(`/api/v1/Stock/product/${productId}`);
}

export function getStockByWarehouse(warehouseId: string, params: PagedQuery = {}) {
  return apiFetch<ApiResponse<PagedResult<StockItemDto>>>(
    `/api/v1/Stock/warehouse/${warehouseId}${buildQuery(params)}`,
  );
}

export function listTransactions(params: PagedQuery & { productId?: string; warehouseId?: string } = {}) {
  return apiFetch<ApiResponse<PagedResult<InventoryTransactionDto>>>(`/api/v1/Stock/transactions${buildQuery(params)}`);
}

export function createTransaction(data: CreateInventoryTransactionDto) {
  return apiFetch<ApiResponse<InventoryTransactionDto>>("/api/v1/Stock/transactions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function transferStock(data: TransferStockDto) {
  return apiFetch<ApiResponse<StockTransferResultDto>>("/api/v1/Stock/transfer", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
