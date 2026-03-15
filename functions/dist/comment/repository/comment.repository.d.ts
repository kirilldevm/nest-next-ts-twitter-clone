import { FirestoreTransaction } from 'src/types';
import { Comment } from '../entity/comment.entity';
export declare class CommentRepository {
    private commentsDb;
    private mapDoc;
    getComment(id: string, transaction?: FirestoreTransaction): Promise<Comment | null>;
    createComment(data: Omit<Comment, 'id'>, transaction?: FirestoreTransaction): Promise<Comment>;
    updateComment(id: string, data: Partial<Pick<Comment, 'content' | 'isDeleted' | 'likesCount' | 'dislikesCount' | 'replyCount' | 'authorDisplayName' | 'authorPhotoURL'>>, transaction?: FirestoreTransaction): Promise<void>;
    deleteComment(id: string, transaction?: FirestoreTransaction): Promise<void>;
    listCommentIdsByAuthorId(authorId: string, transaction?: FirestoreTransaction): Promise<string[]>;
    listCommentIdsByPostId(postId: string, transaction?: FirestoreTransaction): Promise<string[]>;
    listComments(options: {
        postId: string;
        parentId: string | null;
        limit?: number;
        cursor?: string;
    }): Promise<{
        items: Comment[];
        nextCursor: string | null;
    }>;
}
