import { PartialType } from '@nestjs/mapped-types';
import { CreateUsertokenDto } from './create-usertoken.dto';

export class UpdateUsertokenDto extends PartialType(CreateUsertokenDto) {}
