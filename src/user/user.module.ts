import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { RolesGuard } from '../auth/guards/roles.guard'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, RolesGuard],
  exports: [UserService],
})
export class UserModule {}
