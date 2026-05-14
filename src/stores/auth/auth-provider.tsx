"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

import { type StoreApi, useStore } from "zustand";

import { getClientCookie } from "@/lib/cookie.client";
import { getMe } from "@/lib/api/me";

import { createAuthStore, type AuthState } from "./auth-store";

const AuthStoreContext = createContext<StoreApi<AuthState> | null>(null);

export const AuthStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [store] = useState(() => createAuthStore());
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const token = getClientCookie("access_token");
    if (!token) return;

    getMe()
      .then((res) => {
        if (res.isSuccess && res.data) {
          store.getState().setUser(res.data);
        }
      })
      .catch(() => {});
  }, [store]);

  return <AuthStoreContext.Provider value={store}>{children}</AuthStoreContext.Provider>;
};

export const useAuthStore = <T,>(selector: (state: AuthState) => T): T => {
  const store = useContext(AuthStoreContext);
  if (!store) throw new Error("Missing AuthStoreProvider");
  return useStore(store, selector);
};
