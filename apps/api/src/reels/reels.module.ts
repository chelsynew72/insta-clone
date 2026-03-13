import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReelsController } from './reels.controller';
import { ReelsService } from './reels.service';
import { Reel, ReelSchema } from './schemas/reel.schema';
import { UsersModule } from '../users/users.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Reel.name, schema: ReelSchema }]),
    UsersModule,
    CloudinaryModule,
  ],
  controllers: [ReelsController],
  providers: [ReelsService],
})
export class ReelsModule {}