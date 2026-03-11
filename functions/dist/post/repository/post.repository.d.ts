import { Post } from '../entity/post.entity';
export declare class PostRepository {
    private postsDb;
    private mapDoc;
    getPost(id: string): Promise<Post | null>;
    createPost(data: Omit<Post, 'id'>): Promise<Post>;
    updatePost(id: string, data: Partial<Post>): Promise<Post | null>;
    deletePost(id: string): Promise<void>;
    listPosts(options: {
        authorId?: string;
        limit?: number;
        cursor?: string;
    }): Promise<{
        items: Post[];
        nextCursor: string | null;
    }>;
}
