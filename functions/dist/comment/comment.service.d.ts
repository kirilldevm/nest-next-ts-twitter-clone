import { PostRepository } from '../post/repository/post.repository';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entity/comment.entity';
import { CommentRepository } from './repository/comment.repository';
export declare class CommentService {
    private readonly commentRepository;
    private readonly postRepository;
    constructor(commentRepository: CommentRepository, postRepository: PostRepository);
    createComment(authorId: string, authorDisplayName: string, authorPhotoURL: string | null, dto: CreateCommentDto): Promise<Comment>;
    getComment(id: string): Promise<Comment>;
    listComments(options: {
        postId: string;
        parentId?: string | null;
        limit?: number;
        cursor?: string;
    }): Promise<{
        items: Comment[];
        nextCursor: string | null;
    }>;
    updateComment(id: string, dto: UpdateCommentDto): Promise<Comment>;
    deleteComment(id: string): Promise<void>;
}
