import { paths } from "@universe/api-types";
import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";

const fetchClient = createFetchClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
});

const api = createClient(fetchClient);

export default api;
