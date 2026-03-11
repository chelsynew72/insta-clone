import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StoriesController } from './stories.controller';
import { StoriesService } from './stories.service';
import { Story, StorySchema } from './schemas/story.schema';
import { GatewayModule } from '../gateway/gateway.module';
import { FollowsModule } from '../follows/follows.module'; 
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Story.name, schema: StorySchema }]),
    GatewayModule,
    FollowsModule,
    UsersModule,
  ],
  controllers: [StoriesController],
  providers: [StoriesService],
  exports: [StoriesService],
})
export class StoriesModule {}