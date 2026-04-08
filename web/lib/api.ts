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

export const downloadAuthenticatedFile = async (
  url: string,
  filename: string,
) => {
  try {
    const token = useAuthStore.getState().token;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Download failed");
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (e) {
    throw e;
  }
};
