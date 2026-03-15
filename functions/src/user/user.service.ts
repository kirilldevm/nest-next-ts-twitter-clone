import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { CommentRepository } from '../comment/repository/comment.repository';
import { PostRepository } from '../post/repository/post.repository';
import { ReactionTargetType } from '../reaction/entity/reaction.entity';
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
  ) {}

  async getUser(id: string) {
    return this.userRepository.getUser(id);
  }

  async deleteUser(uid: string) {
    const photoUrlsToDelete: string[] = [];

    await admin.firestore().runTransaction(async (transaction) => {
      const reactionIds = await this.reactionRepository.listReactionIdsByUserId(
        uid,
        transaction,
      );

      await this.reactionRepository.deleteReactionsByIds(
        reactionIds,
        transaction,
      );

      const postIds = await this.postRepository.listPostIdsByAuthorId(
        uid,
        transaction,
      );
      for (const postId of postIds) {
        const post = await this.postRepository.getPost(postId, transaction);

        if (post?.photoURL) photoUrlsToDelete.push(post.photoURL);

        const commentIds = await this.commentRepository.listCommentIdsByPostId(
          postId,
          transaction,
        );
        for (const commentId of commentIds) {
          const commentReactionIds =
            await this.reactionRepository.listReactionIdsByTarget(
              ReactionTargetType.COMMENT,
              commentId,
              transaction,
            );

          await this.reactionRepository.deleteReactionsByIds(
            commentReactionIds,
            transaction,
          );

          await this.commentRepository.deleteComment(commentId, transaction);
        }
        const postReactionIds =
          await this.reactionRepository.listReactionIdsByTarget(
            ReactionTargetType.POST,
            postId,
            transaction,
          );

        await this.reactionRepository.deleteReactionsByIds(
          postReactionIds,
          transaction,
        );
        await this.postRepository.deletePost(postId, transaction);
      }

      const userCommentIds =
        await this.commentRepository.listCommentIdsByAuthorId(uid, transaction);

      for (const commentId of userCommentIds) {
        const commentReactionIds =
          await this.reactionRepository.listReactionIdsByTarget(
            ReactionTargetType.COMMENT,
            commentId,
            transaction,
          );

        await this.reactionRepository.deleteReactionsByIds(
          commentReactionIds,
          transaction,
        );

        await this.commentRepository.deleteComment(commentId, transaction);
      }

      await this.userRepository.deleteUser(uid, transaction);
    });

    for (const url of photoUrlsToDelete) {
      await this.storageService.deleteFileByUrl(url);
    }

    await admin.auth().deleteUser(uid);
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
