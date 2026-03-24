import { Module } from '@nestjs/common';
import { CommentModule } from '../comment/comment.module';
import { PostModule } from '../post/post.module';
import { ReactionType } from './entity/reaction.entity';
import { ReactionController } from './reaction.controller';
import { ReactionService } from './reaction.service';
import { ReactionRepository } from './repository/reaction.repository';

export type SetReactionResult = {
  type: ReactionType | null;
  likesCount: number;
  dislikesCount: number;
};

@Module({
  imports: [PostModule, CommentModule],
  controllers: [ReactionController],
  providers: [ReactionService, ReactionRepository],
  exports: [ReactionService, ReactionRepository],
})
export class ReactionModule {}
