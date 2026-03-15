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
exports.ReactionRepository = void 0;
const common_1 = require("@nestjs/common");
const admin = __importStar(require("firebase-admin"));
function docId(targetType, targetId, userId) {
    return `${targetType}_${targetId}_${userId}`;
}
let ReactionRepository = class ReactionRepository {
    reactionsDb = admin.firestore().collection('reactions');
    async getReaction(targetType, targetId, userId, transaction) {
        const id = docId(targetType, targetId, userId);
        const docRef = this.reactionsDb.doc(id);
        const doc = transaction
            ? await transaction.get(docRef)
            : await docRef.get();
        if (!doc.exists)
            return null;
        const data = doc.data();
        if (!data?.type)
            return null;
        return { type: data.type };
    }
    async setReaction(targetType, targetId, userId, type, transaction) {
        const id = docId(targetType, targetId, userId);
        const docRef = this.reactionsDb.doc(id);
        const data = {
            targetType,
            targetId,
            userId,
            type,
            createdAt: new Date(),
        };
        if (transaction) {
            transaction.set(docRef, data);
        }
        else {
            await docRef.set(data);
        }
    }
    async listReactionIdsByUserId(userId, transaction) {
        const query = this.reactionsDb.where('userId', '==', userId).limit(500);
        const snapshot = transaction
            ? await transaction.get(query)
            : await query.get();
        return snapshot.docs.map((d) => d.id);
    }
    async deleteReactionsByIds(ids, transaction) {
        for (const id of ids) {
            const docRef = this.reactionsDb.doc(id);
            if (transaction) {
                transaction.delete(docRef);
            }
            else {
                await docRef.delete();
            }
        }
    }
    async listReactionIdsByTarget(targetType, targetId, transaction) {
        const query = this.reactionsDb
            .where('targetType', '==', targetType)
            .where('targetId', '==', targetId)
            .limit(500);
        const snapshot = transaction
            ? await transaction.get(query)
            : await query.get();
        return snapshot.docs.map((d) => d.id);
    }
    async deleteReaction(targetType, targetId, userId, transaction) {
        const id = docId(targetType, targetId, userId);
        const docRef = this.reactionsDb.doc(id);
        if (transaction) {
            transaction.delete(docRef);
        }
        else {
            await docRef.delete();
        }
    }
};
exports.ReactionRepository = ReactionRepository;
exports.ReactionRepository = ReactionRepository = __decorate([
    (0, common_1.Injectable)()
], ReactionRepository);
//# sourceMappingURL=reaction.repository.js.map