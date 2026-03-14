import { Test, TestingModule } from '@nestjs/testing';
import { AlgoliaService } from './algolia.service';

const mockSearchSingleIndex = jest.fn();

jest.mock('algoliasearch', () => ({
  algoliasearch: () => ({
    searchSingleIndex: mockSearchSingleIndex,
  }),
}));

describe('AlgoliaService', () => {
  let service: AlgoliaService;

  const originalEnv = process.env;

  beforeEach(async () => {
    process.env = {
      ...originalEnv,
      ALGOLIA_APP_ID: 'test-app-id',
      ALGOLIA_ADMIN_API_KEY: 'test-key',
      ALGOLIA_INDEX_NAME: 'posts',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AlgoliaService],
    }).compile();

    service = module.get<AlgoliaService>(AlgoliaService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchPosts', () => {
    it('should return mapped posts from Algolia hits', async () => {
      mockSearchSingleIndex.mockResolvedValue({
        hits: [
          {
            objectID: 'post-1',
            authorId: 'user-1',
            title: 'Title',
            text: 'Text',
            photoURL: null,
            createdAt: '2025-01-15T12:00:00.000Z',
            likesCount: 0,
            dislikesCount: 0,
            commentsCount: 0,
          },
        ],
        nbPages: 1,
        nbHits: 1,
      });

      const result = await service.searchPosts('test', { page: 0, limit: 10 });

      expect(mockSearchSingleIndex).toHaveBeenCalledWith(
        expect.objectContaining({
          indexName: 'posts',
          searchParams: expect.objectContaining({
            query: 'test',
            page: 0,
            hitsPerPage: 10,
          }),
        }),
      );
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({
        id: 'post-1',
        authorId: 'user-1',
        title: 'Title',
        text: 'Text',
      });
      expect(result.nextPage).toBeNull();
      expect(result.totalHits).toBe(1);
    });

    it('should parse Firestore timestamp format (_seconds)', async () => {
      const epochSeconds = 1736942400;
      mockSearchSingleIndex.mockResolvedValue({
        hits: [
          {
            objectID: 'p1',
            authorId: 'u1',
            title: '',
            text: '',
            photoURL: null,
            createdAt: { _seconds: epochSeconds, _nanoseconds: 0 },
            likesCount: 0,
            dislikesCount: 0,
            commentsCount: 0,
          },
        ],
        nbPages: 1,
        nbHits: 1,
      });

      const result = await service.searchPosts('q');

      expect(result.items[0].createdAt).toEqual(new Date(epochSeconds * 1000));
    });

    it('should parse Unix timestamp (seconds)', async () => {
      const epochSeconds = 1736942400;
      mockSearchSingleIndex.mockResolvedValue({
        hits: [
          {
            objectID: 'p1',
            authorId: 'u1',
            title: '',
            text: '',
            photoURL: null,
            createdAt: epochSeconds,
            likesCount: 0,
            dislikesCount: 0,
            commentsCount: 0,
          },
        ],
        nbPages: 1,
        nbHits: 1,
      });

      const result = await service.searchPosts('q');

      expect(result.items[0].createdAt).toEqual(new Date(epochSeconds * 1000));
    });

    it('should return nextPage when more pages exist', async () => {
      mockSearchSingleIndex.mockResolvedValue({
        hits: [],
        nbPages: 3,
        nbHits: 25,
      });

      const result = await service.searchPosts('q', { page: 0, limit: 10 });

      expect(result.nextPage).toBe(1);
    });

    it('should throw when Algolia not configured', async () => {
      delete process.env.ALGOLIA_APP_ID;
      delete process.env.ALGOLIA_ADMIN_API_KEY;

      const module2 = await Test.createTestingModule({
        providers: [AlgoliaService],
      }).compile();
      const svc = module2.get<AlgoliaService>(AlgoliaService);

      await expect(svc.searchPosts('q')).rejects.toThrow(
        'Algolia is not configured',
      );
    });
  });
});
