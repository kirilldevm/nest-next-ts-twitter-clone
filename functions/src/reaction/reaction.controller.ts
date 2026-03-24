import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { type Request } from 'express';
import { AuthGuard } from '../auth/guard/auth.guard';
import { VerifiedEmailGuard } from '../auth/guard/verified-email.guard';
import { SetReactionDto } from './dto/set-reaction.dto';
import { ReactionTargetType } from './entity/reaction.entity';
import { ReactionService } from './reaction.service';

@Controller('reaction')
export class ReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  @Post()
  @UseGuards(AuthGuard, VerifiedEmailGuard)
  setReaction(@Req() req: Request, @Body() dto: SetReactionDto) {
    return this.reactionService.setReaction(
      req.user!.uid,
      dto.targetType,
      dto.targetId,
      dto.type,
    );
  }

  @Get()
  @UseGuards(AuthGuard)
  getReaction(
    @Req() req: Request,
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
      .getReaction(req.user!.uid, targetType, targetId)
      .then((type) => ({ type }));
  }
}
