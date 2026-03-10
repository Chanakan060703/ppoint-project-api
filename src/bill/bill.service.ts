import { Prisma } from '@prisma/client'
import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateBillDto } from './dto/create-bill.dto'
import { UpdateBillDto } from './dto/update-bill.dto'

const billSelect = {
  id: true,
  userId: true,
  name: true,
  price: true,
  discount: true,
  amount: true,
  point: true,
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
  transactions: {
    select: {
      id: true,
      userId: true,
      point: true,
      status: true,
      type: true,
      createdAt: true,
    },
  },
} satisfies Prisma.BillSelect

@Injectable()
export class BillService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createBillDto: CreateBillDto) {
    await this.ensureUserExists(createBillDto.userId)

    return this.prisma.bill.create({
      data: {
        user: { connect: { id: createBillDto.userId } },
        name: createBillDto.name,
        price: createBillDto.price,
        discount: createBillDto.discount,
        amount: createBillDto.amount,
        point: createBillDto.point,
      },
      select: billSelect,
    })
  }

  async findAll() {
    return this.prisma.bill.findMany({
      select: billSelect,
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async findOne(id: number) {
    const bill = await this.prisma.bill.findUnique({
      where: { id },
      select: billSelect,
    })

    if (!bill) {
      throw new NotFoundException(`Bill with id ${id} not found`)
    }

    return bill
  }

  async update(id: number, updateBillDto: UpdateBillDto) {
    await this.findOne(id)
    if (updateBillDto.userId !== undefined) {
      await this.ensureUserExists(updateBillDto.userId)
    }

    const data: Prisma.BillUpdateInput = {}

    if (updateBillDto.userId !== undefined) {
      data.user = { connect: { id: updateBillDto.userId } }
    }
    if (updateBillDto.name !== undefined) {
      data.name = updateBillDto.name
    }
    if (updateBillDto.price !== undefined) {
      data.price = updateBillDto.price
    }
    if (updateBillDto.discount !== undefined) {
      data.discount = updateBillDto.discount
    }
    if (updateBillDto.amount !== undefined) {
      data.amount = updateBillDto.amount
    }
    if (updateBillDto.point !== undefined) {
      data.point = updateBillDto.point
    }

    return this.prisma.bill.update({
      where: { id },
      data,
      select: billSelect,
    })
  }

  async remove(id: number) {
    await this.findOne(id)

    return this.prisma.bill.delete({
      where: { id },
      select: billSelect,
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
}
