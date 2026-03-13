"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentAuthorGuard = void 0;
const common_1 = require("@nestjs/common");
const comment_repository_1 = require("../repository/comment.repository");
let CommentAuthorGuard = class CommentAuthorGuard {
    commentRepository;
    constructor(commentRepository) {
        this.commentRepository = commentRepository;
    }
    async canActivate(context) {
        const request = context
            .switchToHttp()
            .getRequest();
        const commentId = request.params?.id;
        const userId = request.user?.uid;
        if (!commentId || !userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const comment = await this.commentRepository.getComment(commentId);
        if (!comment) {
            throw new common_1.NotFoundException('Comment not found');
        }
        if (comment.authorId !== userId) {
            throw new common_1.ForbiddenException('You can only update or delete your own comments');
        }
        return true;
    }
};
exports.CommentAuthorGuard = CommentAuthorGuard;
exports.CommentAuthorGuard = CommentAuthorGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [comment_repository_1.CommentRepository])
], CommentAuthorGuard);
//# sourceMappingURL=comment-author.guard.js.map