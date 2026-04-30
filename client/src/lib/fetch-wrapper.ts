export async function fetchWrapper<T>(
  url: string,
  {
    method = "GET",
    headers = {},
    body = null,
    cacheOptions = {},
  }: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    headers?: HeadersInit;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any;
    cacheOptions?: { cache?: RequestCache; tags?: string[] };
  }
): Promise<T | { error: string }> {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : null,
      cache: cacheOptions?.cache || "no-store", // Default to no-store to always fetch fresh data
      next: cacheOptions?.tags ? { tags: cacheOptions?.tags } : undefined,
    });

    // Check content type before parsing
    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    if (!response.ok) {
      // Try to parse as JSON, but handle HTML error pages
      if (isJson) {
        try {
          const errorData = await response.json();
          return { error: errorData };
        } catch {
          return {
            error: `HTTP ${response.status}: ${response.statusText} (${url})`,
          };
        }
      } else {
        // If it's HTML (error page), return a generic error
        return {
          error: `HTTP ${response.status}: ${response.statusText} (${url})`,
        };
      }
    }

    // Only try to parse as JSON if content-type indicates JSON
    if (isJson) {
      try {
        const data = await response.json();
        return data as T;
      } catch (error) {
        return {
          error: `Failed to parse JSON response: ${(error as Error).message}`,
        };
      }
    } else {
      // If response is not JSON, return error
      return {
        error: `Expected JSON but received ${contentType}`,
      };
    }
  } catch (error) {
    return {
      error: (error as Error).message || "Something went wrong",
    };
  }
}
