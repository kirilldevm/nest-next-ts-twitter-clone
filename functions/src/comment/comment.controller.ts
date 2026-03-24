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
import { type Request } from 'express';
import { AuthGuard } from '../auth/guard/auth.guard';
import { VerifiedEmailGuard } from '../auth/guard/verified-email.guard';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentAuthorGuard } from './guard/comment-author.guard';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(AuthGuard, VerifiedEmailGuard)
  createComment(
    @Req() req: Request,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const user = req.user!;
    const displayName = user.name || user.email?.split('@')[0] || 'Anonymous';
    return this.commentService.createComment(
      user.uid,
      displayName,
      user.picture ?? null,
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
  @UseGuards(AuthGuard, VerifiedEmailGuard, CommentAuthorGuard)
  updateComment(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.updateComment(id, updateCommentDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, VerifiedEmailGuard, CommentAuthorGuard)
  deleteComment(@Param('id') id: string) {
    return this.commentService.deleteComment(id);
  }
}
