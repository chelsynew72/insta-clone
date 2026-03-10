import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';
import { Like, LikeSchema } from './schemas/like.schema';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
    PostsModule,
  ],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}