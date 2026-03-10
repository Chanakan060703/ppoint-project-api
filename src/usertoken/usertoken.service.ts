import { Injectable } from '@nestjs/common';
import { CreateUsertokenDto } from './dto/create-usertoken.dto';
import { UpdateUsertokenDto } from './dto/update-usertoken.dto';

@Injectable()
export class UsertokenService {
  create(createUsertokenDto: CreateUsertokenDto) {
    return 'This action adds a new usertoken';
  }

  findAll() {
    return `This action returns all usertoken`;
  }

  findOne(id: number) {
    return `This action returns a #${id} usertoken`;
  }

  update(id: number, updateUsertokenDto: UpdateUsertokenDto) {
    return `This action updates a #${id} usertoken`;
  }

  remove(id: number) {
    return `This action removes a #${id} usertoken`;
  }
}
