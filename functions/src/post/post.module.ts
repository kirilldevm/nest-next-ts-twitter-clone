import { forwardRef, Module } from '@nestjs/common';
import { AlgoliaModule } from '../algolia/algolia.module';
import { StorageService } from '../storage/storage.service';
import { UserModule } from '../user/user.module';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PostRepository } from './repository/post.repository';

@Module({
  imports: [AlgoliaModule, forwardRef(() => UserModule)],
  controllers: [PostController],
  providers: [PostService, PostRepository, StorageService],
  exports: [PostService, PostRepository, StorageService],
})
export class PostModule {}
