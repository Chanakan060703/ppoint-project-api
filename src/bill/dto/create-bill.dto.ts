import { Type } from 'class-transformer'
import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator'

export class CreateBillDto {
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

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number

  @Type(() => Number)
  @IsInt()
  point: number
}
