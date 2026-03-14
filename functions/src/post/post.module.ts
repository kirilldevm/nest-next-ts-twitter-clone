import { Module } from '@nestjs/common';
import { AlgoliaModule } from '../algolia/algolia.module';
import { UserModule } from '../user/user.module';
import { StorageService } from '../storage/storage.service';
import { PostController } from './post.controller';
import { PostRepository } from './repository/post.repository';
import { PostService } from './post.service';

@Module({
  imports: [AlgoliaModule, UserModule],
  controllers: [PostController],
  providers: [PostService, PostRepository, StorageService],
  exports: [PostService, PostRepository],
})
export class PostModule {}
