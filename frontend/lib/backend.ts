import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth-cookies";

const BACKEND_URL = process.env.BACKEND_API_URL ?? "https://b-track-ai-uh3p-seven.vercel.app/api/v1";

export function backendFetch(path: string, init?: RequestInit, accessToken?: string) {
  return fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });
}

/** Server Components / Route Handlers only -- reads the httpOnly access-token cookie and calls the backend with it attached. */
export async function authedBackendFetch(path: string, init?: RequestInit) {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  return backendFetch(path, init, accessToken);
}

export interface BackendErrorBody {
  success: false;
  error: { code: string; message: string; details?: unknown };
}

export async function parseBackendError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as BackendErrorBody;
    return body?.error?.message ?? "Something went wrong. Please try again.";
  } catch {
    return "Something went wrong. Please try again.";
  }
}
