export enum ReactionType {
  LIKE = 'like',
  DISLIKE = 'dislike',
}
export enum ReactionTargetType {
  POST = 'post',
  COMMENT = 'comment',
}

export type SetReactionParams = {
  targetId: string;
  targetType: ReactionTargetType;
  type: ReactionType;
};

export type SetReactionResult = {
  type: ReactionType | null;
  likesCount: number;
  dislikesCount: number;
};
