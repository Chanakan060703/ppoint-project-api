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
import { OwnerOrAdminGuard } from '../auth/guards/owner-or-admin.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.userService.findAll()
  }

  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
  @Get(':id/points')
  getCurrentPoints(@Param('id') id: string) {
    return this.userService.getCurrentPoints(+id)
  }

  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findById(+id)
  }

  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id)
  }
}
