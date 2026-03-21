import useAuthStore from "@/store/authStore";
import { paths } from "@universe/api-types";
import createFetchClient, { Middleware } from "openapi-fetch";
import createClient from "openapi-react-query";

const setAuthHeaderMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = useAuthStore.getState().token;

    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }

    return request;
  },

  async onResponse({ response }) {
    if (response.status === 401) {
      useAuthStore.getState().logout();

      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }

    return response;
  },
};

const fetchClient = createFetchClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
});

fetchClient.use(setAuthHeaderMiddleware);

const api = createClient(fetchClient);

export default api;
