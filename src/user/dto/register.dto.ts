import { IsEnum, IsNumber, IsString, MaxLength, MinLength, IsNotEmpty, IsOptional } from "class-validator";
import { Role } from "@prisma/client";
import { Gender } from "@prisma/client";

export class RegisterDto {
    @IsString()
    @MinLength(3)
    @MaxLength(20)
    @IsNotEmpty()
    name: string

    @IsString()
    @MinLength(3)
    @MaxLength(20)
    @IsNotEmpty()
    username: string

    @IsString()
    @MinLength(3)
    @MaxLength(20)
    @IsNotEmpty()
    password: string

    @IsNumber()
    @IsNotEmpty()
    age: number

    @IsString()
    @IsNotEmpty()
    @IsEnum(Gender)
    gender: Gender

    @IsNumber()
    @IsOptional()
    pointTotal: number
}
