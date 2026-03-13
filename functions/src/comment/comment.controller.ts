import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, type ReqUser } from '../auth/guard/auth.guard';
import { CommentAuthorGuard } from './guard/comment-author.guard';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(AuthGuard)
  createComment(
    @Req() req: ReqUser,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const displayName =
      req.user.displayName || req.user.email?.split('@')[0] || 'Anonymous';
    return this.commentService.createComment(
      req.user.uid,
      displayName,
      req.user.photoURL ?? null,
      createCommentDto,
    );
  }

  @Get()
  listComments(
    @Query('postId') postId: string,
    @Query('parentId') parentId?: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    if (!postId) {
      return { items: [], nextCursor: null };
    }
    return this.commentService.listComments({
      postId,
      parentId: parentId === undefined ? null : parentId || null,
      limit: limit ? parseInt(limit, 10) : undefined,
      cursor: cursor || undefined,
    });
  }

  @Get(':id')
  getComment(@Param('id') id: string) {
    return this.commentService.getComment(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, CommentAuthorGuard)
  updateComment(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.updateComment(id, updateCommentDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, CommentAuthorGuard)
  deleteComment(@Param('id') id: string) {
    return this.commentService.deleteComment(id);
  }
}
