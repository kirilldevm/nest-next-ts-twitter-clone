import { Module } from '@nestjs/common';
import { PostModule } from '../post/post.module';
import { ReactionController } from './reaction.controller';
import { ReactionRepository } from './repository/reaction.repository';
import { ReactionService } from './reaction.service';

@Module({
  imports: [PostModule],
  controllers: [ReactionController],
  providers: [ReactionService, ReactionRepository],
  exports: [ReactionService],
})
export class ReactionModule {}
