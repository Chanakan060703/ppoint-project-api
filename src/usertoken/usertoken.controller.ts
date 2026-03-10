import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsertokenService } from './usertoken.service';
import { CreateUsertokenDto } from './dto/create-usertoken.dto';
import { UpdateUsertokenDto } from './dto/update-usertoken.dto';

@Controller('usertoken')
export class UsertokenController {
  constructor(private readonly usertokenService: UsertokenService) {}

  @Post()
  create(@Body() createUsertokenDto: CreateUsertokenDto) {
    return this.usertokenService.create(createUsertokenDto);
  }

  @Get()
  findAll() {
    return this.usertokenService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usertokenService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsertokenDto: UpdateUsertokenDto) {
    return this.usertokenService.update(+id, updateUsertokenDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usertokenService.remove(+id);
  }
}
