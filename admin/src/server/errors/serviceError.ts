export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 400
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

export function toHttpResponse(
  error: unknown,
  jsonError: (message: string, status?: number) => Response
) {
  if (error instanceof ServiceError) {
    return jsonError(error.message, error.statusCode);
  }
  const message =
    error instanceof Error ? error.message : "Internal server error";
  return jsonError(message, 500);
}
