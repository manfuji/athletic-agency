import "server-only";

import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { cookies, headers } from "next/headers";

const fallbackBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  `http://localhost:${process.env.PORT || 3000}`;

const axiosClient: AxiosInstance = axios.create({
  // Base URL is set dynamically per request (see interceptor) so dev port changes
  // (e.g. 3000 -> 3001) don't break internal API calls.
  //   withCredentials: true,
  //   withXSRFToken: true,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
  },
});

function setHeader(
  config: InternalAxiosRequestConfig,
  key: string,
  value: string
) {
  if (!config.headers) {
    config.headers = new AxiosHeaders();
  }
  if (config.headers instanceof AxiosHeaders) {
    config.headers.set(key, value);
    return;
  }
  (config.headers as Record<string, string>)[key] = value;
}

async function getCookieHeader(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const serialized = cookieStore
      .getAll()
      .map(({ name, value }) => `${name}=${value}`)
      .join("; ");
    return serialized;
  } catch {
    // Can happen in contexts with no request-bound async storage.
    return "";
  }
}

async function getRequestOrigin(): Promise<string> {
  try {
    const h = await headers();
    const host =
      h.get("x-forwarded-host") || h.get("host") || new URL(fallbackBaseUrl).host;
    const proto =
      h.get("x-forwarded-proto") ||
      (host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https");
    return `${proto}://${host}`;
  } catch {
    return fallbackBaseUrl;
  }
}

axiosClient.interceptors.request.use(async (config) => {
  // Axios in Node needs an absolute URL; in Next server contexts we can derive the
  // current origin (including the dev port) from request headers.
  const url = config.url || "";
  const isAbsolute = /^https?:\/\//i.test(url);
  if (!isAbsolute && !config.baseURL) {
    config.baseURL = await getRequestOrigin();
  }

  // Internal BFF requests are authenticated by Supabase cookies.
  const cookieHeader = await getCookieHeader();
  if (cookieHeader) {
    setHeader(config, "Cookie", cookieHeader);
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      // 401/403 are expected when user isn't authenticated yet; don't spam logs.
      if (status !== 401 && status !== 403) {
        console.error("Error in API request:", {
          message: error.message,
          code: error.code,
          method: error.config?.method,
          url: error.config?.url,
          status,
          data: error.response?.data ?? null,
        });
      }
    } else {
      console.error("Non-Axios error in API request:", error);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
