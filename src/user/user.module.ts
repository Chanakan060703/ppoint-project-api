import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { OwnerOrAdminGuard } from '../auth/guards/owner-or-admin.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, RolesGuard, OwnerOrAdminGuard],
  exports: [UserService],
})
export class UserModule {}
