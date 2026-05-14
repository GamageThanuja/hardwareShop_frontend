import { apiFetch } from "./client";
import type { ApiResponse, ChangePasswordDto, SessionSummaryDto, UpdateMyProfileDto, UserDto } from "./types";

export function getMe() {
  return apiFetch<ApiResponse<UserDto>>("/api/v1/me");
}

export function updateMe(data: UpdateMyProfileDto) {
  return apiFetch<ApiResponse<UserDto>>("/api/v1/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function changePassword(data: ChangePasswordDto) {
  return apiFetch<void>("/api/v1/me/change-password", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function getSessions() {
  return apiFetch<SessionSummaryDto[]>("/api/v1/me/sessions");
}

export function deleteSession(sessionId: string) {
  return apiFetch<void>(`/api/v1/me/sessions/${sessionId}`, { method: "DELETE" });
}
