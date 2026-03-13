import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LiveController } from './live.controller';
import { LiveService } from './live.service';
import { LiveSession, LiveSessionSchema } from './schemas/live-session.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LiveSession.name, schema: LiveSessionSchema }]),
    UsersModule,
  ],
  controllers: [LiveController],
  providers: [LiveService],
  exports: [LiveService],
})
export class LiveModule {}