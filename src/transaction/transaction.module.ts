import { Module } from '@nestjs/common'
import { RolesGuard } from '../auth/guards/roles.guard'
import { PrismaService } from '../prisma/prisma.service'
import { TransactionController } from './transaction.controller'
import { TransactionService } from './transaction.service'

@Module({
  controllers: [TransactionController],
  providers: [TransactionService, PrismaService, RolesGuard],
})
export class TransactionModule {}
