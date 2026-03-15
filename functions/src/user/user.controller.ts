import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, type ReqUser } from 'src/auth/guard/auth.guard';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.userService.getUser(id);
  }

  @Post('send-verification-email')
  @UseGuards(AuthGuard)
  sendVerificationEmail(@Req() req: ReqUser) {
    return this.userService.sendVerificationEmail(req.user.uid);
  }

  @Patch('')
  @UseGuards(AuthGuard)
  updateUser(@Req() req: ReqUser, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(req.user.uid, updateUserDto);
  }

  @Delete('')
  @UseGuards(AuthGuard)
  deleteUser(@Req() req: ReqUser) {
    return this.userService.deleteUser(req.user.uid);
  }
}
