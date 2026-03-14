import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AlgoliaService } from '../algolia/algolia.service';
import { StorageService } from '../storage/storage.service';
import { UserRepository } from '../user/repository/user.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import type { Post } from './entity/post.entity';
import { PostRepository } from './repository/post.repository';

export type SearchPostItem = Post & {
  author?: { displayName: string; photoURL: string | null };
};

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly storageService: StorageService,
    private readonly algoliaService: AlgoliaService,
    private readonly userRepository: UserRepository,
  ) {}

  async createPost(authorId: string, dto: CreatePostDto) {
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

  async getPost(id: string) {
    const post = await this.postRepository.getPost(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async listPosts(options: {
    authorId?: string;
    limit?: number;
    cursor?: string;
    sortBy?: 'createdAt' | 'engagement';
  }) {
    return this.postRepository.listPosts(options);
  }

  async searchPosts(
    query: string,
    options?: { page?: number; limit?: number },
  ): Promise<{
    items: SearchPostItem[];
    nextPage: number | null;
    totalHits?: number;
  }> {
    const trimmed = query?.trim();

    if (!trimmed) {
      throw new BadRequestException('Search query is required');
    }

    try {
      const result = await this.algoliaService.searchPosts(trimmed, options);
      const postIds = result.items
        .map((p) => p.id)
        .filter((id): id is string => !!id);
      const postsFromFirestore = await Promise.all(
        postIds.map((id) => this.postRepository.getPost(id)),
      );
      const posts = postsFromFirestore.filter((p): p is Post => p !== null);

      const authorIds = [
        ...new Set(posts.map((p) => p.authorId).filter(Boolean)),
      ];

      const userMap = new Map<
        string,
        { displayName: string; photoURL: string | null }
      >();

      await Promise.all(
        authorIds.map(async (id) => {
          const user = await this.userRepository.getUser(id);
          if (user) {
            const displayName =
              [user.firstName, user.lastName].filter(Boolean).join(' ') ||
              user.email ||
              'Unknown';
            userMap.set(id, {
              displayName,
              photoURL: user.photoURL ?? null,
            });
          }
        }),
      );

      const items: SearchPostItem[] = posts.map((post) => ({
        ...post,
        author: userMap.get(post.authorId),
      }));

      return {
        items,
        nextPage: result.nextPage,
        totalHits: result.totalHits,
      };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Search service unavailable';
      if (message.includes('not configured')) {
        throw new BadRequestException(
          'Search is not configured. Set ALGOLIA_APP_ID and ALGOLIA_ADMIN_API_KEY.',
        );
      }
      throw err;
    }
  }

  async updatePost(postId: string, userId: string, dto: UpdatePostDto) {
    const post = await this.postRepository.getPost(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    const { title, text, photoURL } = dto;
    const update: Partial<typeof post> = {};

    if (title !== undefined) update.title = title;
    if (text !== undefined) update.text = text;
    if (photoURL !== undefined) {
      update.photoURL = photoURL;

      if (photoURL === null && post.photoURL) {
        await this.storageService.deleteFileByUrl(post.photoURL);
      }
    }

    return this.postRepository.updatePost(postId, update);
  }

  async deletePost(postId: string, userId: string) {
    const post = await this.postRepository.getPost(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    if (post.photoURL) {
      await this.storageService.deleteFileByUrl(post.photoURL);
    }

    await this.postRepository.deletePost(postId);
  }
}
