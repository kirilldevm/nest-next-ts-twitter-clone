import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { EmailService } from 'src/email/email.service';
import { CommentRepository } from '../comment/repository/comment.repository';
import { PostRepository } from '../post/repository/post.repository';
import {
  ReactionTargetType,
  ReactionType,
} from '../reaction/entity/reaction.entity';
import { ReactionRepository } from '../reaction/repository/reaction.repository';
import { StorageService } from '../storage/storage.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './repository/user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly postRepository: PostRepository,
    private readonly commentRepository: CommentRepository,
    private readonly reactionRepository: ReactionRepository,
    private readonly storageService: StorageService,
    private readonly emailService: EmailService,
  ) {}

  async getUser(id: string) {
    return this.userRepository.getUser(id);
  }

  async sendVerificationEmail(uid: string) {
    const user = await this.userRepository.getUser(uid);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    await this.emailService.sendVerificationLink(user.email);

    return {
      success: true,
      message: 'Verification email sent',
    };
  }

  async deleteUser(uid: string) {
    const photoUrlsToDelete: string[] = [];

    try {
      await admin.firestore().runTransaction(async (transaction) => {
        // --- PHASE 1: All reads first (Firestore requires reads before writes) ---

        const userReactions =
          await this.reactionRepository.listReactionsByUserId(uid, transaction);

        const postIds = await this.postRepository.listPostIdsByAuthorId(
          uid,
          transaction,
        );

        const postData: Array<{
          postId: string;
          commentIds: string[];
          commentReactionIds: Record<string, string[]>;
          postReactionIds: string[];
        }> = [];

        for (const postId of postIds) {
          const post = await this.postRepository.getPost(postId, transaction);

          if (post?.photoURL) photoUrlsToDelete.push(post.photoURL);

          const commentIds =
            await this.commentRepository.listCommentIdsByPostId(
              postId,
              transaction,
            );

          const commentReactionIds: Record<string, string[]> = {};
          for (const commentId of commentIds) {
            commentReactionIds[commentId] =
              await this.reactionRepository.listReactionIdsByTarget(
                ReactionTargetType.COMMENT,
                commentId,
                transaction,
              );
          }

          const postReactionIds =
            await this.reactionRepository.listReactionIdsByTarget(
              ReactionTargetType.POST,
              postId,
              transaction,
            );

          postData.push({
            postId,
            commentIds,
            commentReactionIds,
            postReactionIds,
          });
        }

        const userCommentIds =
          await this.commentRepository.listCommentIdsByAuthorId(
            uid,
            transaction,
          );
        const allPostCommentIds = new Set(
          postData.flatMap((p) => p.commentIds),
        );
        const userCommentsOnOthersPosts = userCommentIds.filter(
          (id) => !allPostCommentIds.has(id),
        );

        const userCommentReactionIds: Record<string, string[]> = {};
        for (const commentId of userCommentsOnOthersPosts) {
          userCommentReactionIds[commentId] =
            await this.reactionRepository.listReactionIdsByTarget(
              ReactionTargetType.COMMENT,
              commentId,
              transaction,
            );
        }

        const userCommentsOnOthersPostIds: Record<string, number> = {};
        for (const commentId of userCommentsOnOthersPosts) {
          const comment = await this.commentRepository.getComment(
            commentId,
            transaction,
          );
          if (comment?.postId) {
            userCommentsOnOthersPostIds[comment.postId] =
              (userCommentsOnOthersPostIds[comment.postId] ?? 0) + 1;
          }
        }

        const userPostIdsSet = new Set(postIds);
        const commentsBeingDeleted = new Set([
          ...allPostCommentIds,
          ...userCommentsOnOthersPosts,
        ]);

        // --- PHASE 2: All writes ---

        // Decrease counts on posts/comments that are NOT being deleted
        for (const r of userReactions) {
          if (r.targetType === ReactionTargetType.POST) {
            if (!userPostIdsSet.has(r.targetId)) {
              const delta =
                r.type === ReactionType.LIKE
                  ? { likesDelta: -1 }
                  : { dislikesDelta: -1 };
              await this.postRepository.incrementPostCounts(
                r.targetId,
                delta,
                transaction,
              );
            }
          } else if (r.targetType === ReactionTargetType.COMMENT) {
            if (!commentsBeingDeleted.has(r.targetId)) {
              const delta =
                r.type === ReactionType.LIKE
                  ? { likesDelta: -1 }
                  : { dislikesDelta: -1 };
              await this.commentRepository.incrementCommentCounts(
                r.targetId,
                delta,
                transaction,
              );
            }
          }
        }

        for (const [postId, count] of Object.entries(
          userCommentsOnOthersPostIds,
        )) {
          await this.postRepository.incrementPostCounts(
            postId,
            { commentsDelta: -count },
            transaction,
          );
        }

        await this.reactionRepository.deleteReactionsByIds(
          userReactions.map((r) => r.id),
          transaction,
        );

        for (const {
          postId,
          commentIds,
          commentReactionIds,
          postReactionIds,
        } of postData) {
          for (const commentId of commentIds) {
            await this.reactionRepository.deleteReactionsByIds(
              commentReactionIds[commentId] ?? [],
              transaction,
            );
            await this.commentRepository.deleteComment(commentId, transaction);
          }
          await this.reactionRepository.deleteReactionsByIds(
            postReactionIds,
            transaction,
          );
          await this.postRepository.deletePost(postId, transaction);
        }

        for (const commentId of userCommentsOnOthersPosts) {
          await this.reactionRepository.deleteReactionsByIds(
            userCommentReactionIds[commentId] ?? [],
            transaction,
          );
          await this.commentRepository.deleteComment(commentId, transaction);
        }

        await this.userRepository.deleteUser(uid, transaction);
      });

      for (const url of photoUrlsToDelete) {
        await this.storageService.deleteFileByUrl(url);
      }

      try {
        await admin.auth().deleteUser(uid);
      } catch (authErr: unknown) {
        const code = (authErr as { code?: string })?.code;
        if (code === 'auth/user-not-found') {
          return;
        }
        throw authErr;
      }
    } catch (err) {
      console.error('deleteUser failed:', { uid, err });
      throw err;
    }
  }

  async updateUser(uid: string, updateUserDto: UpdateUserDto) {
    const filtered = { ...updateUserDto };

    Object.keys(filtered).forEach(
      (key) =>
        filtered[key as keyof UpdateUserDto] === undefined &&
        delete filtered[key as keyof UpdateUserDto],
    );

    await this.userRepository.updateUser(uid, filtered);

    if (
      filtered.firstName !== undefined ||
      filtered.lastName !== undefined ||
      filtered.photoURL !== undefined
    ) {
      const current = await this.userRepository.getUser(uid);

      const displayName = [current?.firstName ?? '', current?.lastName ?? '']
        .filter(Boolean)
        .join(' ');

      const photoURL = current?.photoURL ?? null;

      await admin.auth().updateUser(uid, {
        displayName,
        photoURL,
      });

      await admin.firestore().runTransaction(async (transaction) => {
        const commentIds =
          await this.commentRepository.listCommentIdsByAuthorId(
            uid,
            transaction,
          );

        for (const commentId of commentIds) {
          await this.commentRepository.updateComment(
            commentId,
            { authorDisplayName: displayName, authorPhotoURL: photoURL },
            transaction,
          );
        }
      });
    }

    return this.userRepository.getUser(uid);
  }
}
