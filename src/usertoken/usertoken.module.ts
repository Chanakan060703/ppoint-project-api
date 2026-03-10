import { Module } from '@nestjs/common';
import { UsertokenService } from './usertoken.service';
import { UsertokenController } from './usertoken.controller';

@Module({
  controllers: [UsertokenController],
  providers: [UsertokenService],
})
export class UsertokenModule {}
