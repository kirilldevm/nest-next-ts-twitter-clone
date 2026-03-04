import { Controller, Delete, Get, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard, type ReqUser } from 'src/auth/guard/auth.guard';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.userService.getUser(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  deleteUser(@Req() req: Request & { user: ReqUser }, @Param('id') id: string) {
    return this.userService.deleteUser(req.user.uid, id);
  }
}
