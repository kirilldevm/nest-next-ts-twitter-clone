import { SetReactionResult } from 'src/types/reaction.type';
import { CommentRepository } from '../comment/repository/comment.repository';
import { PostRepository } from '../post/repository/post.repository';
import { ReactionTargetType, ReactionType } from './entity/reaction.entity';
import { ReactionRepository } from './repository/reaction.repository';
export declare class ReactionService {
    private readonly reactionRepository;
    private readonly postRepository;
    private readonly commentRepository;
    constructor(reactionRepository: ReactionRepository, postRepository: PostRepository, commentRepository: CommentRepository);
    setReaction(userId: string, targetType: ReactionTargetType, targetId: string, type: ReactionType): Promise<SetReactionResult>;
    getReaction(userId: string, targetType: ReactionTargetType, targetId: string): Promise<ReactionType | null>;
}
