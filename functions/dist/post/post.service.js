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
const algolia_service_1 = require("../algolia/algolia.service");
const storage_service_1 = require("../storage/storage.service");
const user_repository_1 = require("../user/repository/user.repository");
const post_repository_1 = require("./repository/post.repository");
let PostService = class PostService {
    postRepository;
    storageService;
    algoliaService;
    userRepository;
    constructor(postRepository, storageService, algoliaService, userRepository) {
        this.postRepository = postRepository;
        this.storageService = storageService;
        this.algoliaService = algoliaService;
        this.userRepository = userRepository;
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
    async searchPosts(query, options) {
        const trimmed = query?.trim();
        if (!trimmed) {
            throw new common_1.BadRequestException('Search query is required');
        }
        const enrichWithAuthors = async (posts) => {
            const authorIds = [
                ...new Set(posts.map((p) => p.authorId).filter(Boolean)),
            ];
            const userMap = new Map();
            await Promise.all(authorIds.map(async (id) => {
                const user = await this.userRepository.getUser(id);
                if (user) {
                    const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') ||
                        user.email ||
                        'Unknown';
                    userMap.set(id, {
                        displayName,
                        photoURL: user.photoURL ?? null,
                    });
                }
            }));
            return posts.map((post) => ({
                ...post,
                author: userMap.get(post.authorId),
            }));
        };
        try {
            const result = await this.algoliaService.searchPosts(trimmed, options);
            const postIds = result.items
                .map((p) => p.id)
                .filter((id) => !!id);
            const postsFromFirestore = await Promise.all(postIds.map((id) => this.postRepository.getPost(id)));
            const posts = postsFromFirestore.filter((p) => p !== null);
            const items = await enrichWithAuthors(posts);
            return {
                items,
                nextPage: result.nextPage,
                totalHits: result.totalHits,
            };
        }
        catch {
            const result = await this.postRepository.searchPostsByText(trimmed, {
                limit: options?.limit ?? 10,
                page: options?.page ?? 0,
            });
            const enriched = await enrichWithAuthors(result.items);
            return {
                items: enriched,
                nextPage: result.nextPage,
                totalHits: result.totalHits,
            };
        }
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
        if (photoURL !== undefined) {
            update.photoURL = photoURL;
            if (photoURL === null && post.photoURL) {
                await this.storageService.deleteFileByUrl(post.photoURL);
            }
        }
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
        if (post.photoURL) {
            await this.storageService.deleteFileByUrl(post.photoURL);
        }
        await this.postRepository.deletePost(postId);
    }
};
exports.PostService = PostService;
exports.PostService = PostService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [post_repository_1.PostRepository,
        storage_service_1.StorageService,
        algolia_service_1.AlgoliaService,
        user_repository_1.UserRepository])
], PostService);
//# sourceMappingURL=post.service.js.map