import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async register(uid: string, email: string, username: string) {
    const user = await this.usersService.findOrCreate(uid, email, username);
    return { message: 'User registered successfully', user };
  }

  async getMe(uid: string) {
    const user = await this.usersService.findByUid(uid);
    return { user };
  }
}