import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private firebaseService: FirebaseService,
  ) {}

  async register(uid: string, email: string, username: string) {
    const user = await this.usersService.findOrCreate(uid, email, username);
    return { message: 'User registered successfully', user };
  }

  async getMe(uid: string) {
    const user = await this.usersService.findByUid(uid);
    return { user };
  }

  async forgotPassword(email: string) {
    try {
      await this.firebaseService.getAuth().getUserByEmail(email);
      // Generate password reset link (simulate email sending)
      const link = await this.firebaseService.getAuth().generatePasswordResetLink(email);
      console.log(`Password reset link for ${email}: ${link}`);
      return { message: 'Password reset link generated. Please check your console (simulated email).' };
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        throw new NotFoundException('User with this email not found');
      }
      throw err;
    }
  }

  async resetPassword(email: string, newPassword: string) {
    try {
      const user = await this.firebaseService.getAuth().getUserByEmail(email);
      await this.firebaseService.getAuth().updateUser(user.uid, {
        password: newPassword,
      });
      return { message: 'Password updated successfully' };
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        throw new NotFoundException('User with this email not found');
      }
      throw err;
    }
  }
}