import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AlgoliaService } from '../algolia/algolia.service';
import { StorageService } from '../storage/storage.service';
import { UserRepository } from '../user/repository/user.repository';
import type { Post } from './entity/post.entity';
import { PostService, SearchPostItem } from './post.service';
import { PostRepository } from './repository/post.repository';

describe('PostService', () => {
  let service: PostService;
  let getPostMock: jest.Mock;
  let createPostMock: jest.Mock;
  let listPostsMock: jest.Mock;
  let updatePostMock: jest.Mock;
  let deletePostMock: jest.Mock;
  let searchPostsMock: jest.Mock;
  let getUserMock: jest.Mock;
  let deleteFileByUrlMock: jest.Mock;

  const mockPost: Post = {
    id: 'post-1',
    authorId: 'user-1',
    title: 'Test Post',
    text: 'Content',
    photoURL: null,
    createdAt: new Date(),
    likesCount: 0,
    dislikesCount: 0,
    commentsCount: 0,
  };

  beforeEach(async () => {
    getPostMock = jest.fn();
    createPostMock = jest.fn();
    listPostsMock = jest.fn();
    updatePostMock = jest.fn();
    deletePostMock = jest.fn();
    searchPostsMock = jest.fn();
    getUserMock = jest.fn();
    deleteFileByUrlMock = jest.fn();

    const mockPostRepo = {
      getPost: getPostMock,
      createPost: createPostMock,
      updatePost: updatePostMock,
      deletePost: deletePostMock,
      listPosts: listPostsMock,
    };
    const mockAlgoliaService = {
      searchPosts: searchPostsMock,
    };
    const mockUserRepo = {
      getUser: getUserMock,
    };
    const mockStorageService = {
      deleteFileByUrl: deleteFileByUrlMock,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        { provide: PostRepository, useValue: mockPostRepo },
        { provide: AlgoliaService, useValue: mockAlgoliaService },
        { provide: UserRepository, useValue: mockUserRepo },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    service = module.get<PostService>(PostService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPost', () => {
    it('should create a post', async () => {
      createPostMock.mockResolvedValue(mockPost);

      const result = await service.createPost('user-1', {
        title: 'Test',
        text: 'Content',
      });

      expect(createPostMock).toHaveBeenCalledWith(
        expect.objectContaining({
          authorId: 'user-1',
          title: 'Test',
          text: 'Content',
          likesCount: 0,
          dislikesCount: 0,
          commentsCount: 0,
        }),
      );
      expect(result).toEqual(mockPost);
    });
  });

  describe('getPost', () => {
    it('should return a post when found', async () => {
      getPostMock.mockResolvedValue(mockPost);

      const result = await service.getPost('post-1');

      expect(getPostMock).toHaveBeenCalledWith('post-1');
      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException when post not found', async () => {
      getPostMock.mockResolvedValue(null);

      await expect(service.getPost('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('listPosts', () => {
    it('should delegate to repository', async () => {
      const items = [mockPost];
      listPostsMock.mockResolvedValue({ items, nextCursor: null });

      const result = await service.listPosts({ limit: 10 });

      expect(listPostsMock).toHaveBeenCalledWith({
        limit: 10,
      });
      expect(result.items).toEqual(items);
    });
  });

  describe('searchPosts', () => {
    it('should throw BadRequestException for empty query', async () => {
      await expect(service.searchPosts('')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.searchPosts('   ')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should enrich search results with author data', async () => {
      searchPostsMock.mockResolvedValue({
        items: [
          {
            id: 'post-1',
            authorId: 'user-1',
            title: 'A',
            text: '',
            photoURL: null,
            createdAt: new Date(),
            likesCount: 0,
            dislikesCount: 0,
            commentsCount: 0,
          },
        ],
        nextPage: null,
        totalHits: 1,
      });
      getPostMock.mockResolvedValue(mockPost);
      getUserMock.mockResolvedValue({
        id: 'user-1',
        email: 'a@b.com',
        firstName: 'John',
        lastName: 'Doe',
        photoURL: null,
      });

      const result = await service.searchPosts('test');

      expect(searchPostsMock).toHaveBeenCalled();
      expect(searchPostsMock).toHaveBeenCalledWith('test', undefined);
      expect(getPostMock).toHaveBeenCalledWith('post-1');
      expect(getUserMock).toHaveBeenCalledWith('user-1');
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({
        id: 'post-1',
        author: { displayName: 'John Doe', photoURL: null },
      } as Partial<SearchPostItem>);
    });

    it('should throw BadRequestException when Algolia not configured', async () => {
      searchPostsMock.mockRejectedValue(new Error('Algolia is not configured'));

      await expect(service.searchPosts('q')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updatePost', () => {
    it('should throw NotFoundException when post not found', async () => {
      getPostMock.mockResolvedValue(null);

      await expect(
        service.updatePost('missing', 'user-1', { title: 'New' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not author', async () => {
      getPostMock.mockResolvedValue(mockPost);

      await expect(
        service.updatePost('post-1', 'other-user', { title: 'New' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should update post when user is author', async () => {
      const updated = { ...mockPost, title: 'Updated' };
      getPostMock.mockResolvedValue(mockPost);
      updatePostMock.mockResolvedValue(updated);

      const result = await service.updatePost('post-1', 'user-1', {
        title: 'Updated',
      });

      expect(updatePostMock).toHaveBeenCalledWith('post-1', {
        title: 'Updated',
      });
      expect(result).toEqual(updated);
    });
  });

  describe('deletePost', () => {
    it('should throw NotFoundException when post not found', async () => {
      getPostMock.mockResolvedValue(null);

      await expect(service.deletePost('missing', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user is not author', async () => {
      getPostMock.mockResolvedValue(mockPost);

      await expect(service.deletePost('post-1', 'other-user')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should delete post and remove photo when user is author', async () => {
      const postWithPhoto = {
        ...mockPost,
        photoURL: 'https://example.com/img.png',
      };
      getPostMock.mockResolvedValue(postWithPhoto);
      deletePostMock.mockResolvedValue(undefined);
      deleteFileByUrlMock.mockResolvedValue(undefined);

      await service.deletePost('post-1', 'user-1');

      expect(deleteFileByUrlMock).toHaveBeenCalledWith(
        'https://example.com/img.png',
      );
      expect(deletePostMock).toHaveBeenCalledWith('post-1');
    });
  });
});
