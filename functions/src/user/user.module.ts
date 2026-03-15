import { forwardRef, Module } from '@nestjs/common';
import { CommentModule } from '../comment/comment.module';
import { EmailModule } from '../email/email.module';
import { PostModule } from '../post/post.module';
import { ReactionModule } from '../reaction/reaction.module';
import { UserRepository } from './repository/user.repository';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    EmailModule,
    forwardRef(() => PostModule),
    forwardRef(() => CommentModule),
    forwardRef(() => ReactionModule),
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserRepository],
})
export class UserModule {}
