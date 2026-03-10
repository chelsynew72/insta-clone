import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // POST /api/v1/auth/register
  // Step 1: Firebase creates user → Step 2: we save to MongoDB
  @Post('register')
  @UseGuards(FirebaseAuthGuard)
  async register(@Req() req, @Body() body: { username: string }) {
    const { uid, email } = req.user;
    return this.authService.register(uid, email, body.username);
  }

  // POST /api/v1/auth/login
  // Firebase already verified the password — we just return the MongoDB profile
  @Post('login')
  @UseGuards(FirebaseAuthGuard)
  async login(@Req() req) {
    return this.authService.getMe(req.user.uid);
  }

  // GET /api/v1/auth/me
  // Returns current logged-in user profile
  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  async getMe(@Req() req) {
    return this.authService.getMe(req.user.uid);
  }

  // POST /api/v1/auth/logout
  // Firebase handles logout on frontend — we just acknowledge it
  @Post('logout')
  @UseGuards(FirebaseAuthGuard)
  async logout() {
    return { message: 'Logged out successfully' };
  }
}