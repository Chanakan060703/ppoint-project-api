import { Gender } from '@prisma/client'
import {
  IsEnum,
  IsInt,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'

export class RegisterDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username: string

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string

  @IsInt()
  @Min(1)
  age: number

  @IsEnum(Gender)
  gender: Gender
}
