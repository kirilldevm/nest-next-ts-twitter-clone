import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): Promise<boolean>;
}
export interface ReqUser {
    user: {
        uid: string;
        email: string;
        emailVerified: boolean;
        displayName: string;
        photoURL: string;
        providerId: string;
    };
}
