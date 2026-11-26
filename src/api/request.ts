/** An API error with the message to show the merchant. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    /** Every problem the API found, e.g. all the checks a publish failed. */
    readonly problems: { path: string; message: string }[] = [],
  ) {
    super(message);
  }
}

interface Problem {
  type?: string;
  detail?: string;
  errors?: { path: string; message: string }[];
}

/** Business rules already speak to the merchant; schema errors name the field. */
export function problemText(body: unknown): string {
  const problem = (body ?? {}) as Problem;
  const field = problem.errors?.[0];
  if (problem.type?.endsWith('/validation') && field) {
    return `Check ${field.path || 'the form'}: ${field.message}`;
  }
  return problem.detail ?? 'Something went wrong. Please try again.';
}

/** Returns the response body, or throws ApiError with a readable message. */
export async function unwrap<T>(
  call: Promise<{ data?: unknown; error?: unknown; response: Response }>,
): Promise<T> {
  let result;
  try {
    result = await call;
  } catch {
    throw new ApiError('We could not reach Oyklane Ads. Check your connection and try again.', 0);
  }
  if (!result.response.ok) {
    const problems = (result.error as Problem | undefined)?.errors ?? [];
    throw new ApiError(problemText(result.error), result.response.status, problems);
  }
  return result.data as T;
}

export const errorText = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong. Please try again.';
