import { Module } from '@nestjs/common';
import { PostModule } from '../post/post.module';
import { CommentAuthorGuard } from './guard/comment-author.guard';
import { CommentController } from './comment.controller';
import { CommentRepository } from './repository/comment.repository';
import { CommentService } from './comment.service';

@Module({
  imports: [PostModule],
  controllers: [CommentController],
  providers: [CommentService, CommentRepository, CommentAuthorGuard],
  exports: [CommentService, CommentRepository],
})
export class CommentModule {}
