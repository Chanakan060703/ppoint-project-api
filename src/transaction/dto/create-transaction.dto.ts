import { TransactionStatus, TransactionType } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator'

export class CreateTransactionDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  billId?: number

  @Type(() => Number)
  @IsInt()
  point: number

  @IsNotEmpty()
  @IsEnum(TransactionStatus)
  status: TransactionStatus

  @IsNotEmpty()
  @IsEnum(TransactionType)
  type: TransactionType
}
