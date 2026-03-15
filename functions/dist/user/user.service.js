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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const admin = __importStar(require("firebase-admin"));
const comment_repository_1 = require("../comment/repository/comment.repository");
const post_repository_1 = require("../post/repository/post.repository");
const reaction_entity_1 = require("../reaction/entity/reaction.entity");
const reaction_repository_1 = require("../reaction/repository/reaction.repository");
const storage_service_1 = require("../storage/storage.service");
const user_repository_1 = require("./repository/user.repository");
let UserService = class UserService {
    userRepository;
    postRepository;
    commentRepository;
    reactionRepository;
    storageService;
    constructor(userRepository, postRepository, commentRepository, reactionRepository, storageService) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.reactionRepository = reactionRepository;
        this.storageService = storageService;
    }
    async getUser(id) {
        return this.userRepository.getUser(id);
    }
    async deleteUser(uid) {
        const photoUrlsToDelete = [];
        await admin.firestore().runTransaction(async (transaction) => {
            const reactionIds = await this.reactionRepository.listReactionIdsByUserId(uid, transaction);
            await this.reactionRepository.deleteReactionsByIds(reactionIds, transaction);
            const postIds = await this.postRepository.listPostIdsByAuthorId(uid, transaction);
            for (const postId of postIds) {
                const post = await this.postRepository.getPost(postId, transaction);
                if (post?.photoURL)
                    photoUrlsToDelete.push(post.photoURL);
                const commentIds = await this.commentRepository.listCommentIdsByPostId(postId, transaction);
                for (const commentId of commentIds) {
                    const commentReactionIds = await this.reactionRepository.listReactionIdsByTarget(reaction_entity_1.ReactionTargetType.COMMENT, commentId, transaction);
                    await this.reactionRepository.deleteReactionsByIds(commentReactionIds, transaction);
                    await this.commentRepository.deleteComment(commentId, transaction);
                }
                const postReactionIds = await this.reactionRepository.listReactionIdsByTarget(reaction_entity_1.ReactionTargetType.POST, postId, transaction);
                await this.reactionRepository.deleteReactionsByIds(postReactionIds, transaction);
                await this.postRepository.deletePost(postId, transaction);
            }
            const userCommentIds = await this.commentRepository.listCommentIdsByAuthorId(uid, transaction);
            for (const commentId of userCommentIds) {
                const commentReactionIds = await this.reactionRepository.listReactionIdsByTarget(reaction_entity_1.ReactionTargetType.COMMENT, commentId, transaction);
                await this.reactionRepository.deleteReactionsByIds(commentReactionIds, transaction);
                await this.commentRepository.deleteComment(commentId, transaction);
            }
            await this.userRepository.deleteUser(uid, transaction);
        });
        for (const url of photoUrlsToDelete) {
            await this.storageService.deleteFileByUrl(url);
        }
        await admin.auth().deleteUser(uid);
    }
    async updateUser(uid, updateUserDto) {
        const filtered = { ...updateUserDto };
        Object.keys(filtered).forEach((key) => filtered[key] === undefined &&
            delete filtered[key]);
        await this.userRepository.updateUser(uid, filtered);
        if (filtered.firstName !== undefined ||
            filtered.lastName !== undefined ||
            filtered.photoURL !== undefined) {
            const current = await this.userRepository.getUser(uid);
            const displayName = [current?.firstName ?? '', current?.lastName ?? '']
                .filter(Boolean)
                .join(' ');
            const photoURL = current?.photoURL ?? null;
            await admin.auth().updateUser(uid, {
                displayName,
                photoURL,
            });
            await admin.firestore().runTransaction(async (transaction) => {
                const commentIds = await this.commentRepository.listCommentIdsByAuthorId(uid, transaction);
                for (const commentId of commentIds) {
                    await this.commentRepository.updateComment(commentId, { authorDisplayName: displayName, authorPhotoURL: photoURL }, transaction);
                }
            });
        }
        return this.userRepository.getUser(uid);
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_repository_1.UserRepository,
        post_repository_1.PostRepository,
        comment_repository_1.CommentRepository,
        reaction_repository_1.ReactionRepository,
        storage_service_1.StorageService])
], UserService);
//# sourceMappingURL=user.service.js.map