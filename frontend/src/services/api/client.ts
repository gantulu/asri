const baseUrl = (import.meta.env.VITE_EDGE_FUNCTION_URL as string | undefined)?.replace(/\/$/, "");

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (!baseUrl) {
    throw new Error("VITE_EDGE_FUNCTION_URL is not configured");
  }

  const response = await fetch(`${baseUrl}/functions/v1/auth${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
  } & T;

  if (!response.ok) {
    throw new Error(payload.error || `Request failed with status ${response.status}`);
  }

  return payload;
}
