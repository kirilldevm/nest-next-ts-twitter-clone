"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFirebaseAuthError = isFirebaseAuthError;
exports.getErrorMessage = getErrorMessage;
function isFirebaseAuthError(err) {
    return (err instanceof Error &&
        'code' in err &&
        typeof err.code === 'string');
}
function getErrorMessage(error) {
    return error instanceof Error ? error.message : String(error);
}
//# sourceMappingURL=error.utils.js.map