import type { Post } from '../post/entity/post.entity';
export type SearchPostsResult = {
    items: Post[];
    nextPage: number | null;
    totalHits?: number;
};
export declare class AlgoliaService {
    private get client();
    private get indexName();
    searchPosts(query: string, options?: {
        page?: number;
        limit?: number;
    }): Promise<SearchPostsResult>;
    private mapHitToPost;
}
