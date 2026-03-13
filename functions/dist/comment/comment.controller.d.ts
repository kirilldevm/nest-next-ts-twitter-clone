import { type ReqUser } from '../auth/guard/auth.guard';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
export declare class CommentController {
    private readonly commentService;
    constructor(commentService: CommentService);
    createComment(req: ReqUser, createCommentDto: CreateCommentDto): Promise<import("./entity/comment.entity").Comment>;
    listComments(postId: string, parentId?: string, limit?: string, cursor?: string): Promise<{
        items: import("./entity/comment.entity").Comment[];
        nextCursor: string | null;
    }> | {
        items: never[];
        nextCursor: null;
    };
    getComment(id: string): Promise<import("./entity/comment.entity").Comment>;
    updateComment(id: string, updateCommentDto: UpdateCommentDto): Promise<import("./entity/comment.entity").Comment>;
    deleteComment(id: string): Promise<void>;
}
