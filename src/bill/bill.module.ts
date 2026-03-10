import { Module } from '@nestjs/common'
import { RolesGuard } from '../auth/guards/roles.guard'
import { PrismaService } from '../prisma/prisma.service'
import { BillController } from './bill.controller'
import { BillService } from './bill.service'

@Module({
  controllers: [BillController],
  providers: [BillService, PrismaService, RolesGuard],
})
export class BillModule {}
