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
exports.CommentService = void 0;
const common_1 = require("@nestjs/common");
const admin = __importStar(require("firebase-admin"));
const post_repository_1 = require("../post/repository/post.repository");
const comment_repository_1 = require("./repository/comment.repository");
let CommentService = class CommentService {
    commentRepository;
    postRepository;
    constructor(commentRepository, postRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
    }
    async createComment(authorId, authorDisplayName, authorPhotoURL, dto) {
        const parentId = dto.parentId ?? null;
        return admin.firestore().runTransaction(async (transaction) => {
            const post = await this.postRepository.getPost(dto.postId, transaction);
            if (!post) {
                throw new common_1.NotFoundException('Post not found');
            }
            if (parentId) {
                const parent = await this.commentRepository.getComment(parentId, transaction);
                if (!parent || parent.postId !== dto.postId) {
                    throw new common_1.BadRequestException('Invalid parent comment');
                }
            }
            const now = new Date();
            const comment = await this.commentRepository.createComment({
                postId: dto.postId,
                authorId,
                authorDisplayName,
                authorPhotoURL: authorPhotoURL ?? null,
                content: dto.content,
                parentId,
                replyCount: 0,
                likesCount: 0,
                dislikesCount: 0,
                isDeleted: false,
                createdAt: now,
                updatedAt: now,
            }, transaction);
            if (parentId) {
                const parent = await this.commentRepository.getComment(parentId, transaction);
                if (parent) {
                    await this.commentRepository.updateComment(parentId, { replyCount: parent.replyCount + 1 }, transaction);
                }
            }
            await this.postRepository.updatePost(dto.postId, { commentsCount: (post.commentsCount ?? 0) + 1 }, transaction);
            return comment;
        });
    }
    async getComment(id) {
        const comment = await this.commentRepository.getComment(id);
        if (!comment) {
            throw new common_1.NotFoundException('Comment not found');
        }
        return comment;
    }
    async listComments(options) {
        const parentId = options.parentId === undefined ? null : (options.parentId ?? null);
        return this.commentRepository.listComments({
            postId: options.postId,
            parentId,
            limit: options.limit,
            cursor: options.cursor,
        });
    }
    async updateComment(id, dto) {
        await this.commentRepository.updateComment(id, { content: dto.content });
        const comment = await this.commentRepository.getComment(id);
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        return comment;
    }
    async deleteComment(id) {
        const comment = await this.commentRepository.getComment(id);
        if (!comment) {
            throw new common_1.NotFoundException('Comment not found');
        }
        await admin.firestore().runTransaction(async (transaction) => {
            await this.commentRepository.updateComment(id, {
                content: '[deleted]',
                isDeleted: true,
            }, transaction);
            if (comment.parentId) {
                const parent = await this.commentRepository.getComment(comment.parentId, transaction);
                if (parent) {
                    await this.commentRepository.updateComment(comment.parentId, { replyCount: Math.max(0, parent.replyCount - 1) }, transaction);
                }
            }
            const post = await this.postRepository.getPost(comment.postId, transaction);
            if (post) {
                await this.postRepository.updatePost(comment.postId, { commentsCount: Math.max(0, (post.commentsCount ?? 0) - 1) }, transaction);
            }
        });
    }
};
exports.CommentService = CommentService;
exports.CommentService = CommentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [comment_repository_1.CommentRepository,
        post_repository_1.PostRepository])
], CommentService);
//# sourceMappingURL=comment.service.js.map