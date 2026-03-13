export enum ReactionTargetType {
  POST = 'post',
  COMMENT = 'comment',
}
export enum ReactionType {
  LIKE = 'like',
  DISLIKE = 'dislike',
}

export class Reaction {
  id!: string;
  userId!: string;
  targetType!: ReactionTargetType;
  targetId!: string;
  type!: ReactionType;
  createdAt!: Date;
}
