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
exports.PostService = void 0;
const common_1 = require("@nestjs/common");
const post_repository_1 = require("./repository/post.repository");
let PostService = class PostService {
    postRepository;
    constructor(postRepository) {
        this.postRepository = postRepository;
    }
    async createPost(authorId, dto) {
        return this.postRepository.createPost({
            authorId,
            title: dto.title,
            text: dto.text,
            photoURL: dto.photoURL ?? null,
            createdAt: new Date(),
            likesCount: 0,
            dislikesCount: 0,
            commentsCount: 0,
        });
    }
    async getPost(id) {
        const post = await this.postRepository.getPost(id);
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        return post;
    }
    async listPosts(options) {
        return this.postRepository.listPosts(options);
    }
    async updatePost(postId, userId, dto) {
        const post = await this.postRepository.getPost(postId);
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        if (post.authorId !== userId) {
            throw new common_1.ForbiddenException('You can only edit your own posts');
        }
        const { title, text, photoURL } = dto;
        const update = {};
        if (title !== undefined)
            update.title = title;
        if (text !== undefined)
            update.text = text;
        if (photoURL !== undefined)
            update.photoURL = photoURL;
        return this.postRepository.updatePost(postId, update);
    }
    async deletePost(postId, userId) {
        const post = await this.postRepository.getPost(postId);
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        if (post.authorId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own posts');
        }
        await this.postRepository.deletePost(postId);
    }
};
exports.PostService = PostService;
exports.PostService = PostService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [post_repository_1.PostRepository])
], PostService);
//# sourceMappingURL=post.service.js.map