"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const admin = __importStar(require("firebase-admin"));
const error_utils_1 = require("../common/error.utils");
const email_service_1 = require("../email/email.service");
const user_repository_1 = require("../user/repository/user.repository");
let AuthService = class AuthService {
    userRepository;
    emailService;
    constructor(userRepository, emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }
    async signup(createUserDto) {
        const { email, password, firstName, lastName, profileImageUrl } = createUserDto;
        const createUserOptions = {
            email,
            password,
            displayName: `${firstName} ${lastName}`,
        };
        const trimmedPhoto = typeof profileImageUrl === 'string' && profileImageUrl.trim() !== ''
            ? profileImageUrl.trim()
            : null;
        if (trimmedPhoto) {
            try {
                new URL(trimmedPhoto);
                createUserOptions.photoURL = trimmedPhoto;
            }
            catch {
            }
        }
        let userRecord;
        let userData;
        try {
            userRecord = await admin.auth().createUser(createUserOptions);
        }
        catch (err) {
            if ((0, error_utils_1.isFirebaseAuthError)(err)) {
                if (err.code === 'auth/email-already-exists') {
                    throw new common_1.ConflictException('The email address is already in use');
                }
                if (err.code === 'auth/invalid-photo-url') {
                    throw new common_1.BadRequestException('Profile image must be a valid URL');
                }
            }
            throw err;
        }
        try {
            const user = await this.userRepository.createUser({
                id: userRecord.uid,
                email: userRecord.email || '',
                firstName,
                lastName,
                photoURL: profileImageUrl && profileImageUrl.trim() !== ''
                    ? profileImageUrl
                    : null,
                createdAt: new Date(),
                emailVerified: false,
            });
            userData = user;
            try {
                await this.emailService.sendVerificationLink(email);
            }
            catch (emailError) {
                throw new common_1.BadRequestException('Failed to send verification email: ' + (0, error_utils_1.getErrorMessage)(emailError));
            }
            return {
                success: true,
                message: 'User created successfully',
                user: userData,
            };
        }
        catch (err) {
            await admin.auth().deleteUser(userRecord.uid);
            await this.userRepository.deleteUser(userRecord.uid);
            if ((0, error_utils_1.isFirebaseAuthError)(err)) {
                if (err.code === 'auth/email-already-exists') {
                    throw new common_1.ConflictException('The email address is already in use');
                }
                if (err.code === 'auth/invalid-photo-url') {
                    throw new common_1.BadRequestException('Profile image must be a valid URL');
                }
            }
            throw err;
        }
    }
    async signin(signinDto) {
        const { token } = signinDto;
        const decodedToken = await admin.auth().verifyIdToken(token);
        const userRecord = await admin.auth().getUser(decodedToken.uid);
        const user = await this.userRepository.getUser(decodedToken.uid);
        let userData;
        if (!user) {
            userData = {
                id: decodedToken.uid,
                email: userRecord.email || '',
                firstName: userRecord.displayName?.split(' ')[0],
                lastName: userRecord.displayName?.split(' ')[1],
                photoURL: userRecord.photoURL,
                createdAt: new Date(),
                emailVerified: userRecord.emailVerified,
            };
            await this.userRepository.createUser(userData);
        }
        else {
            userData = user;
            if (userRecord.emailVerified && !user.emailVerified) {
                await this.userRepository.updateUser(decodedToken.uid, {
                    emailVerified: userRecord.emailVerified,
                });
                userData.emailVerified = userRecord.emailVerified;
            }
        }
        if (!userData.emailVerified) {
            await this.emailService.sendVerificationLink(userData.email);
            return {
                success: false,
                message: 'Email not verified. Please check your email for a verification link.',
            };
        }
        return {
            success: true,
            message: 'Signin successful',
            user: userData,
        };
    }
    async signInWithGoogle(signinDto) {
        const { token } = signinDto;
        const decodedToken = await admin.auth().verifyIdToken(token);
        const userRecord = await admin.auth().getUser(decodedToken.uid);
        const user = await this.userRepository.getUser(decodedToken.uid);
        let userData;
        if (!user) {
            userData = {
                id: decodedToken.uid,
                email: userRecord.email || '',
                firstName: userRecord.displayName?.split(' ')[0],
                lastName: userRecord.displayName?.split(' ')[1],
                photoURL: userRecord.photoURL,
                createdAt: new Date(),
                emailVerified: true,
            };
            await this.userRepository.createUser(userData);
        }
        else {
            userData = user;
            if (!userData.emailVerified) {
                userData.emailVerified = true;
                await this.userRepository.updateUser(decodedToken.uid, {
                    emailVerified: true,
                });
            }
        }
        console.log('signin with Google successful', userData);
        return {
            success: true,
            message: 'Signin successful',
            user: userData,
        };
    }
    async checkEmailForPasswordReset(dto) {
        try {
            const userRecord = await admin.auth().getUserByEmail(dto.email);
            const hasPassword = userRecord.providerData.some((p) => p.providerId === 'password');
            if (!hasPassword) {
                throw new common_1.BadRequestException('This account uses Google sign-in. Use "Continue with Google" instead.');
            }
            return { ok: true };
        }
        catch (err) {
            if ((0, error_utils_1.isFirebaseAuthError)(err) && err.code === 'auth/user-not-found') {
                throw new common_1.BadRequestException('No account found with this email');
            }
            throw err;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_repository_1.UserRepository,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map