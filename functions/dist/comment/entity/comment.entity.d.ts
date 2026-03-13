export declare class Comment {
    id: string;
    postId: string;
    authorId: string;
    authorDisplayName: string;
    authorPhotoURL?: string | null;
    content: string;
    parentId: string | null;
    replyCount: number;
    likesCount: number;
    dislikesCount: number;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
