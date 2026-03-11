import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
