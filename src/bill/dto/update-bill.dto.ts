import { PartialType } from '@nestjs/mapped-types'
import { CreateBillDto } from './create-bill.dto'
import { Type } from 'class-transformer'
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class UpdateBillDto extends PartialType(CreateBillDto) {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    userId: number

    @IsString()
    @IsNotEmpty()
    name: string

    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    price: number

    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    discount: number

    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    amount: number

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    point: number
}
