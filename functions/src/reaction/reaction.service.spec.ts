import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CommentRepository } from '../comment/repository/comment.repository';
import { PostRepository } from '../post/repository/post.repository';
import { ReactionTargetType, ReactionType } from './entity/reaction.entity';
import { ReactionService } from './reaction.service';
import { ReactionRepository } from './repository/reaction.repository';

jest.mock('firebase-admin', () => ({
  firestore: () => ({
    runTransaction: (cb: (tx: unknown) => Promise<unknown>) => cb({}),
  }),
}));

describe('ReactionService', () => {
  let service: ReactionService;
  let reactionRepo: jest.Mocked<ReactionRepository>;
  let postRepo: jest.Mocked<PostRepository>;
  let commentRepo: jest.Mocked<CommentRepository>;
  let setReactionMock: jest.Mock;
  let updatePostMock: jest.Mock;
  let deleteReactionMock: jest.Mock;
  let updateCommentMock: jest.Mock;

  const mockPost = {
    id: 'post-1',
    authorId: 'user-1',
    title: 'Test',
    text: 'Content',
    photoURL: null,
    createdAt: new Date(),
    likesCount: 0,
    dislikesCount: 0,
    commentsCount: 0,
  };

  const mockComment = {
    id: 'comment-1',
    postId: 'post-1',
    authorId: 'user-1',
    authorDisplayName: 'User',
    content: 'Comment',
    parentId: null,
    replyCount: 0,
    likesCount: 0,
    dislikesCount: 0,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    setReactionMock = jest.fn().mockResolvedValue(undefined);
    updatePostMock = jest.fn().mockResolvedValue(null);
    deleteReactionMock = jest.fn().mockResolvedValue(undefined);
    updateCommentMock = jest.fn().mockResolvedValue(undefined);

    const mockReactionRepo = {
      getReaction: jest.fn(),
      setReaction: setReactionMock,
      deleteReaction: deleteReactionMock,
    };
    const mockPostRepo = {
      getPost: jest.fn(),
      updatePost: updatePostMock,
    };
    const mockCommentRepo = {
      getComment: jest.fn(),
      updateComment: updateCommentMock,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReactionService,
        { provide: ReactionRepository, useValue: mockReactionRepo },
        { provide: PostRepository, useValue: mockPostRepo },
        { provide: CommentRepository, useValue: mockCommentRepo },
      ],
    }).compile();

    service = module.get<ReactionService>(ReactionService);
    reactionRepo = module.get(ReactionRepository);
    postRepo = module.get(PostRepository);
    commentRepo = module.get(CommentRepository);

    jest.clearAllMocks();
    postRepo.getPost = jest.fn().mockResolvedValue(mockPost);
    commentRepo.getComment = jest.fn().mockResolvedValue(mockComment);
    reactionRepo.getReaction = jest.fn().mockResolvedValue(null);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('setReaction (post)', () => {
    it('should add LIKE and increment likesCount', async () => {
      const result = await service.setReaction(
        'user-1',
        ReactionTargetType.POST,
        'post-1',
        ReactionType.LIKE,
      );

      expect(result).toEqual({
        type: ReactionType.LIKE,
        likesCount: 1,
        dislikesCount: 0,
      });
      expect(setReactionMock).toHaveBeenCalledWith(
        ReactionTargetType.POST,
        'post-1',
        'user-1',
        ReactionType.LIKE,
        expect.anything(),
      );
      expect(updatePostMock).toHaveBeenCalledWith(
        'post-1',
        { likesCount: 1, dislikesCount: 0 },
        expect.anything(),
      );
    });

    it('should add DISLIKE and increment dislikesCount', async () => {
      const result = await service.setReaction(
        'user-1',
        ReactionTargetType.POST,
        'post-1',
        ReactionType.DISLIKE,
      );

      expect(result).toEqual({
        type: ReactionType.DISLIKE,
        likesCount: 0,
        dislikesCount: 1,
      });
    });

    it('should toggle off when same reaction is set again', async () => {
      reactionRepo.getReaction = jest
        .fn()
        .mockResolvedValue({ type: ReactionType.LIKE });

      const result = await service.setReaction(
        'user-1',
        ReactionTargetType.POST,
        'post-1',
        ReactionType.LIKE,
      );

      expect(result).toEqual({ type: null, likesCount: 0, dislikesCount: 0 });
      expect(deleteReactionMock).toHaveBeenCalled();
    });

    it('should switch from LIKE to DISLIKE correctly', async () => {
      reactionRepo.getReaction = jest
        .fn()
        .mockResolvedValue({ type: ReactionType.LIKE });
      postRepo.getPost = jest.fn().mockResolvedValue({
        ...mockPost,
        likesCount: 5,
        dislikesCount: 2,
      });

      const result = await service.setReaction(
        'user-1',
        ReactionTargetType.POST,
        'post-1',
        ReactionType.DISLIKE,
      );

      expect(result).toEqual({
        type: ReactionType.DISLIKE,
        likesCount: 4,
        dislikesCount: 3,
      });
    });

    it('should throw NotFoundException when post not found', async () => {
      postRepo.getPost = jest.fn().mockResolvedValue(null);

      await expect(
        service.setReaction(
          'user-1',
          ReactionTargetType.POST,
          'missing',
          ReactionType.LIKE,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('setReaction (comment)', () => {
    it('should update comment when target is comment', async () => {
      const result = await service.setReaction(
        'user-1',
        ReactionTargetType.COMMENT,
        'comment-1',
        ReactionType.LIKE,
      );

      expect(result.likesCount).toBe(1);
      expect(updateCommentMock).toHaveBeenCalledWith(
        'comment-1',
        { likesCount: 1, dislikesCount: 0 },
        expect.anything(),
      );
    });

    it('should throw NotFoundException when comment not found', async () => {
      commentRepo.getComment = jest.fn().mockResolvedValue(null);

      await expect(
        service.setReaction(
          'user-1',
          ReactionTargetType.COMMENT,
          'missing',
          ReactionType.LIKE,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getReaction', () => {
    it('should return reaction type when exists', async () => {
      reactionRepo.getReaction = jest
        .fn()
        .mockResolvedValue({ type: ReactionType.LIKE });

      const result = await service.getReaction(
        'user-1',
        ReactionTargetType.POST,
        'post-1',
      );

      expect(result).toBe(ReactionType.LIKE);
    });

    it('should return null when no reaction', async () => {
      reactionRepo.getReaction = jest.fn().mockResolvedValue(null);

      const result = await service.getReaction(
        'user-1',
        ReactionTargetType.POST,
        'post-1',
      );

      expect(result).toBeNull();
    });
  });
});
