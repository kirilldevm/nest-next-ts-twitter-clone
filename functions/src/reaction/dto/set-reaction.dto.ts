import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { ReactionTargetType, ReactionType } from '../entity/reaction.entity';

export class SetReactionDto {
  @IsString()
  @IsNotEmpty()
  targetId!: string;

  @IsIn(Object.values(ReactionTargetType))
  targetType!: ReactionTargetType;

  @IsIn(Object.values(ReactionType))
  type!: ReactionType;
}
