import { ReactionType } from 'src/reaction/entity/reaction.entity';
export type SetReactionResult = {
    type: ReactionType | null;
    likesCount: number;
    dislikesCount: number;
};
