import { getSessionToken } from './session';

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/+$/, '');

export interface FieldError {
  field: string;
  message: string;
}

/** An error response from the API, carrying the server's user-facing message. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details: FieldError[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ErrorBody {
  error?: string;
  details?: FieldError[];
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH';
  body?: unknown;
}

export async function apiRequest<TResponse>(path: string, { method = 'GET', body }: RequestOptions = {}): Promise<TResponse> {
  const token = getSessionToken();
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api${path}`, {
      method,
      headers: {
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the server. It may be waking up — please try again in a few seconds.');
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const errorBody = (payload ?? {}) as ErrorBody;
    throw new ApiError(response.status, errorBody.error ?? `Request failed (${response.status}).`, errorBody.details);
  }
  return payload as TResponse;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}
