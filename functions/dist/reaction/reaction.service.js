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
exports.ReactionService = void 0;
const common_1 = require("@nestjs/common");
const admin = __importStar(require("firebase-admin"));
const comment_repository_1 = require("../comment/repository/comment.repository");
const post_repository_1 = require("../post/repository/post.repository");
const reaction_entity_1 = require("./entity/reaction.entity");
const reaction_repository_1 = require("./repository/reaction.repository");
let ReactionService = class ReactionService {
    reactionRepository;
    postRepository;
    commentRepository;
    constructor(reactionRepository, postRepository, commentRepository) {
        this.reactionRepository = reactionRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
    }
    async setReaction(userId, targetType, targetId, type) {
        return admin.firestore().runTransaction(async (transaction) => {
            let entity = null;
            if (targetType === reaction_entity_1.ReactionTargetType.POST) {
                const post = await this.postRepository.getPost(targetId, transaction);
                if (!post) {
                    throw new common_1.NotFoundException('Post not found');
                }
                entity = post;
            }
            else if (targetType === reaction_entity_1.ReactionTargetType.COMMENT) {
                const comment = await this.commentRepository.getComment(targetId, transaction);
                if (!comment) {
                    throw new common_1.NotFoundException('Comment not found');
                }
                entity = comment;
            }
            const existing = await this.reactionRepository.getReaction(targetType, targetId, userId, transaction);
            let likesDelta = 0;
            let dislikesDelta = 0;
            let newReactionType = type;
            if (existing?.type === type) {
                if (type === reaction_entity_1.ReactionType.LIKE)
                    likesDelta = -1;
                else
                    dislikesDelta = -1;
                newReactionType = null;
            }
            else if (existing?.type) {
                if (existing.type === reaction_entity_1.ReactionType.LIKE)
                    likesDelta = -1;
                else
                    dislikesDelta = -1;
                if (type === reaction_entity_1.ReactionType.LIKE)
                    likesDelta += 1;
                else
                    dislikesDelta += 1;
            }
            else {
                if (type === reaction_entity_1.ReactionType.LIKE)
                    likesDelta = 1;
                else
                    dislikesDelta = 1;
            }
            const newLikesCount = Math.max(0, (entity?.likesCount ?? 0) + likesDelta);
            const newDislikesCount = Math.max(0, (entity?.dislikesCount ?? 0) + dislikesDelta);
            if (newReactionType) {
                await this.reactionRepository.setReaction(targetType, targetId, userId, type, transaction);
            }
            else {
                await this.reactionRepository.deleteReaction(targetType, targetId, userId, transaction);
            }
            if (targetType === reaction_entity_1.ReactionTargetType.POST) {
                await this.postRepository.updatePost(targetId, { likesCount: newLikesCount, dislikesCount: newDislikesCount }, transaction);
            }
            else if (targetType === reaction_entity_1.ReactionTargetType.COMMENT) {
                await this.commentRepository.updateComment(targetId, { likesCount: newLikesCount, dislikesCount: newDislikesCount }, transaction);
            }
            return {
                type: newReactionType,
                likesCount: newLikesCount,
                dislikesCount: newDislikesCount,
            };
        });
    }
    async getReaction(userId, targetType, targetId) {
        const reaction = await this.reactionRepository.getReaction(targetType, targetId, userId);
        return reaction?.type ?? null;
    }
};
exports.ReactionService = ReactionService;
exports.ReactionService = ReactionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [reaction_repository_1.ReactionRepository,
        post_repository_1.PostRepository,
        comment_repository_1.CommentRepository])
], ReactionService);
//# sourceMappingURL=reaction.service.js.map