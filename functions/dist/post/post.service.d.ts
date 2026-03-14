import { AlgoliaService } from '../algolia/algolia.service';
import { StorageService } from '../storage/storage.service';
import { UserRepository } from '../user/repository/user.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import type { Post } from './entity/post.entity';
import { PostRepository } from './repository/post.repository';
export type SearchPostItem = Post & {
    author?: {
        displayName: string;
        photoURL: string | null;
    };
};
export declare class PostService {
    private readonly postRepository;
    private readonly storageService;
    private readonly algoliaService;
    private readonly userRepository;
    constructor(postRepository: PostRepository, storageService: StorageService, algoliaService: AlgoliaService, userRepository: UserRepository);
    createPost(authorId: string, dto: CreatePostDto): Promise<Post>;
    getPost(id: string): Promise<Post>;
    listPosts(options: {
        authorId?: string;
        limit?: number;
        cursor?: string;
        sortBy?: 'createdAt' | 'engagement';
    }): Promise<{
        items: Post[];
        nextCursor: string | null;
    }>;
    searchPosts(query: string, options?: {
        page?: number;
        limit?: number;
    }): Promise<{
        items: SearchPostItem[];
        nextPage: number | null;
        totalHits?: number;
    }>;
    updatePost(postId: string, userId: string, dto: UpdatePostDto): Promise<Post | null>;
    deletePost(postId: string, userId: string): Promise<void>;
}
