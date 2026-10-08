import { create } from "zustand";
import type { AsriUser, AuthStatus } from "../types/auth";
import { loginUser } from "../services/api/auth";
import {
  clearStoredCredentials,
  getStoredCredentials,
  setStoredCredentials,
} from "../utils/localStorage";

type UserState = {
  status: AuthStatus;
  user: AsriUser | null;
  initialize: () => Promise<void>;
  login: (phone: string, password: string, persist?: boolean) => Promise<AsriUser>;
  register: (name: string, phone: string, password: string) => Promise<AsriUser>;
  logout: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  status: "UNKNOWN",
  user: null,

  initialize: async () => {
    const stored = getStoredCredentials();

    if (!stored) {
      set({ status: "UNAUTHENTICATED", user: null });
      return;
    }

    try {
      const result = await loginUser({
        phone: stored.phone,
        password: stored.password,
      });
      set({ status: "AUTHENTICATED", user: result.user });
    } catch {
      clearStoredCredentials();
      set({ status: "UNAUTHENTICATED", user: null });
    }
  },

  login: async (phone, password, persist = true) => {
    const result = await loginUser({ phone, password });

    if (persist) {
      const existing = getStoredCredentials();
      setStoredCredentials({
        name: result.user.name,
        phone,
        password,
      });
      if (!existing || existing.phone !== phone || existing.name !== result.user.name) {
        // The stored record is intentionally replaced with the latest successful login.
      }
    }

    set({ status: "AUTHENTICATED", user: result.user });
    return result.user;
  },

  register: async (name, phone, password) => {
    const result = await loginUser({ phone, password });
    setStoredCredentials({
      name: result.user.name || name,
      phone,
      password,
    });
    set({ status: "AUTHENTICATED", user: result.user });
    return result.user;
  },

  logout: () => {
    clearStoredCredentials();
    set({ status: "UNAUTHENTICATED", user: null });
  },
}));
