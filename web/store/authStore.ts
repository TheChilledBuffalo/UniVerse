import type { components } from "@universe/api-types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = components["schemas"]["MeResponse"];

type AuthStore = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  setToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setToken: (token) => {
        document.cookie = `auth_token=${token}; path=/;`;
        set({
          token,
          isAuthenticated: true,
        });
      },

      setUser: (user) => set({ user }),

      logout: () => {
        document.cookie = "auth_token=; path=/;";
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-store",
    },
  ),
);

export default useAuthStore;
