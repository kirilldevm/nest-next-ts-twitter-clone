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
const user_repository_1 = require("../user/repository/user.repository");
let AuthService = class AuthService {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async signup(createUserDto) {
        const { email, password, firstName, lastName, profileImageUrl } = createUserDto;
        let userRecord;
        try {
            userRecord = await admin.auth().createUser({
                email,
                password,
                displayName: `${firstName} ${lastName}`,
                photoURL: profileImageUrl && profileImageUrl.trim() !== ''
                    ? profileImageUrl
                    : undefined,
            });
        }
        catch (err) {
            if (err instanceof Error && 'code' in err) {
                const code = err.code;
                if (code === 'auth/email-already-exists') {
                    throw new common_1.ConflictException('The email address is already in use');
                }
                if (code === 'auth/invalid-photo-url') {
                    throw new common_1.BadRequestException('Profile image must be a valid URL');
                }
            }
            throw err;
        }
        try {
            await this.userRepository.createUser({
                id: userRecord.uid,
                email: userRecord.email || '',
                firstName,
                lastName,
                profileImageUrl: profileImageUrl || null,
                createdAt: new Date(),
                emailVerified: false,
            });
            return {
                id: userRecord.uid,
                email: userRecord.email || '',
            };
        }
        catch (err) {
            await admin.auth().deleteUser(userRecord.uid);
            if (err instanceof Error && 'code' in err) {
                const code = err.code;
                if (code === 'auth/email-already-exists') {
                    throw new common_1.ConflictException('The email address is already in use');
                }
                if (code === 'auth/invalid-photo-url') {
                    throw new common_1.BadRequestException('Profile image must be a valid URL');
                }
            }
            throw new common_1.BadRequestException('Failed to create user');
        }
    }
    async signin(signinDto) {
        const { token } = signinDto;
        const decodedToken = await admin.auth().verifyIdToken(token);
        console.log(decodedToken);
        const userRecord = await admin.auth().getUser(decodedToken.uid);
        console.log(userRecord);
        return userRecord;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_repository_1.UserRepository])
], AuthService);
//# sourceMappingURL=auth.service.js.map