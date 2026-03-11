import { Controller, Get, Param, Req, UseGuards, Put, Body, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // GET /api/v1/users/suggested
  @Get('suggested')
  @UseGuards(FirebaseAuthGuard)
  async getSuggested(@Req() req: any) {
    return this.usersService.getSuggestedUsers(req.user.uid);
  }

  // GET /api/v1/users/search?q=username
  @Get('search')
  @UseGuards(FirebaseAuthGuard)
  async search(@Query('q') q: string) {
    return this.usersService.searchUsers(q);
  }

  // GET /api/v1/users/:uid
  @Get(':uid')
  @UseGuards(FirebaseAuthGuard)
  async getUser(@Param('uid') uid: string) {
    const user = await this.usersService.findByUid(uid);
    return { user };
  }

  // PUT /api/v1/users/me
  @Put('me')
  @UseGuards(FirebaseAuthGuard)
  async updateProfile(@Req() req: any, @Body() body: any) {
    const user = await this.usersService.updateProfile(req.user.uid, body);
    return { user };
  }
}