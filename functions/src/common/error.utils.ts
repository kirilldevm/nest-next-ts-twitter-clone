import { BadRequestException, ConflictException } from '@nestjs/common';

export function isFirebaseAuthError(
  err: unknown,
): err is Error & { code: string } {
  return (
    err instanceof Error &&
    'code' in err &&
    typeof (err as { code: unknown }).code === 'string'
  );
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

const FIREBASE_AUTH_ERROR_MAP: Record<string, () => never> = {
  'auth/email-already-exists': () => {
    throw new ConflictException('The email address is already in use');
  },
  'auth/invalid-photo-url': () => {
    throw new BadRequestException('Profile image must be a valid URL');
  },
  'auth/user-not-found': () => {
    throw new BadRequestException('No account found with this email');
  },
};

/**
 * Maps known Firebase Auth error codes to NestJS exceptions.
 * Rethrows unknown errors as-is.
 */
export function handleFirebaseAuthError(err: unknown): never {
  if (isFirebaseAuthError(err)) {
    FIREBASE_AUTH_ERROR_MAP[err.code]?.();
  }
  throw err;
}
