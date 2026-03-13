import { type ReqUser } from '../auth/guard/auth.guard';
import { SetReactionDto } from './dto/set-reaction.dto';
import { ReactionTargetType } from './entity/reaction.entity';
import { ReactionService } from './reaction.service';
export declare class ReactionController {
    private readonly reactionService;
    constructor(reactionService: ReactionService);
    setReaction(req: ReqUser, dto: SetReactionDto): Promise<import("../types").SetReactionResult>;
    getReaction(req: ReqUser, targetType: ReactionTargetType, targetId: string): Promise<{
        type: import("./entity/reaction.entity").ReactionType | null;
    }> | {
        type: null;
    };
}
