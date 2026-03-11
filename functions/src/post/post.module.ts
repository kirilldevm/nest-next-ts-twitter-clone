import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostRepository } from './repository/post.repository';
import { PostService } from './post.service';

@Module({
  controllers: [PostController],
  providers: [PostService, PostRepository],
  exports: [PostService],
})
export class PostModule {}
