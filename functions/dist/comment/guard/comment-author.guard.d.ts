import { CanActivate, ExecutionContext } from '@nestjs/common';
import { CommentRepository } from '../repository/comment.repository';
export declare class CommentAuthorGuard implements CanActivate {
    private readonly commentRepository;
    constructor(commentRepository: CommentRepository);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
