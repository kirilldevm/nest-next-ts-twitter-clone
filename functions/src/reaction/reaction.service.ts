import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { SetReactionResult } from 'src/types/reaction.type';
import { PostRepository } from '../post/repository/post.repository';
import { ReactionTargetType, ReactionType } from './entity/reaction.entity';
import { ReactionRepository } from './repository/reaction.repository';

@Injectable()
export class ReactionService {
  constructor(
    private readonly reactionRepository: ReactionRepository,
    private readonly postRepository: PostRepository,
  ) {}

  async setReaction(
    userId: string,
    targetType: ReactionTargetType,
    targetId: string,
    type: ReactionType,
  ): Promise<SetReactionResult> {
    if (targetType === ReactionTargetType.POST) {
      return admin.firestore().runTransaction(async (transaction) => {
        const post = await this.postRepository.getPost(targetId, transaction);
        if (!post) {
          throw new NotFoundException('Post not found');
        }

        const existing = await this.reactionRepository.getReaction(
          ReactionTargetType.POST,
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

        const newLikesCount = Math.max(0, (post.likesCount ?? 0) + likesDelta);
        const newDislikesCount = Math.max(
          0,
          (post.dislikesCount ?? 0) + dislikesDelta,
        );

        if (newReactionType) {
          await this.reactionRepository.setReaction(
            ReactionTargetType.POST,
            targetId,
            userId,
            type,
            transaction,
          );
        } else {
          await this.reactionRepository.deleteReaction(
            ReactionTargetType.POST,
            targetId,
            userId,
            transaction,
          );
        }

        await this.postRepository.updatePost(
          targetId,
          { likesCount: newLikesCount, dislikesCount: newDislikesCount },
          transaction,
        );

        return {
          type: newReactionType,
          likesCount: newLikesCount,
          dislikesCount: newDislikesCount,
        };
      });
    }
    // TODO: comment support later
    throw new BadRequestException('Unsupported target type');
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
