import { Module } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { PostController } from './post.controller';
import { PostRepository } from './repository/post.repository';
import { PostService } from './post.service';

@Module({
  controllers: [PostController],
  providers: [PostService, PostRepository, StorageService],
  exports: [PostService, PostRepository],
})
export class PostModule {}
