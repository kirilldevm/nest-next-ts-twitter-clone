import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostRepository } from './repository/post.repository';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly storageService: StorageService,
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
  }) {
    return this.postRepository.listPosts(options);
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
