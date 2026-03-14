import { type ReqUser } from '../auth/guard/auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostService } from './post.service';
export declare class PostController {
    private readonly postService;
    constructor(postService: PostService);
    createPost(req: ReqUser, createPostDto: CreatePostDto): Promise<import("./entity/post.entity").Post>;
    listPosts(authorId?: string, limit?: string, cursor?: string, sortBy?: string): Promise<{
        items: import("./entity/post.entity").Post[];
        nextCursor: string | null;
    }>;
    searchPosts(query?: string, page?: string, limit?: string): Promise<{
        items: import("./post.service").SearchPostItem[];
        nextPage: number | null;
        totalHits?: number;
    }>;
    getPost(id: string): Promise<import("./entity/post.entity").Post>;
    updatePost(id: string, req: ReqUser, updatePostDto: UpdatePostDto): Promise<import("./entity/post.entity").Post | null>;
    deletePost(id: string, req: ReqUser): Promise<void>;
}
