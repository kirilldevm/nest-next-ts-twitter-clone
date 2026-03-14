import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { PostRepository } from '../post/repository/post.repository';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entity/comment.entity';
import { CommentRepository } from './repository/comment.repository';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly postRepository: PostRepository,
  ) {}

  async createComment(
    authorId: string,
    authorDisplayName: string,
    authorPhotoURL: string | null,
    dto: CreateCommentDto,
  ): Promise<Comment> {
    const parentId = dto.parentId ?? null;

    return admin.firestore().runTransaction(async (transaction) => {
      const post = await this.postRepository.getPost(dto.postId, transaction);

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      let parent: Comment | null = null;
      if (parentId) {
        parent = await this.commentRepository.getComment(parentId, transaction);

        if (!parent || parent.postId !== dto.postId) {
          throw new BadRequestException('Invalid parent comment');
        }
      }

      const now = new Date();
      const comment = await this.commentRepository.createComment(
        {
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
        },
        transaction,
      );

      if (parent) {
        await this.commentRepository.updateComment(
          parentId!,
          { replyCount: parent.replyCount + 1 },
          transaction,
        );
      }

      await this.postRepository.updatePost(
        dto.postId,
        { commentsCount: (post.commentsCount ?? 0) + 1 },
        transaction,
      );

      return comment;
    });
  }

  async getComment(id: string): Promise<Comment> {
    const comment = await this.commentRepository.getComment(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async listComments(options: {
    postId: string;
    parentId?: string | null;
    limit?: number;
    cursor?: string;
  }): Promise<{ items: Comment[]; nextCursor: string | null }> {
    const parentId =
      options.parentId === undefined ? null : (options.parentId ?? null);

    return this.commentRepository.listComments({
      postId: options.postId,
      parentId,
      limit: options.limit,
      cursor: options.cursor,
    });
  }

  async updateComment(id: string, dto: UpdateCommentDto): Promise<Comment> {
    const comment = await this.commentRepository.getComment(id);

    if (!comment) throw new NotFoundException('Comment not found');

    await this.commentRepository.updateComment(id, { content: dto.content });

    return comment;
  }

  async deleteComment(id: string): Promise<void> {
    const comment = await this.commentRepository.getComment(id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    await admin.firestore().runTransaction(async (transaction) => {
      let parent: Comment | null = null;
      if (comment.parentId) {
        parent = await this.commentRepository.getComment(
          comment.parentId,
          transaction,
        );
      }

      const post = await this.postRepository.getPost(
        comment.postId,
        transaction,
      );

      await this.commentRepository.updateComment(
        id,
        {
          content: '[deleted]',
          isDeleted: true,
        },
        transaction,
      );

      if (parent) {
        await this.commentRepository.updateComment(
          comment.parentId!,
          { replyCount: Math.max(0, parent.replyCount - 1) },
          transaction,
        );
      }

      if (post) {
        await this.postRepository.updatePost(
          comment.postId,
          { commentsCount: Math.max(0, (post.commentsCount ?? 0) - 1) },
          transaction,
        );
      }
    });
  }
}
