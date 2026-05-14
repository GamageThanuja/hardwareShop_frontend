import { serverFetch } from "./client";
import type { ApiResponse, DashboardDto } from "./types";

export function getDashboard() {
  return serverFetch<ApiResponse<DashboardDto>>("/api/v1/Dashboard");
}
