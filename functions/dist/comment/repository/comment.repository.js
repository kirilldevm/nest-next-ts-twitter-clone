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
exports.CommentRepository = void 0;
const common_1 = require("@nestjs/common");
const admin = __importStar(require("firebase-admin"));
const LIMIT_MAX = 50;
const LIMIT_DEFAULT = 20;
let CommentRepository = class CommentRepository {
    commentsDb = admin.firestore().collection('comments');
    mapDoc(doc) {
        if (!doc.exists)
            return null;
        const data = doc.data();
        if (!data)
            return null;
        const toDate = (v) => {
            if (v instanceof Date)
                return v;
            if (v && typeof v === 'object' && 'toDate' in v) {
                return v.toDate();
            }
            return new Date(v || Date.now());
        };
        return {
            id: doc.id,
            postId: data.postId,
            authorId: data.authorId,
            authorDisplayName: data.authorDisplayName,
            authorPhotoURL: data.authorPhotoURL ?? null,
            content: data.content,
            parentId: data.parentId ?? null,
            replyCount: data.replyCount ?? 0,
            likesCount: data.likesCount ?? 0,
            dislikesCount: data.dislikesCount ?? 0,
            isDeleted: data.isDeleted ?? false,
            createdAt: toDate(data.createdAt),
            updatedAt: toDate(data.updatedAt),
        };
    }
    async getComment(id, transaction) {
        const docRef = this.commentsDb.doc(id);
        const doc = transaction
            ? await transaction.get(docRef)
            : await docRef.get();
        return this.mapDoc(doc);
    }
    async createComment(data, transaction) {
        const docRef = this.commentsDb.doc();
        const now = new Date();
        const comment = {
            ...data,
            id: docRef.id,
            createdAt: data.createdAt ?? now,
            updatedAt: data.updatedAt ?? now,
        };
        if (transaction) {
            transaction.set(docRef, comment);
            return this.mapDoc({
                id: docRef.id,
                exists: true,
                data: () => comment,
            });
        }
        await docRef.set(comment);
        const created = await this.getComment(docRef.id);
        if (!created)
            throw new Error('Failed to create comment');
        return created;
    }
    async updateComment(id, data, transaction) {
        const docRef = this.commentsDb.doc(id);
        const update = {
            ...data,
            updatedAt: new Date(),
        };
        delete update.id;
        delete update.authorId;
        delete update.postId;
        delete update.parentId;
        delete update.createdAt;
        const filtered = Object.fromEntries(Object.entries(update).filter(([, v]) => v !== undefined));
        if (Object.keys(filtered).length > 0) {
            if (transaction) {
                transaction.update(docRef, filtered);
            }
            else {
                const doc = await docRef.get();
                if (!doc.exists)
                    return;
                await docRef.update(filtered);
            }
        }
    }
    async deleteComment(id, transaction) {
        const docRef = this.commentsDb.doc(id);
        if (transaction) {
            transaction.delete(docRef);
        }
        else {
            await docRef.delete();
        }
    }
    async listCommentIdsByAuthorId(authorId, transaction) {
        const query = this.commentsDb
            .where('authorId', '==', authorId)
            .limit(500);
        const snapshot = transaction
            ? await transaction.get(query)
            : await query.get();
        return snapshot.docs.map((d) => d.id);
    }
    async listCommentIdsByPostId(postId, transaction) {
        const query = this.commentsDb
            .where('postId', '==', postId)
            .limit(500);
        const snapshot = transaction
            ? await transaction.get(query)
            : await query.get();
        return snapshot.docs.map((d) => d.id);
    }
    async listComments(options) {
        const limit = Math.min(options.limit ?? LIMIT_DEFAULT, LIMIT_MAX);
        let query = this.commentsDb
            .where('postId', '==', options.postId)
            .where('parentId', '==', options.parentId)
            .orderBy('createdAt', 'asc');
        if (options.cursor) {
            const cursorDoc = await this.commentsDb.doc(options.cursor).get();
            if (cursorDoc.exists) {
                query = query.startAfter(cursorDoc);
            }
        }
        query = query.limit(limit + 1);
        const snapshot = await query.get();
        const items = snapshot.docs
            .slice(0, limit)
            .map((d) => this.mapDoc(d))
            .filter((c) => c !== null);
        const hasMore = snapshot.docs.length > limit;
        const nextCursor = hasMore ? snapshot.docs[limit - 1].id : null;
        return { items, nextCursor };
    }
};
exports.CommentRepository = CommentRepository;
exports.CommentRepository = CommentRepository = __decorate([
    (0, common_1.Injectable)()
], CommentRepository);
//# sourceMappingURL=comment.repository.js.map