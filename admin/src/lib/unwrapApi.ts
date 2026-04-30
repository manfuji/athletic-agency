/** Unwrap BFF `{ status: true, data: T }` bodies; pass through legacy shapes. */
export function unwrapApi<T>(axiosData: unknown): T {
  if (
    axiosData &&
    typeof axiosData === "object" &&
    "data" in axiosData &&
    "status" in axiosData
  ) {
    return (axiosData as { data: T }).data;
  }
  return axiosData as T;
}
