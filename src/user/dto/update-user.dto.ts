import { PartialType } from '@nestjs/mapped-types';
import { RegisterDto } from './register.dto';
import { IsNumber, IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';
import { Gender } from '@prisma/client';
import { IsEnum } from 'class-validator';


export class UpdateUserDto extends PartialType(RegisterDto) {
    @IsNumber()
    @IsNotEmpty()
    id?: number
    @IsString()
    @MinLength(3)
    @MaxLength(20)
    @IsNotEmpty()
    username?: string

    @IsString()
    @MinLength(3)
    @MaxLength(20)
    @IsNotEmpty()
    password?: string

    @IsString()
    @MinLength(3)
    @MaxLength(20)
    @IsNotEmpty()
    name?: string

    @IsNumber()
    @IsNotEmpty()
    age?: number

    @IsString()
    @IsNotEmpty()
    @IsEnum(Gender)
    gender?: Gender
}
