export declare function isFirebaseAuthError(err: unknown): err is Error & {
    code: string;
};
export declare function getErrorMessage(error: unknown): string;
