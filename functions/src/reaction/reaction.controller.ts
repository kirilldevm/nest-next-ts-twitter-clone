import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, type ReqUser } from '../auth/guard/auth.guard';
import { SetReactionDto } from './dto/set-reaction.dto';
import { ReactionTargetType } from './entity/reaction.entity';
import { ReactionService } from './reaction.service';

@Controller('reaction')
export class ReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  @Post()
  @UseGuards(AuthGuard)
  setReaction(@Req() req: ReqUser, @Body() dto: SetReactionDto) {
    return this.reactionService.setReaction(
      req.user.uid,
      dto.targetType,
      dto.targetId,
      dto.type,
    );
  }

  @Get()
  @UseGuards(AuthGuard)
  getReaction(
    @Req() req: ReqUser,
    @Query('targetType') targetType: ReactionTargetType,
    @Query('targetId') targetId: string,
  ) {
    if (!targetType || !targetId) {
      return { type: null };
    }
    if (
      targetType !== ReactionTargetType.POST &&
      targetType !== ReactionTargetType.COMMENT
    ) {
      return { type: null };
    }

    return this.reactionService
      .getReaction(req.user.uid, targetType, targetId)
      .then((type) => ({ type }));
  }
}
