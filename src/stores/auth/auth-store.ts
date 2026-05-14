import { createStore } from "zustand/vanilla";

import type { UserDto } from "@/lib/api/types";

export type AuthState = {
  user: UserDto | null;
  isAuthenticated: boolean;
  setUser: (user: UserDto | null) => void;
  clearAuth: () => void;
};

export const createAuthStore = () =>
  createStore<AuthState>()((set) => ({
    user: null,
    isAuthenticated: false,
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    clearAuth: () => set({ user: null, isAuthenticated: false }),
  }));
