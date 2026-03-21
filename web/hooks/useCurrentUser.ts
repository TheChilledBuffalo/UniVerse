"use client";

import api from "@/lib/api";
import useAuthStore from "@/store/authStore";
import { useEffect } from "react";

export function useCurrentUser() {
  const setUser = useAuthStore((state) => state.setUser);
  const token = useAuthStore((state) => state.token);

  const query = api.useQuery("get", "/auth/me", {
    enabled: !!token,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (query.data) {
      setUser(query.data);
    }
  }, [query.data, setUser]);

  return query;
}
