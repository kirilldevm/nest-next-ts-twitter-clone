import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { PostRepository } from '../repository/post.repository';

@Injectable()
export class PostAuthorGuard implements CanActivate {
  constructor(private readonly postRepository: PostRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { params: { id: string } }>();

    const postId = request.params?.id;
    const userId = request.user?.uid;

    if (!postId || !userId) {
      throw new ForbiddenException('Access denied');
    }

    const post = await this.postRepository.getPost(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException(
        'You can only update or delete your own posts',
      );
    }

    return true;
  }
}
