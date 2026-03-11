import { Prisma, TransactionStatus, TransactionType } from '@prisma/client'
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
      pointTotal: true,
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
    const { userId, name, price, redeemPoint: requestedRedeemPoint } = createBillDto

    return this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { id: true, pointTotal: true },
        })

        if (!user) throw new NotFoundException(`ไม่พบผู้ใช้รหัส ${userId}`)

        const redeemPoint = Math.min(
          requestedRedeemPoint ?? user.pointTotal,
          user.pointTotal,
          Math.floor(price),
        )
        const discount = new Prisma.Decimal(redeemPoint)
        const amount = new Prisma.Decimal(price).sub(discount)
        const earnPoint = Math.floor(price * 0.1)

        const bill = await tx.bill.create({
          data: {
            userId,
            name,
            price,
            discount,
            amount,
            point: earnPoint,
          },
          select: { id: true },
        })

        if (redeemPoint > 0) {
          await tx.transaction.create({
            data: {
              userId,
              billId: bill.id,
              point: redeemPoint,
              status: TransactionStatus.SUCCESS,
              type: TransactionType.REDEEM,
            },
          })
        }

        if (earnPoint > 0) {
          await tx.transaction.create({
            data: {
              userId,
              billId: bill.id,
              point: earnPoint,
              status: TransactionStatus.SUCCESS,
              type: TransactionType.EARN,
            },
          })
        }

        const netPoint = earnPoint - redeemPoint

        if (netPoint !== 0) {
          await tx.user.update({
            where: { id: userId },
            data: {
              pointTotal:
                netPoint > 0
                  ? { increment: netPoint }
                  : { decrement: Math.abs(netPoint) },
            },
          })
        }

        return tx.bill.findUnique({
          where: { id: bill.id },
          select: billSelect,
        })
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    )
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
      throw new NotFoundException(`ไม่พบบิลรหัส ${id}`)
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
      throw new NotFoundException(`ไม่พบผู้ใช้รหัส ${userId}`)
    }
  }
}
