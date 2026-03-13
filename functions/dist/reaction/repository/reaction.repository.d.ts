import type { FirestoreTransaction } from 'src/types/firestore.type';
import { ReactionTargetType, ReactionType } from '../entity/reaction.entity';
export declare class ReactionRepository {
    private reactionsDb;
    getReaction(targetType: ReactionTargetType, targetId: string, userId: string, transaction?: FirestoreTransaction): Promise<{
        type: ReactionType;
    } | null>;
    setReaction(targetType: ReactionTargetType, targetId: string, userId: string, type: ReactionType, transaction?: FirestoreTransaction): Promise<void>;
    deleteReaction(targetType: ReactionTargetType, targetId: string, userId: string, transaction?: FirestoreTransaction): Promise<void>;
}
