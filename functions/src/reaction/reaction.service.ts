import { Injectable, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Comment } from 'src/comment/entity/comment.entity';
import { Post } from 'src/post/entity/post.entity';
import { SetReactionResult } from 'src/types/reaction.type';
import { CommentRepository } from '../comment/repository/comment.repository';
import { PostRepository } from '../post/repository/post.repository';
import { ReactionTargetType, ReactionType } from './entity/reaction.entity';
import { ReactionRepository } from './repository/reaction.repository';

@Injectable()
export class ReactionService {
  constructor(
    private readonly reactionRepository: ReactionRepository,
    private readonly postRepository: PostRepository,
    private readonly commentRepository: CommentRepository,
  ) {}

  async setReaction(
    userId: string,
    targetType: ReactionTargetType,
    targetId: string,
    type: ReactionType,
  ): Promise<SetReactionResult> {
    return admin.firestore().runTransaction(async (transaction) => {
      let entity: Post | Comment | null = null;

      if (targetType === ReactionTargetType.POST) {
        const post = await this.postRepository.getPost(targetId, transaction);

        if (!post) {
          throw new NotFoundException('Post not found');
        }

        entity = post;
      } else if (targetType === ReactionTargetType.COMMENT) {
        const comment = await this.commentRepository.getComment(
          targetId,
          transaction,
        );

        if (!comment) {
          throw new NotFoundException('Comment not found');
        }

        entity = comment;
      }

      const existing = await this.reactionRepository.getReaction(
        targetType,
        targetId,
        userId,
        transaction,
      );

      let likesDelta = 0;
      let dislikesDelta = 0;
      let newReactionType: ReactionType | null = type;

      if (existing?.type === type) {
        if (type === ReactionType.LIKE) likesDelta = -1;
        else dislikesDelta = -1;
        newReactionType = null;
      } else if (existing?.type) {
        if (existing.type === ReactionType.LIKE) likesDelta = -1;
        else dislikesDelta = -1;
        if (type === ReactionType.LIKE) likesDelta += 1;
        else dislikesDelta += 1;
      } else {
        if (type === ReactionType.LIKE) likesDelta = 1;
        else dislikesDelta = 1;
      }

      const newLikesCount = Math.max(0, (entity?.likesCount ?? 0) + likesDelta);
      const newDislikesCount = Math.max(
        0,
        (entity?.dislikesCount ?? 0) + dislikesDelta,
      );

      if (newReactionType) {
        await this.reactionRepository.setReaction(
          targetType,
          targetId,
          userId,
          type,
          transaction,
        );
      } else {
        await this.reactionRepository.deleteReaction(
          targetType,
          targetId,
          userId,
          transaction,
        );
      }

      if (entity instanceof Post) {
        await this.postRepository.updatePost(
          targetId,
          { likesCount: newLikesCount, dislikesCount: newDislikesCount },
          transaction,
        );
      } else if (entity instanceof Comment) {
        await this.commentRepository.updateComment(
          targetId,
          { likesCount: newLikesCount, dislikesCount: newDislikesCount },
          transaction,
        );
      }

      return {
        type: newReactionType,
        likesCount: newLikesCount,
        dislikesCount: newDislikesCount,
      };
    });

    // throw new BadRequestException('Unsupported target type');
  }

  async getReaction(
    userId: string,
    targetType: ReactionTargetType,
    targetId: string,
  ): Promise<ReactionType | null> {
    const reaction = await this.reactionRepository.getReaction(
      targetType,
      targetId,
      userId,
    );

    return reaction?.type ?? null;
  }
}
