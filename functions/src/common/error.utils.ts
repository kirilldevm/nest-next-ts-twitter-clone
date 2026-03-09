/**
 * Type guard for errors with Firebase auth error codes.
 */
export function isFirebaseAuthError(
  err: unknown,
): err is Error & { code: string } {
  return (
    err instanceof Error &&
    'code' in err &&
    typeof (err as { code: unknown }).code === 'string'
  );
}

/**
 * Safely get error message from unknown error.
 */
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
