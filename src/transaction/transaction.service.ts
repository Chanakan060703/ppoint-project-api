import { Prisma } from '@prisma/client'
import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateTransactionDto } from './dto/create-transaction.dto'
import { UpdateTransactionDto } from './dto/update-transaction.dto'

const transactionSelect = {
  id: true,
  userId: true,
  billId: true,
  point: true,
  status: true,
  type: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
    },
  },
  bill: {
    select: {
      id: true,
      name: true,
      amount: true,
      point: true,
    },
  },
} satisfies Prisma.TransactionSelect

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createTransactionDto: CreateTransactionDto) {
    await this.ensureUserExists(createTransactionDto.userId)
    await this.ensureBillExists(createTransactionDto.billId)

    return this.prisma.transaction.create({
      data: {
        user: { connect: { id: createTransactionDto.userId } },
        ...(createTransactionDto.billId !== undefined
          ? { bill: { connect: { id: createTransactionDto.billId } } }
          : {}),
        point: createTransactionDto.point,
        status: createTransactionDto.status,
        type: createTransactionDto.type,
      },
      select: transactionSelect,
    })
  }

  async findAll() {
    return this.prisma.transaction.findMany({
      select: transactionSelect,
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async findOne(id: number) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      select: transactionSelect,
    })

    if (!transaction) {
      throw new NotFoundException(`Transaction with id ${id} not found`)
    }

    return transaction
  }

  async update(id: number, updateTransactionDto: UpdateTransactionDto) {
    await this.findOne(id)
    if (updateTransactionDto.userId !== undefined) {
      await this.ensureUserExists(updateTransactionDto.userId)
    }
    if (updateTransactionDto.billId !== undefined) {
      await this.ensureBillExists(updateTransactionDto.billId)
    }
    const data: Prisma.TransactionUpdateInput = {}
    if (updateTransactionDto.userId !== undefined) {
      data.user = { connect: { id: updateTransactionDto.userId } }
    }
    if (updateTransactionDto.billId !== undefined) {
      data.bill = { connect: { id: updateTransactionDto.billId } }
    }
    if (updateTransactionDto.point !== undefined) {
      data.point = updateTransactionDto.point
    }
    if (updateTransactionDto.status !== undefined) {
      data.status = updateTransactionDto.status
    }
    if (updateTransactionDto.type !== undefined) {
      data.type = updateTransactionDto.type
    }
    return this.prisma.transaction.update({
      where: { id },
      data,
      select: transactionSelect,
    })
  }

  async remove(id: number) {
    await this.findOne(id)

    return this.prisma.transaction.delete({
      where: { id },
      select: transactionSelect,
    })
  }

  private async ensureUserExists(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`)
    }
  }

  private async ensureBillExists(billId?: number) {
    if (billId === undefined) {
      return
    }

    const bill = await this.prisma.bill.findUnique({
      where: { id: billId },
      select: { id: true },
    })

    if (!bill) {
      throw new NotFoundException(`Bill with id ${billId} not found`)
    }
  }
}
