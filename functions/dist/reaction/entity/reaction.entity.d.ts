export declare enum ReactionTargetType {
    POST = "post",
    COMMENT = "comment"
}
export declare enum ReactionType {
    LIKE = "like",
    DISLIKE = "dislike"
}
export declare class Reaction {
    id: string;
    userId: string;
    targetType: ReactionTargetType;
    targetId: string;
    type: ReactionType;
    createdAt: Date;
}
