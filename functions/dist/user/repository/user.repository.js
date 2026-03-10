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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const common_1 = require("@nestjs/common");
const admin = __importStar(require("firebase-admin"));
let UserRepository = class UserRepository {
    usersDb = admin.firestore().collection('users');
    mapDoc(doc) {
        if (!doc.exists)
            return null;
        const data = doc.data();
        if (!data)
            return null;
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt &&
                typeof data.createdAt === 'object' &&
                'toDate' in data.createdAt
                ? data.createdAt.toDate()
                : new Date(data.createdAt),
        };
    }
    async getUser(id) {
        const user = await this.usersDb.doc(id).get();
        return this.mapDoc(user);
    }
    async createUser(data) {
        await this.usersDb.doc(data.id).set(data);
        return this.getUser(data.id);
    }
    async deleteUser(id) {
        await this.usersDb.doc(id).delete();
    }
    async updateUser(id, data) {
        const docRef = this.usersDb.doc(id);
        const doc = await docRef.get();
        if (!doc.exists) {
            throw new common_1.NotFoundException('User not found');
        }
        if (data.email) {
            const existingUser = await this.usersDb
                .where('email', '==', data.email)
                .get();
            if (existingUser.docs.length > 0 && existingUser.docs[0].id !== id) {
                throw new common_1.BadRequestException('Email is already in use');
            }
        }
        if (data.email && !doc.data()?.emailVerified) {
            throw new common_1.BadRequestException('Email is not verified');
        }
        await doc.ref.update(data);
    }
};
exports.UserRepository = UserRepository;
exports.UserRepository = UserRepository = __decorate([
    (0, common_1.Injectable)()
], UserRepository);
//# sourceMappingURL=user.repository.js.map