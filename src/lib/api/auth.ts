import { apiFetch } from "./client";
import type { ApiResponse, LoginDto, RefreshTokenDto, RegisterDto, TokenResponseDto } from "./types";

export function loginApi(data: LoginDto) {
  return apiFetch<ApiResponse<TokenResponseDto>>("/api/v1/Auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function registerApi(data: RegisterDto) {
  return apiFetch<ApiResponse<TokenResponseDto>>("/api/v1/Auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function refreshTokenApi(data: RefreshTokenDto) {
  return apiFetch<ApiResponse<TokenResponseDto>>("/api/v1/Auth/refresh", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function logoutApi() {
  return apiFetch<void>("/api/v1/Auth/logout", { method: "POST" });
}

export function logoutAllApi() {
  return apiFetch<void>("/api/v1/Auth/logout-all", { method: "POST" });
}
