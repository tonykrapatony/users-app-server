import { forwardRef, Module } from '@nestjs/common';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Friend, FriendsSchema } from './schema/friends.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [FriendsController],
  providers: [FriendsService],
  imports: [
    MongooseModule.forFeature([{name: Friend.name, schema: FriendsSchema}]),
    forwardRef(() => AuthModule)
  ],
  exports: [FriendsService]
})
export class FriendsModule {}
