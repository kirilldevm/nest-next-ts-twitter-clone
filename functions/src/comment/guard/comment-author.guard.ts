import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { ReqUser } from '../../auth/guard/auth.guard';
import { CommentRepository } from '../repository/comment.repository';

@Injectable()
export class CommentAuthorGuard implements CanActivate {
  constructor(private readonly commentRepository: CommentRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & ReqUser & { params: { id: string } }>();

    const commentId = request.params?.id;
    const userId = request.user?.uid;

    if (!commentId || !userId) {
      throw new ForbiddenException('Access denied');
    }

    const comment = await this.commentRepository.getComment(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException(
        'You can only update or delete your own comments',
      );
    }

    return true;
  }
}
