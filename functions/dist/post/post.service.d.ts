import { StorageService } from '../storage/storage.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostRepository } from './repository/post.repository';
export declare class PostService {
    private readonly postRepository;
    private readonly storageService;
    constructor(postRepository: PostRepository, storageService: StorageService);
    createPost(authorId: string, dto: CreatePostDto): Promise<import("./entity/post.entity").Post>;
    getPost(id: string): Promise<import("./entity/post.entity").Post>;
    listPosts(options: {
        authorId?: string;
        limit?: number;
        cursor?: string;
    }): Promise<{
        items: import("./entity/post.entity").Post[];
        nextCursor: string | null;
    }>;
    updatePost(postId: string, userId: string, dto: UpdatePostDto): Promise<import("./entity/post.entity").Post | null>;
    deletePost(postId: string, userId: string): Promise<void>;
}
