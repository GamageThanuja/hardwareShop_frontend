import { apiFetch } from "./client";
import type {
  ApiResponse,
  AssignRolesDto,
  CreateUserDto,
  PagedQuery,
  PagedResult,
  UpdateUserDto,
  UserDto,
} from "./types";

function buildQuery(params: PagedQuery & Record<string, unknown> = {}): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function listUsers(params: PagedQuery = {}) {
  return apiFetch<ApiResponse<PagedResult<UserDto>>>(`/api/v1/Users${buildQuery(params)}`);
}

export function getUser(id: string) {
  return apiFetch<ApiResponse<UserDto>>(`/api/v1/Users/${id}`);
}

export function createUser(data: CreateUserDto) {
  return apiFetch<ApiResponse<UserDto>>("/api/v1/Users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateUser(id: string, data: UpdateUserDto) {
  return apiFetch<ApiResponse<UserDto>>(`/api/v1/Users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteUser(id: string) {
  return apiFetch<void>(`/api/v1/Users/${id}`, { method: "DELETE" });
}

export function assignRoles(id: string, data: AssignRolesDto) {
  return apiFetch<ApiResponse<UserDto>>(`/api/v1/Users/${id}/roles`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
