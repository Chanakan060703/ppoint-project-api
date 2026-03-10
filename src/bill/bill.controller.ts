import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { Role } from '@prisma/client'
import { Roles } from '../auth/decorators/roles.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { BillService } from './bill.service'
import { CreateBillDto } from './dto/create-bill.dto'
import { UpdateBillDto } from './dto/update-bill.dto'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('bill')
export class BillController {
  constructor(private readonly billService: BillService) { }

  @Post()
  create(@Body() createBillDto: CreateBillDto) {
    return this.billService.create(createBillDto)
  }

  @Get()
  findAll() {
    return this.billService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.billService.findOne(+id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBillDto: UpdateBillDto) {
    return this.billService.update(+id, updateBillDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.billService.remove(+id)
  }
}
