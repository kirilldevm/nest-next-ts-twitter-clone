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
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(AuthGuard)
  createPost(@Req() req: ReqUser, @Body() createPostDto: CreatePostDto) {
    return this.postService.createPost(req.user.uid, createPostDto);
  }

  @Get()
  listPosts(
    @Query('authorId') authorId?: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
    @Query('sortBy') sortBy?: string,
  ) {
    return this.postService.listPosts({
      authorId: authorId || undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      cursor: cursor || undefined,
      sortBy:
        sortBy === 'createdAt' || sortBy === 'engagement'
          ? sortBy
          : 'engagement',
    });
  }

  @Get('search')
  searchPosts(
    @Query('q') query?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 0;
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.postService.searchPosts(query ?? '', {
      page: Number.isNaN(pageNum) ? 0 : pageNum,
      limit: limitNum !== undefined && Number.isNaN(limitNum)
        ? undefined
        : limitNum,
    });
  }

  @Get(':id')
  getPost(@Param('id') id: string) {
    return this.postService.getPost(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  updatePost(
    @Param('id') id: string,
    @Req() req: ReqUser,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postService.updatePost(id, req.user.uid, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  deletePost(@Param('id') id: string, @Req() req: ReqUser) {
    return this.postService.deletePost(id, req.user.uid);
  }
}
