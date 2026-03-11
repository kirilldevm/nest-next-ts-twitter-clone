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
exports.PostRepository = void 0;
const common_1 = require("@nestjs/common");
const admin = __importStar(require("firebase-admin"));
const LIMIT_MAX = 50;
const LIMIT_DEFAULT = 10;
let PostRepository = class PostRepository {
    postsDb = admin.firestore().collection('posts');
    mapDoc(doc) {
        if (!doc.exists)
            return null;
        const data = doc.data();
        if (!data)
            return null;
        return {
            id: doc.id,
            authorId: data.authorId,
            title: data.title,
            text: data.text,
            photoURL: data.photoURL ?? null,
            createdAt: data.createdAt &&
                typeof data.createdAt === 'object' &&
                'toDate' in data.createdAt
                ? data.createdAt.toDate()
                : new Date(data.createdAt),
            likesCount: data.likesCount ?? 0,
            dislikesCount: data.dislikesCount ?? 0,
            commentsCount: data.commentsCount ?? 0,
        };
    }
    async getPost(id) {
        const doc = await this.postsDb.doc(id).get();
        return this.mapDoc(doc);
    }
    async createPost(data) {
        const docRef = this.postsDb.doc();
        const post = {
            ...data,
            createdAt: data.createdAt ?? new Date(),
        };
        await docRef.set({ ...post, id: docRef.id });
        const created = await this.getPost(docRef.id);
        if (!created)
            throw new common_1.BadRequestException('Failed to create post');
        return created;
    }
    async updatePost(id, data) {
        const docRef = this.postsDb.doc(id);
        const doc = await docRef.get();
        if (!doc.exists)
            return null;
        const { id: _id, authorId: _authorId, createdAt: _createdAt, ...update } = data;
        if (Object.keys(update).length > 0) {
            await docRef.update(update);
        }
        return this.getPost(id);
    }
    async deletePost(id) {
        await this.postsDb.doc(id).delete();
    }
    async listPosts(options) {
        const limit = Math.min(options.limit ?? LIMIT_DEFAULT, LIMIT_MAX);
        let query = options.authorId
            ? this.postsDb
                .where('authorId', '==', options.authorId)
                .orderBy('createdAt', 'desc')
            : this.postsDb.orderBy('createdAt', 'desc');
        if (options.cursor) {
            const cursorDoc = await this.postsDb.doc(options.cursor).get();
            if (cursorDoc.exists) {
                query = query.startAfter(cursorDoc);
            }
        }
        query = query.limit(limit + 1);
        const snapshot = await query.get();
        const items = snapshot.docs
            .slice(0, limit)
            .map((d) => this.mapDoc(d))
            .filter((p) => p !== null);
        const hasMore = snapshot.docs.length > limit;
        const nextCursor = hasMore ? snapshot.docs[limit - 1].id : null;
        return { items, nextCursor };
    }
};
exports.PostRepository = PostRepository;
exports.PostRepository = PostRepository = __decorate([
    (0, common_1.Injectable)()
], PostRepository);
//# sourceMappingURL=post.repository.js.map